import { App, PluginSettingTab, Setting } from "obsidian";
import type ThoughtCapturePlugin from "../main";
import type { Section } from "./types";

export interface ThoughtCaptureSettings {
  openaiApiKey: string;
  anthropicApiKey: string;
  thoughtsFilePath: string;
  showAnotherAfterSave: boolean;
  openSavedFileAfterSave: boolean;
  lastUsedSection: Section;
  customAcronyms: string;
}

export const DEFAULT_SETTINGS: ThoughtCaptureSettings = {
  openaiApiKey: "",
  anthropicApiKey: "",
  thoughtsFilePath: "09 Thoughts/Thoughts.md",
  showAnotherAfterSave: true,
  openSavedFileAfterSave: true,
  lastUsedSection: "Self-Improvement",
  customAcronyms: "CalWORKs, VPSS, FJG",
};

export class ThoughtCaptureSettingTab extends PluginSettingTab {
  plugin: ThoughtCapturePlugin;

  constructor(app: App, plugin: ThoughtCapturePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Thought Capture" });

    new Setting(containerEl)
      .setName("Thoughts file path")
      .setDesc("Single master file for all captured thoughts (relative to vault root).")
      .addText((t) =>
        t
          .setPlaceholder("09 Thoughts/Thoughts.md")
          .setValue(this.plugin.settings.thoughtsFilePath)
          .onChange(async (v) => {
            this.plugin.settings.thoughtsFilePath = v.trim() || DEFAULT_SETTINGS.thoughtsFilePath;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show another after save")
      .setDesc("After saving a thought, immediately reopen the capture modal.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.showAnotherAfterSave).onChange(async (v) => {
          this.plugin.settings.showAnotherAfterSave = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Open saved file after save")
      .setDesc("After saving a thought, open the exact thoughts file that was changed.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.openSavedFileAfterSave).onChange(async (v) => {
          this.plugin.settings.openSavedFileAfterSave = v;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl("h3", { text: "Voice transcription & AI copy-edit" });

    new Setting(containerEl)
      .setName("OpenAI API key")
      .setDesc("Used by Whisper to transcribe voice captures. Stored locally in plugin data.")
      .addText((t) => {
        t.inputEl.type = "password";
        t
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.openaiApiKey)
          .onChange(async (v) => {
            this.plugin.settings.openaiApiKey = v.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Anthropic API key")
      .setDesc("Used by Claude Haiku to copy-edit captures (clean grammar, preserve meaning). Optional — without it, the raw text is saved as-is.")
      .addText((t) => {
        t.inputEl.type = "password";
        t
          .setPlaceholder("sk-ant-...")
          .setValue(this.plugin.settings.anthropicApiKey)
          .onChange(async (v) => {
            this.plugin.settings.anthropicApiKey = v.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Custom acronyms")
      .setDesc("Comma-separated acronyms and proper nouns the copy-edit pass should preserve verbatim.")
      .addText((t) =>
        t
          .setPlaceholder("CalWORKs, VPSS, FJG")
          .setValue(this.plugin.settings.customAcronyms)
          .onChange(async (v) => {
            this.plugin.settings.customAcronyms = v;
            await this.plugin.saveSettings();
          })
      );
  }
}
