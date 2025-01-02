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

    editorCallback = async (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
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
        const cache = this.plugin.app.metadataCache;

        let date = moment();
        date = date.subtract(7, 'days');
        let linksSection = '';
        let notesSection = '';

        while (date.isBefore(moment(), 'day')) {
            const filePath = `${dailyParentFolder}${date.format(dateFormat)}.md`;
            const file = this.plugin.app.vault.getFileByPath(filePath);

            if (!file) {
                console.warn(`File not found: ${filePath}`);
                date = date.add(1, 'day');
                continue;
            }

            const cachedMetadata = this.plugin.app.metadataCache.getFileCache(file);
            if (!cachedMetadata) {
                console.warn(`Metadata not found for ${filePath}`);
                date = date.add(1, 'day');
                continue;
            }

            const outgoingLinks = cachedMetadata?.links ?? [];
            const incomingLinks = cache.getBacklinksForFile(file);

            linksSection += `### ${date.format(dateFormat)}\n`;
            linksSection += '#### Outgoing Links\n';
            for (const outLink of outgoingLinks) {
                linksSection += `- [[${outLink.link}]]\n`;
            }

            linksSection += '\n#### Backlinks\n';
            // Values here would be more than one links originating in the key
            for (const [sourceFileName, references] of incomingLinks.data) {
                linksSection += `- [[${sourceFileName}]]\n`
            }

            notesSection += `### [[${date.format(dateFormat)}]]\n`;
            notesSection += `![[${date.format(dateFormat)}]]\n\n`;

            date = date.add(1, 'day');
        }

        const report = `# Daily Notes Report
${date.subtract(7, 'days').format(dateFormat)} through ${date.format(dateFormat)}

## Links
${linksSection}

## Notes
${notesSection}`;

        editor.replaceSelection(report);
    }
}