import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type RouterContextValue = {
  pathname: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

function getPathname() {
  return window.location.pathname || "/";
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState(() => getPathname());

  useEffect(() => {
    const handlePopState = () => setPathname(getPathname());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useMemo(
    () => (to: string, options?: { replace?: boolean }) => {
      if (to === pathname) return;

      if (options?.replace) {
        window.history.replaceState({}, "", to);
      } else {
        window.history.pushState({}, "", to);
      }

      setPathname(getPathname());
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pathname]
  );

  return <RouterContext.Provider value={{ pathname, navigate }}>{children}</RouterContext.Provider>;
}

export function useLocation() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useLocation must be used within RouterProvider");
  }

  return { pathname: context.pathname };
}

export function Link({ to, activeClassName, exact = false, className, onClick, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; activeClassName?: string; exact?: boolean; }) {
  const context = useContext(RouterContext);
  const pathname = context?.pathname ?? "";
  const navigate = context?.navigate ?? (() => {});
  const isExternal = /^https?:\/\//i.test(to);
  const isActive = !isExternal && (exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`));
  const composedClassName = [className, isActive && activeClassName].filter(Boolean).join(" ");

  return (
    <a
      href={to}
      className={composedClassName || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || isExternal || rest.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }

        event.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
