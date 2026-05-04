import { SECTIONS } from "./types";
import type { Section, ThoughtItem } from "./types";

const FRONTMATTER = "---\ntype: thoughts-master\n---";

export function formatDate(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const yy = d.getFullYear() % 100;
  return `${m}/${day}/${yy.toString().padStart(2, "0")}`;
}

export function buildSkeleton(): string {
  const headings = SECTIONS.map((s) => `## ${s}\n`).join("\n");
  return `${FRONTMATTER}\n\n${headings}`;
}

export function renderBullet(item: ThoughtItem, capturedAt: Date): string {
  return `- ${formatDate(capturedAt)} — ${item.text.trim()}\n`;
}

export function insertAtTopOfSection(
  content: string,
  section: Section,
  bullet: string
): string {
  const ensured = ensureSkeleton(content);
  const { frontmatter, body } = splitFrontmatter(ensured);
  const headingText = `## ${section}`;
  const headingRegex = new RegExp(`^${escapeRegex(headingText)}[ \\t]*$`, "m");

  const match = headingRegex.exec(body);
  if (match) {
    const idx = match.index + match[0].length;
    const insertAt = body.charAt(idx) === "\n" ? idx + 1 : idx;
    return frontmatter + body.slice(0, insertAt) + bullet + body.slice(insertAt);
  }

  const trailing = body.endsWith("\n") ? "" : "\n";
  return `${frontmatter}${body}${trailing}\n${headingText}\n${bullet}`;
}

function ensureSkeleton(content: string): string {
  if (!content.trim()) return buildSkeleton();
  const { frontmatter, body } = splitFrontmatter(content);
  const fmPart = frontmatter || `${FRONTMATTER}\n`;
  let result = body;
  for (const s of SECTIONS) {
    const headingRegex = new RegExp(`^## ${escapeRegex(s)}[ \\t]*$`, "m");
    if (!headingRegex.test(result)) {
      const trailing = result.endsWith("\n") ? "" : "\n";
      result = `${result}${trailing}\n## ${s}\n`;
    }
  }
  if (!body.startsWith("\n") && !fmPart.endsWith("\n\n")) {
    return `${fmPart}\n${result}`;
  }
  return `${fmPart}${result}`;
}

function splitFrontmatter(content: string): { frontmatter: string; body: string } {
  const match = content.match(/^---\n[\s\S]*?\n---\n?/);
  if (!match) return { frontmatter: "", body: content };
  return { frontmatter: match[0], body: content.slice(match[0].length) };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
