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
    const openCapture = () => new CaptureModal(this.app, this).open();

    this.addRibbonIcon("lightbulb", "Capture thought", openCapture);

    this.addCommand({
      id: "capture",
      name: "Capture thought",
      callback: openCapture,
    });

    this.registerObsidianProtocolHandler("thought-capture", openCapture);

    this.app.workspace.onLayoutReady(() => {
      this.recoverMissedAdvancedUriLaunch(openCapture);
    });

    this.addSettingTab(new ThoughtCaptureSettingTab(this.app, this));
  }

  private recoverMissedAdvancedUriLaunch(openCapture: () => void) {
    const advancedUri = (this.app as any).plugins?.getPlugin?.("obsidian-advanced-uri");
    if (advancedUri?.lastParameters?.commandid === `${this.manifest.id}:capture`) {
      setTimeout(openCapture, 250);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
