import { describe, it, expect } from "vitest";
import {
  buildSkeleton,
  insertAtTopOfSection,
  renderBullet,
} from "./markdown";
import type { ThoughtItem } from "./types";

describe("buildSkeleton", () => {
  it("creates a file with frontmatter and all six section headings", () => {
    expect(buildSkeleton()).toBe(
      "---\ntype: thoughts-master\n---\n\n" +
        "## Self-Improvement\n\n" +
        "## Professional Insights\n\n" +
        "## Teaching Insights\n\n" +
        "## AI Building Insights\n\n" +
        "## Health & Wellness\n\n" +
        "## Other\n"
    );
  });
});

describe("renderBullet", () => {
  it("renders a date-free running-list bullet", () => {
    const item: ThoughtItem = { section: "Self-Improvement", text: "Read 30 min daily" };
    expect(renderBullet(item)).toBe("- Read 30 min daily\n\n");
  });

  it("trims whitespace from the text", () => {
    const item: ThoughtItem = { section: "Other", text: "  spacy thought  " };
    expect(renderBullet(item)).toBe("- spacy thought\n\n");
  });

  it("indents multiline text so it stays inside one thought bullet", () => {
    const item: ThoughtItem = {
      section: "Other",
      text: "Key takeaways\n- first\n\nplain follow-up",
    };
    expect(renderBullet(item)).toBe(
      "- Key takeaways\n  - first\n\n  plain follow-up\n\n"
    );
  });

  it("formats a leading Markdown heading as an inline bold title", () => {
    const item: ThoughtItem = {
      section: "AI Building Insights",
      text: "# Agent design lesson\nKeep tools narrowly scoped",
    };
    expect(renderBullet(item)).toBe(
      "- **Agent design lesson**\n  Keep tools narrowly scoped\n\n"
    );
  });
});

describe("insertAtTopOfSection", () => {
  const bullet = "- new thought\n\n";

  it("creates skeleton + bullet under the chosen section when file is empty", () => {
    expect(insertAtTopOfSection("", "Self-Improvement", bullet)).toBe(
      "---\ntype: thoughts-master\n---\n\n" +
        "## Self-Improvement\n- new thought\n\n" +
        "## Professional Insights\n\n" +
        "## Teaching Insights\n\n" +
        "## AI Building Insights\n\n" +
        "## Health & Wellness\n\n" +
        "## Other\n"
    );
  });

  it("inserts at the TOP of the chosen section when section already has bullets", () => {
    const existing =
      "---\ntype: thoughts-master\n---\n\n" +
      "## Self-Improvement\n- 5/3/26 — earlier thought\n\n" +
      "## Professional Insights\n\n" +
      "## Teaching Insights\n\n" +
      "## AI Building Insights\n\n" +
      "## Health & Wellness\n\n" +
      "## Other\n";
    expect(insertAtTopOfSection(existing, "Self-Improvement", bullet)).toBe(
      "---\ntype: thoughts-master\n---\n\n" +
        "## Self-Improvement\n- new thought\n\n- earlier thought\n\n" +
        "## Professional Insights\n\n" +
        "## Teaching Insights\n\n" +
        "## AI Building Insights\n\n" +
        "## Health & Wellness\n\n" +
        "## Other\n"
    );
  });

  it("inserts under the correct section when multiple sections have content", () => {
    const existing =
      "---\ntype: thoughts-master\n---\n\n" +
      "## Self-Improvement\n- 5/3/26 — alpha\n\n" +
      "## Professional Insights\n- 5/3/26 — beta\n\n" +
      "## Teaching Insights\n\n" +
      "## AI Building Insights\n\n" +
      "## Health & Wellness\n\n" +
      "## Other\n";
    const out = insertAtTopOfSection(existing, "Professional Insights", bullet);
    expect(out).toContain(
      "## Professional Insights\n- new thought\n\n- beta\n"
    );
    expect(out).toContain("## Self-Improvement\n- alpha\n");
  });

  it("inserts into the Other section", () => {
    const existing = buildSkeleton();
    const out = insertAtTopOfSection(existing, "Other", bullet);
    expect(out).toContain("## Other\n- new thought\n");
  });

  it("preserves unrelated frontmatter keys", () => {
    const existing =
      "---\ntype: thoughts-master\nfoo: bar\n---\n\n" +
      "## Self-Improvement\n\n## Professional Insights\n\n## Teaching Insights\n\n## AI Building Insights\n\n## Health & Wellness\n\n## Other\n";
    const out = insertAtTopOfSection(existing, "Self-Improvement", bullet);
    expect(out.startsWith("---\ntype: thoughts-master\nfoo: bar\n---\n")).toBe(true);
    expect(out).toContain("## Self-Improvement\n- new thought\n");
  });

  it("adds canonical frontmatter if the file has none", () => {
    const existing =
      "## Self-Improvement\n\n## Professional Insights\n\n## Teaching Insights\n\n## AI Building Insights\n\n## Health & Wellness\n\n## Other\n";
    const out = insertAtTopOfSection(existing, "Self-Improvement", bullet);
    expect(out.startsWith("---\ntype: thoughts-master\n---\n")).toBe(true);
    expect(out).toContain("## Self-Improvement\n- new thought\n");
  });

  it("appends a missing section at the end if it doesn't exist yet", () => {
    const existing =
      "---\ntype: thoughts-master\n---\n\n" +
      "## Self-Improvement\n- 5/3/26 — alpha\n";
    const out = insertAtTopOfSection(existing, "Other", bullet);
    expect(out).toContain("## Self-Improvement\n- alpha\n");
    expect(out).toContain("## Other\n- new thought\n");
  });

  it("does NOT alter sibling sections' content order", () => {
    const existing =
      "---\ntype: thoughts-master\n---\n\n" +
      "## Self-Improvement\n- 5/3/26 — alpha\n- 5/2/26 — older\n\n" +
      "## Professional Insights\n\n## Teaching Insights\n\n## AI Building Insights\n\n## Health & Wellness\n\n## Other\n";
    const out = insertAtTopOfSection(existing, "Professional Insights", bullet);
    expect(out).toContain("- alpha\n\n- older\n");
  });

  it("inserts into the Teaching Insights section", () => {
    const existing = buildSkeleton();
    const out = insertAtTopOfSection(existing, "Teaching Insights", bullet);
    expect(out).toContain("## Teaching Insights\n- new thought\n");
  });

  it("inserts into the AI Building Insights section", () => {
    const existing = buildSkeleton();
    const out = insertAtTopOfSection(existing, "AI Building Insights", bullet);
    expect(out).toContain("## AI Building Insights\n- new thought\n");
  });

  it("preserves custom headings and manually maintained content", () => {
    const existing =
      "---\ntype: thoughts-master\n---\n\n" +
      "## Self-Improvement\n" +
      "- 5/3/26 — A captured thought\n\n" +
      "Manual standalone note\n\n" +
      "## Custom Notes\n" +
      "Keep this outside the capture\n";
    const out = insertAtTopOfSection(existing, "Professional Insights", bullet);
    expect(out).toContain("\nManual standalone note\n\n## Custom Notes\n");
    expect(out).toContain("## Custom Notes\nKeep this outside the capture\n");
    expect(out).not.toContain("  ## Custom Notes");
  });

  it("does not double-indent already formatted continuation lines", () => {
    const existing =
      "---\ntype: thoughts-master\n---\n\n" +
      "## Other\n" +
      "- 5/3/26 — First paragraph\n\n" +
      "  Existing continuation\n";
    const out = insertAtTopOfSection(existing, "Other", bullet);
    expect(out).toContain(
      "- First paragraph\n\n  Existing continuation\n"
    );
    expect(out).not.toContain("    Existing continuation");
  });

  it("normalizes legacy duplicate frontmatter and glued section headings", () => {
    const existing =
      "---\ntype: thoughts-master\n---\r\n\r\n" +
      "---\r\ntype: thoughts-master\r\n---\r\n\r\n" +
      "## Other- 6/26/26 — glued thought\r\n\r\n" +
      "## Other\r\n- 6/30/26 — later thought\r\n";
    const out = insertAtTopOfSection(existing, "Other", bullet);
    expect(out.match(/type: thoughts-master/g)).toHaveLength(1);
    expect(out.match(/^## Other$/gm)).toHaveLength(1);
    expect(out).not.toContain("## Other-");
    expect(out).toContain(
      "## Other\n- new thought\n\n- glued thought\n\n- later thought\n"
    );
  });
});
