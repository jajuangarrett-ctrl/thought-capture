import { Plugin } from "obsidian";
import {
  ThoughtCaptureSettings,
  ThoughtCaptureSettingTab,
  DEFAULT_SETTINGS,
} from "./src/settings";
import { CaptureModal } from "./src/CaptureModal";

export default class ThoughtCapturePlugin extends Plugin {
  settings: ThoughtCaptureSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon("lightbulb", "Capture thought", () => {
      new CaptureModal(this.app, this).open();
    });

    this.addCommand({
      id: "capture",
      name: "Capture thought",
      callback: () => new CaptureModal(this.app, this).open(),
    });

    this.registerObsidianProtocolHandler("thought-capture", () => {
      new CaptureModal(this.app, this).open();
    });

    this.addSettingTab(new ThoughtCaptureSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
