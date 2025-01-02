import moment from "moment";
import DailyNoteAggregatorPlugin from "../main";
import { Command, Editor, MarkdownFileInfo, MarkdownView } from "obsidian";

export class AggregateDailyNotesCommand implements Command {
    id = 'aggregate-daily-notes';
    name = 'Aggregate Daily Notes';
    private plugin: DailyNoteAggregatorPlugin;

    constructor(plugin: DailyNoteAggregatorPlugin) {
        this.plugin = plugin;
    }

    editorCallback = (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
        const dailyNoteEnabled = this.plugin.app.internalPlugins.config["daily-notes"] === true;
        if (!dailyNoteEnabled) {
            console.warn('Daily Notes plugin is not enabled!');
        }

        const backlinksEnabled = this.plugin.app.internalPlugins.config.backlink === true;
        if (!backlinksEnabled) {
            console.warn('Backlinks plugin is not enabled!');
        }

        const dailyNoteOptions = this.plugin.app.internalPlugins.plugins["daily-notes"].instance.options;
        const dateFormat = dailyNoteOptions.format ?? 'YYYY-MM-DD';
        const dailyParentFolder = dailyNoteOptions.folder ?? '';

        const startDate = '2025-01-01';
        const date = moment(startDate, dateFormat);
        if (!date.isValid()) {
            console.error('Could not build moment from input!');
            console.log(`Date: ${startDate}`);
            console.log(`Format: ${dateFormat}`);
            return;
        }

        const file = this.plugin.app.vault.getFileByPath(`${dailyParentFolder}/${date.format(dateFormat)}.md`);

        if (!file) {
            new Notice('File not found');
        return;
        }

        const cachedMetadata = this.plugin.app.metadataCache.getFileCache(file);
        if (!cachedMetadata) {
            new Notice('Metadata not found');
            return;
        }

        const cache = this.plugin.app.metadataCache;
        const outgoingLinks = cachedMetadata?.links ?? [];
        const incomingLinks = cache.getBacklinksForFile(file);

        let report = '';
        report += '### Outgoing\n';
        for (const outLink of outgoingLinks) {
            report += `- [[${outLink.link}]]\n`;
        }

        report += '\n### Backlinks\n';
        // Values here would be more than one links originating in the key
        for (const [sourceFileName, references] of incomingLinks.data) {
            report += `- [[${sourceFileName}]]\n`
        }
        editor.replaceSelection(report);

    }
}