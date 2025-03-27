import { NoteAggregatorSettings, DEFAULT_SETTINGS } from 'classes/note-aggregator-settings';
import { AggregateDailyNotesCommand } from './commands/aggregate-daily-notes';
import { Plugin } from 'obsidian';
import { NoteAggregatorSettingsTab } from 'modals/note-aggregator-settings-tab';

export default class DailyNoteAggregatorPlugin extends Plugin {
	settings!: NoteAggregatorSettings;
	readonly internalDateFormat = 'YYYY-MM-DD';

	async onload() {
		await this.loadSettings();

		this.addCommand(new AggregateDailyNotesCommand(this));

		this.addSettingTab(new NoteAggregatorSettingsTab(this.app, this));
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
