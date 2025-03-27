import { DEFAULT_SETTINGS } from 'classes/note-aggregator-settings';
import DailyNoteAggregatorPlugin from 'main';
import { PluginSettingTab, App, Setting } from 'obsidian';

export class NoteAggregatorSettingsTab extends PluginSettingTab {
	plugin: DailyNoteAggregatorPlugin;

	constructor(app: App, plugin: DailyNoteAggregatorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Report Header')
			.setDesc('This is the header of the report')
			.addText(text => text
				.setPlaceholder('Enter your report header')
				.setValue(this.plugin.settings.reportHeader)
				.onChange(async (value) => {
					this.plugin.settings.reportHeader = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Date Display')
			.setDesc('This is the date display format in the report')
			.addMomentFormat(text => text
				.setPlaceholder(DEFAULT_SETTINGS.dateDisplay)
				.setValue(this.plugin.settings.dateDisplay)
				.onChange(async (value) => {
					this.plugin.settings.dateDisplay = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Start Date Distance')
			.setDesc('This is the number of days in the past that the first day in the report will be.')
			.addText(number => {
				number.inputEl.type = 'number';
				number.setPlaceholder(DEFAULT_SETTINGS.startDateDistance.toString());
				number.setValue(this.plugin.settings.startDateDistance.toString());
				number.onChange(async (value) => {
					this.plugin.settings.startDateDistance = (value != '') ? parseInt(value) : DEFAULT_SETTINGS.startDateDistance;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('End Date Distance')
			.setDesc('This is the number of days in the past that the last day in the report will be. Must be after the Start Date Distance.')
			.addText(number => {
				number.inputEl.type = 'number';
				number.setPlaceholder(DEFAULT_SETTINGS.endDateDistance.toString());
				number.setValue(this.plugin.settings.endDateDistance.toString());
				number.onChange(async (value) => {
					this.plugin.settings.endDateDistance = (value != '') ? parseInt(value) : DEFAULT_SETTINGS.endDateDistance;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Include Notes Referenced')
			.setDesc('This includes a list of referenced notes in the report.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeNotesReferenced)
				.onChange(async (value) => {
					this.plugin.settings.includeNotesReferenced = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Daily Note List')
			.setDesc('This includes a list of daily notes in the report.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeDailyNoteList)
				.onChange(async (value) => {
					this.plugin.settings.includeDailyNoteList = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Outgoing References')
			.setDesc('In the daily notes list, include outgoing references.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeOutgoingReferences)
				.onChange(async (value) => {
					this.plugin.settings.includeOutgoingReferences = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Incoming References')
			.setDesc('In the daily notes list, include incoming references.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeIncomingReferences)
				.onChange(async (value) => {
					this.plugin.settings.includeIncomingReferences = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Daily Note Embeds')
			.setDesc('Embed daily notes in the report.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeDailyNoteEmbeds)
				.onChange(async (value) => {
					this.plugin.settings.includeDailyNoteEmbeds = value;
					await this.plugin.saveSettings();
				}));
	}
}
