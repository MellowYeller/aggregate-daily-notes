import MyPlugin from "main";
import { ExtendedMetadataCache } from "models/extended-metadata-cache";
import { Command, Editor, MarkdownFileInfo, MarkdownView, Notice, Plugin } from "obsidian";

export class AggregateDailyNotesCommand implements Command {
    id = 'aggregate-daily-notes';
    name = 'Aggregate Daily Notes';
    private plugin: Plugin;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    editorCallback = (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
        const file = this.plugin.app.vault.getFileByPath('daily/2024-12-31.md');
        if (!file) {
            new Notice('File not found');
        return;
        }
        const cachedMetadata = this.plugin.app.metadataCache.getFileCache(file);
        if (!cachedMetadata) {
            new Notice('Metadata not found');
            return;
        }
        const extendedCache = this.plugin.app.metadataCache as ExtendedMetadataCache;
        const outgoingLinks = cachedMetadata?.links ?? [];
        const incomingLinks = extendedCache.getBacklinksForFile(file);
        cachedMetadata?.links?.forEach((link) => {
            console.log(link.link, link.displayText, link.position);
        });
        const result = extendedCache.getBacklinksForFile(file);
        result.data.forEach((value, key) => {
            console.log('Backlinks for ' + key);
            value.forEach((link) => {
                console.log(link.link, link.displayText, link.position);
            });
        });
    }
}