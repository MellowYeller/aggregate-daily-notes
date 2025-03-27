import DailyNoteAggregatorPlugin from "../main";
import { StartAndEndDateModal, StartAndEndDateModalData } from "../modals/start-and-end-date-modal"
import { Command, Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { DailyNotesSummaryInfo } from "classes/daily-notes-summary-info";
import { ReportBuilder } from "classes/report-builder";

export class AggregateDailyNotesCommand implements Command {
    id = 'aggregate-daily-notes';
    name = 'Aggregate Daily Notes';
    private plugin: DailyNoteAggregatorPlugin;

    constructor(plugin: DailyNoteAggregatorPlugin) {
        this.plugin = plugin;
    }

    editorCallback = async (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
        const dailyNoteEnabled = this.plugin.app.internalPlugins.config["daily-notes"] === true;
        if (!dailyNoteEnabled) {
            console.warn('Daily Notes plugin is not enabled!');
        }

        const backlinksEnabled = this.plugin.app.internalPlugins.config.backlink === true;
        if (!backlinksEnabled) {
            console.warn('Backlinks plugin is not enabled!');
        }

        // Get start & end dates from user
        const modal = new StartAndEndDateModal(this.plugin);
        let data: StartAndEndDateModalData;
        try {
            data = await modal.openAndGetValue();
        } catch (error) {
            console.error(error);
            new Notice('Error getting data from modal');
            return;
        }

        const info = new DailyNotesSummaryInfo(this.plugin, data.startDate, data.endDate);
        const rb = new ReportBuilder(this.plugin.app, info);
        const report = rb.getDefaultReport();

        editor.replaceSelection(report);
    }

}
