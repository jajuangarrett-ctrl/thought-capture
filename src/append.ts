import { App, normalizePath, TFile } from "obsidian";
import { insertAtTopOfSection, renderBullet } from "./markdown";
import type { ThoughtItem } from "./types";

export async function appendThought(
  app: App,
  filePath: string,
  item: ThoughtItem,
  capturedAt: Date = new Date()
): Promise<string> {
  const path = normalizePath(filePath);
  await ensureParentFolder(app, path);
  const bullet = renderBullet(item, capturedAt);
  const file = app.vault.getAbstractFileByPath(path);

  if (file instanceof TFile) {
    const current = await app.vault.read(file);
    const next = insertAtTopOfSection(current, item.section, bullet);
    await app.vault.modify(file, next);
    return path;
  }

  const seeded = insertAtTopOfSection("", item.section, bullet);
  await app.vault.create(path, seeded);
  return path;
}

async function ensureParentFolder(app: App, path: string): Promise<void> {
  const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  if (!parent) return;
  const normalized = normalizePath(parent);
  if (!app.vault.getAbstractFileByPath(normalized)) {
    await app.vault.createFolder(normalized);
  }
}
