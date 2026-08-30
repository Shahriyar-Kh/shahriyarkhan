/**
 * Pure route-matching logic extracted from App.tsx so it can be unit
 * tested without rendering React. This is the same router (a single
 * pathname -> page mapping) - it is not a second, competing router.
 *
 * Because RouterProvider (src/lib/navigation.tsx) always derives the
 * initial route from window.location.pathname on mount, this function
 * resolves a "fresh direct load" of a URL exactly the same way it
 * resolves an in-app navigation to that same URL.
 */
export type RouteMatch =
	| { name: "home" }
	| { name: "about" }
	| { name: "skills" }
	| { name: "services" }
	| { name: "projects" }
	| { name: "project-detail"; slug: string }
	| { name: "resume" }
	| { name: "contact" }
	| { name: "not-found" };

export function matchRoute(pathname: string): RouteMatch {
	if (pathname === "/") return { name: "home" };
	if (pathname === "/about") return { name: "about" };
	if (pathname === "/skills") return { name: "skills" };
	if (pathname === "/services") return { name: "services" };
	if (pathname === "/projects") return { name: "projects" };
	if (pathname === "/resume") return { name: "resume" };
	if (pathname === "/contact") return { name: "contact" };

	const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
	if (projectMatch) {
		return { name: "project-detail", slug: decodeURIComponent(projectMatch[1]) };
	}

	return { name: "not-found" };
}
