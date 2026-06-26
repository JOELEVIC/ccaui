import type { ReactNode } from "react";

/* ── type badge meta ─────────────────────────────────────────────────────── */
export function activityTypeMeta(type: string): { label: string; color: string } {
  switch (type) {
    case "ANNOUNCEMENT":
      return { label: "Announcement", color: "#C5A059" };
    case "EVENT_RECAP":
      return { label: "Event recap", color: "#2E7D5B" };
    case "RESULT":
      return { label: "Results", color: "#6A3FB5" };
    case "GALLERY":
      return { label: "Gallery", color: "#0F8A99" };
    default:
      return { label: "Article", color: "#5B6770" };
  }
}

export function formatActivityDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Normalize a YouTube/Vimeo URL to an embeddable iframe src. */
export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return null;
  }
}

export function parseBody(bodyJson: string | null | undefined): TiptapNode | null {
  if (!bodyJson) return null;
  try {
    return JSON.parse(bodyJson) as TiptapNode;
  } catch {
    return null;
  }
}

/* ── Tiptap JSON → React (dependency-free) ───────────────────────────────── */
interface Mark {
  type: string;
  attrs?: { href?: string };
}
interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: Mark[];
  attrs?: { level?: number; src?: string; alt?: string };
}

function applyMarks(text: string, marks: Mark[] | undefined, key: number): ReactNode {
  let node: ReactNode = text;
  for (const m of marks ?? []) {
    switch (m.type) {
      case "bold":
        node = <strong key={`b${key}`}>{node}</strong>;
        break;
      case "italic":
        node = <em key={`i${key}`}>{node}</em>;
        break;
      case "underline":
        node = <u key={`u${key}`}>{node}</u>;
        break;
      case "strike":
        node = <s key={`s${key}`}>{node}</s>;
        break;
      case "code":
        node = <code key={`c${key}`}>{node}</code>;
        break;
      case "link":
        node = (
          <a key={`a${key}`} href={m.attrs?.href ?? "#"} target="_blank" rel="noopener noreferrer">
            {node}
          </a>
        );
        break;
    }
  }
  return node;
}

function renderNodes(nodes: TiptapNode[] | undefined): ReactNode[] {
  return (nodes ?? []).map((n, i) => renderNode(n, i));
}

function renderNode(node: TiptapNode, key: number): ReactNode {
  switch (node.type) {
    case "doc":
      return <>{renderNodes(node.content)}</>;
    case "paragraph":
      return <p key={key}>{renderNodes(node.content)}</p>;
    case "heading": {
      const lvl = Math.min(Math.max(node.attrs?.level ?? 2, 1), 4);
      const inner = renderNodes(node.content);
      if (lvl === 1) return <h1 key={key}>{inner}</h1>;
      if (lvl === 3) return <h3 key={key}>{inner}</h3>;
      if (lvl === 4) return <h4 key={key}>{inner}</h4>;
      return <h2 key={key}>{inner}</h2>;
    }
    case "bulletList":
      return <ul key={key}>{renderNodes(node.content)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderNodes(node.content)}</ol>;
    case "listItem":
      return <li key={key}>{renderNodes(node.content)}</li>;
    case "blockquote":
      return <blockquote key={key}>{renderNodes(node.content)}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{renderNodes(node.content)}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={key} src={node.attrs?.src ?? ""} alt={node.attrs?.alt ?? ""} />;
    case "text":
      return <span key={key}>{applyMarks(node.text ?? "", node.marks, key)}</span>;
    default:
      return <>{renderNodes(node.content)}</>;
  }
}

export function renderTiptap(doc: TiptapNode | null): ReactNode {
  if (!doc) return null;
  return renderNode(doc, 0);
}
