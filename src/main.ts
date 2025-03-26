import { AggregateDailyNotesCommand } from './commands/aggregate-daily-notes';
import { App, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface NoteAggregatorSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: NoteAggregatorSettings = {
	mySetting: 'default'
}

export default class DailyNoteAggregatorPlugin extends Plugin {
	settings!: NoteAggregatorSettings;
	internalDateFormat = 'YYYY-MM-DD';

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.addCommand(new AggregateDailyNotesCommand(this));

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new NoteAggregatorSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class NoteAggregatorSettingTab extends PluginSettingTab {
	plugin: DailyNoteAggregatorPlugin;

	constructor(app: App, plugin: DailyNoteAggregatorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
