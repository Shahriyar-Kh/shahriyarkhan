/**
 * AdminProjectForm.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in replacement / addition for the admin project creation workflow.
 *
 * Usage:
 *   import { AdminProjectForm } from "@/components/AdminProjectForm";
 *   <AdminProjectForm onSaved={() => { ... }} />
 *
 * Requirements:
 *   - VITE_API_BASE_URL must be set
 *   - Admin must be logged in (uses stored token from localStorage key "admin_token")
 *   - Anthropic API key must be set in VITE_ANTHROPIC_KEY for AI generation
 *     (or proxy through your Django backend for production)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, type ChangeEvent } from "react";
import {
  Wand2, Save, X, Upload, Plus, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Loader2, FileText, Image as ImageIcon,
} from "lucide-react";
import { apiUrl } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectFormData {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  technologies: string;        // comma-separated
  live_url: string;
  github_url: string;
  tags: string;                // comma-separated
  featured: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  ai_summary: string;
  feature_bullets: string;     // newline-separated
}

const EMPTY_FORM: ProjectFormData = {
  title:             "",
  slug:              "",
  short_description: "",
  description:       "",
  technologies:      "",
  live_url:          "",
  github_url:        "",
  tags:              "",
  featured:          false,
  seo_title:         "",
  seo_description:   "",
  seo_keywords:      "",
  ai_summary:        "",
  feature_bullets:   "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getToken(): string {
  return localStorage.getItem("admin_token") ?? localStorage.getItem("token") ?? "";
}

// ─── AI generation via Anthropic API ─────────────────────────────────────────

async function generateWithAI(rawText: string): Promise<Partial<ProjectFormData>> {
  const apiKey = (import.meta as Record<string, Record<string, string>>).env?.VITE_ANTHROPIC_KEY ?? "";
  if (!apiKey) throw new Error("VITE_ANTHROPIC_KEY not set — cannot call Anthropic API directly.");

  const SYSTEM = `You are a senior software engineer writing premium portfolio project descriptions.
Given project notes/README/summary, extract and generate structured data.
Respond ONLY with valid JSON matching this exact schema (no markdown, no extra text):
{
  "title": "string — clear project title",
  "slug": "string — url-safe lowercase slug",
  "short_description": "string — 1 sentence, max 160 chars, SEO friendly",
  "description": "string — 3-5 paragraphs, technical and impressive, markdown-free",
  "technologies": "string — comma separated list of tech names",
  "ai_summary": "string — 1-2 sentence executive summary for case study",
  "seo_title": "string — max 60 chars, keyword rich",
  "seo_description": "string — max 160 chars, compelling meta description",
  "seo_keywords": "string — comma separated keywords",
  "feature_bullets": "string — 5-8 key features, one per line",
  "tags": "string — comma separated project tags"
}`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":         "application/json",
      "x-api-key":            apiKey,
      "anthropic-version":    "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system:     SYSTEM,
      messages:   [{ role: "user", content: `Generate portfolio data for this project:\n\n${rawText}` }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`AI request failed: ${err}`);
  }

  const data = await resp.json() as { content: { type: string; text: string }[] };
  const text = data.content.find(b => b.type === "text")?.text ?? "{}";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as Partial<ProjectFormData>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="apf-field-group">
      <label className="apf-label">{label}</label>
      {hint && <p className="apf-hint">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return <input className="apf-input" value={value} onChange={onChange} placeholder={placeholder} {...rest} />;
}

function TextArea({ value, onChange, rows = 4, placeholder = "" }: { value: string; onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; placeholder?: string }) {
  return <textarea className="apf-textarea" value={value} onChange={onChange} rows={rows} placeholder={placeholder} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AdminProjectFormProps {
  onSaved?: () => void;
  onCancel?: () => void;
  /** Existing project data for editing */
  initialData?: Partial<ProjectFormData & { id?: number }>;
}

export function AdminProjectForm({ onSaved, onCancel, initialData }: AdminProjectFormProps) {
  const [mode, setMode] = useState<"manual" | "ai">("manual");

  // form state
  const [form, setForm]               = useState<ProjectFormData>({ ...EMPTY_FORM, ...initialData });
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [detailImages, setDetailImages] = useState<File[]>([]);
  const [aiRawText, setAiRawText]      = useState("");
  const [aiFile, setAiFile]            = useState<File | null>(null);

  // UI state
  const [generating, setGenerating]    = useState(false);
  const [saving, setSaving]            = useState(false);
  const [saved, setSaved]              = useState(false);
  const [error, setError]              = useState("");
  const [seoOpen, setSeoOpen]          = useState(false);

  const previewInputRef  = useRef<HTMLInputElement>(null);
  const detailInputRef   = useRef<HTMLInputElement>(null);
  const aiFileInputRef   = useRef<HTMLInputElement>(null);

  // ── Field helpers ──────────────────────────────────────────────────────────
  const set = (key: keyof ProjectFormData, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    set("title", v);
    if (!form.slug || form.slug === slugify(form.title)) set("slug", slugify(v));
    if (!form.seo_title) set("seo_title", v.slice(0, 60));
  };

  // ── AI generation ──────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setError("");
    setGenerating(true);
    try {
      let rawText = aiRawText;

      // If file uploaded, read its text
      if (aiFile) {
        const text = await aiFile.text();
        rawText = text + "\n\n" + rawText;
      }

      if (!rawText.trim()) throw new Error("Please paste some project notes or upload a file.");

      const generated = await generateWithAI(rawText);

      setForm(f => ({
        ...f,
        title:             generated.title             ?? f.title,
        slug:              generated.slug              ?? f.slug,
        short_description: generated.short_description ?? f.short_description,
        description:       generated.description       ?? f.description,
        technologies:      generated.technologies      ?? f.technologies,
        ai_summary:        generated.ai_summary        ?? f.ai_summary,
        seo_title:         generated.seo_title         ?? f.seo_title,
        seo_description:   generated.seo_description   ?? f.seo_description,
        seo_keywords:      generated.seo_keywords      ?? f.seo_keywords,
        feature_bullets:   generated.feature_bullets   ?? f.feature_bullets,
        tags:              generated.tags              ?? f.tags,
      }));

      setSeoOpen(true); // show SEO section after AI fills it
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Image handling ─────────────────────────────────────────────────────────
  const handlePreviewImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(file);
  };

  const handleDetailImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setDetailImages(prev => [...prev, ...files]);
  };

  const removeDetailImage = (i: number) =>
    setDetailImages(prev => prev.filter((_, idx) => idx !== i));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.slug.trim())  { setError("Slug is required."); return; }

    setSaving(true);
    setError("");

    try {
      const token = getToken();
      const fd = new FormData();

      // Text fields
      (Object.keys(form) as (keyof ProjectFormData)[]).forEach(key => {
        fd.append(key, String(form[key]));
      });

      // Images
      if (previewImage) fd.append("preview_image", previewImage);
      detailImages.forEach(img => fd.append("detail_images", img));

      const isEdit = Boolean(initialData && "id" in initialData && initialData.id);
      const endpoint = isEdit
        ? apiUrl(`/api/v1/admin/portfolio/projects/${initialData?.id}/`)
        : apiUrl("/api/v1/admin/portfolio/projects/");

      const resp = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { Authorization: `Token ${token}` },
        body: fd,
      });

      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || `Server error ${resp.status}`);
      }

      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved?.(); }, 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="apf-shell">
      {/* ── Mode tabs ── */}
      <div className="apf-mode-tabs">
        <button
          className={`apf-mode-tab ${mode === "manual" ? "apf-mode-tab--active" : ""}`}
          onClick={() => setMode("manual")}
        >
          <FileText size={15} /> Manual Entry
        </button>
        <button
          className={`apf-mode-tab ${mode === "ai" ? "apf-mode-tab--active" : ""}`}
          onClick={() => setMode("ai")}
        >
          <Wand2 size={15} /> AI-Assisted
        </button>
      </div>

      {/* ── AI mode panel ── */}
      {mode === "ai" && (
        <div className="apf-ai-panel">
          <div className="apf-ai-panel__header">
            <Wand2 size={18} />
            <div>
              <h3 className="apf-ai-panel__title">AI Project Generator</h3>
              <p className="apf-ai-panel__sub">Paste README, notes, or a project summary — AI fills all fields automatically.</p>
            </div>
          </div>

          <FieldGroup label="Upload README / Notes File" hint="Optional — .txt, .md, or any text file">
            <div className="apf-file-drop" onClick={() => aiFileInputRef.current?.click()}>
              <Upload size={20} />
              <span>{aiFile ? aiFile.name : "Click to upload or drag & drop"}</span>
              {aiFile && (
                <button className="apf-file-remove" onClick={e => { e.stopPropagation(); setAiFile(null); }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <input ref={aiFileInputRef} type="file" accept=".txt,.md,.markdown,.rst,.text" className="apf-hidden-input" onChange={e => setAiFile(e.target.files?.[0] ?? null)} />
          </FieldGroup>

          <FieldGroup label="Project Notes / Prompt" hint="Paste raw project description, README content, or notes">
            <TextArea
              value={aiRawText}
              onChange={e => setAiRawText(e.target.value)}
              rows={8}
              placeholder="Paste your project README, summary, or notes here. The AI will generate title, descriptions, SEO metadata, feature bullets, and more..."
            />
          </FieldGroup>

          <button
            className="apf-generate-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? <><Loader2 size={16} className="apf-spin" /> Generating...</> : <><Wand2 size={16} /> Generate with AI</>}
          </button>

          {!generating && (form.title || form.description) && (
            <div className="apf-ai-success">
              <CheckCircle2 size={15} />
              AI generation complete — review and edit the fields below, then save.
            </div>
          )}
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="apf-error">
          <AlertCircle size={15} />
          <span>{error}</span>
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* ── Core fields ── */}
      <div className="apf-section">
        <h3 className="apf-section-title">Project Information</h3>

        <div className="apf-grid-2">
          <FieldGroup label="Project Title *">
            <TextInput value={form.title} onChange={handleTitleChange} placeholder="e.g. NoteAssist AI — Productivity Platform" />
          </FieldGroup>
          <FieldGroup label="URL Slug *" hint="Auto-generated from title">
            <TextInput value={form.slug} onChange={e => set("slug", slugify(e.target.value))} placeholder="e.g. noteassist-ai-productivity-platform" />
          </FieldGroup>
        </div>

        <FieldGroup label="Short Description" hint="1 sentence — shown on project cards (max 160 chars)">
          <TextInput value={form.short_description} onChange={e => set("short_description", e.target.value)} placeholder="Brief summary for cards and SEO" maxLength={200} />
        </FieldGroup>

        <FieldGroup label="Full Description" hint="3-5 paragraphs — shown on the project detail page">
          <TextArea value={form.description} onChange={e => set("description", e.target.value)} rows={8} placeholder="Detailed case study description — overview, challenges, solution, outcome..." />
        </FieldGroup>

        <div className="apf-grid-2">
          <FieldGroup label="Technologies Used" hint="Comma-separated: Django, React, PostgreSQL">
            <TextInput value={form.technologies} onChange={e => set("technologies", e.target.value)} placeholder="Django, DRF, React.js, PostgreSQL, Redis" />
          </FieldGroup>
          <FieldGroup label="Tags" hint="Comma-separated: backend, ai, saas">
            <TextInput value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="backend, full-stack, ai" />
          </FieldGroup>
        </div>

        <div className="apf-grid-2">
          <FieldGroup label="Live URL">
            <TextInput value={form.live_url} onChange={e => set("live_url", e.target.value)} placeholder="https://yourproject.vercel.app" type="url" />
          </FieldGroup>
          <FieldGroup label="GitHub URL">
            <TextInput value={form.github_url} onChange={e => set("github_url", e.target.value)} placeholder="https://github.com/Shahriyar-Kh/..." type="url" />
          </FieldGroup>
        </div>

        <FieldGroup label="AI Summary" hint="1-2 sentence executive summary for case study pages">
          <TextInput value={form.ai_summary} onChange={e => set("ai_summary", e.target.value)} placeholder="A productivity platform that turns note creation into a smooth AI-assisted workflow." />
        </FieldGroup>

        <FieldGroup label="Feature Bullets" hint="Key features, one per line — shown on detail page">
          <TextArea value={form.feature_bullets} onChange={e => set("feature_bullets", e.target.value)} rows={6} placeholder={"AI note generation and enhancement\nSecure JWT authentication with RBAC\nPostgreSQL database with Redis caching\nFull responsive UI with React.js"} />
        </FieldGroup>

        <div className="apf-checkbox-row">
          <input type="checkbox" id="featured" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="apf-checkbox" />
          <label htmlFor="featured" className="apf-checkbox-label">Mark as Featured Project (shown first on homepage)</label>
        </div>
      </div>

      {/* ── SEO section (collapsible) ── */}
      <div className="apf-section">
        <button className="apf-section-toggle" onClick={() => setSeoOpen(o => !o)}>
          <h3 className="apf-section-title" style={{ margin: 0 }}>SEO Metadata</h3>
          {seoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {seoOpen && (
          <div className="apf-collapsible">
            <FieldGroup label="SEO Title" hint="Max 60 chars — appears in search results">
              <TextInput value={form.seo_title} onChange={e => set("seo_title", e.target.value)} placeholder="ProjectName — Python Developer Portfolio | Shahriyar Khan" maxLength={70} />
              <span className="apf-char-count">{form.seo_title.length}/60</span>
            </FieldGroup>

            <FieldGroup label="Meta Description" hint="Max 160 chars — shown in search snippets">
              <TextArea value={form.seo_description} onChange={e => set("seo_description", e.target.value)} rows={3} placeholder="Full-stack AI productivity platform built with Django, React, and PostgreSQL by Shahriyar Khan..." />
              <span className="apf-char-count">{form.seo_description.length}/160</span>
            </FieldGroup>

            <FieldGroup label="SEO Keywords" hint="Comma-separated keywords">
              <TextInput value={form.seo_keywords} onChange={e => set("seo_keywords", e.target.value)} placeholder="Shahriyar Khan project, Django developer, Python backend, AI productivity app" />
            </FieldGroup>
          </div>
        )}
      </div>

      {/* ── Images section ── */}
      <div className="apf-section">
        <h3 className="apf-section-title">Project Images</h3>

        <FieldGroup label="Card Preview Image" hint="Used on project cards — one image, ideally 16:9 or square">
          <div className="apf-file-drop apf-file-drop--image" onClick={() => previewInputRef.current?.click()}>
            {previewImage
              ? <><ImageIcon size={16} /><span>{previewImage.name}</span><button className="apf-file-remove" onClick={e => { e.stopPropagation(); setPreviewImage(null); }}><X size={13} /></button></>
              : <><Upload size={18} /><span>Click to upload card preview image</span></>
            }
          </div>
          <input ref={previewInputRef} type="file" accept="image/*" className="apf-hidden-input" onChange={handlePreviewImage} />
        </FieldGroup>

        <FieldGroup label="Detail Page Images" hint="Multiple screenshots shown in case study gallery">
          <div className="apf-detail-images">
            {detailImages.map((img, i) => (
              <div key={i} className="apf-detail-image-item">
                <ImageIcon size={13} />
                <span>{img.name}</span>
                <button onClick={() => removeDetailImage(i)}><Trash2 size={12} /></button>
              </div>
            ))}
            <button className="apf-add-image-btn" onClick={() => detailInputRef.current?.click()}>
              <Plus size={16} /> Add Images
            </button>
          </div>
          <input ref={detailInputRef} type="file" accept="image/*" multiple className="apf-hidden-input" onChange={handleDetailImages} />
        </FieldGroup>
      </div>

      {/* ── Action buttons ── */}
      <div className="apf-actions">
        {onCancel && (
          <button className="apf-btn-cancel" onClick={onCancel}>
            <X size={15} /> Cancel
          </button>
        )}
        <button className="apf-btn-save" onClick={handleSave} disabled={saving || saved}>
          {saved
            ? <><CheckCircle2 size={15} /> Saved!</>
            : saving
            ? <><Loader2 size={15} className="apf-spin" /> Saving...</>
            : <><Save size={15} /> Save Project</>
          }
        </button>
      </div>
    </div>
  );
}