import { App, TFile, TAbstractFile } from "obsidian";
import { Moment } from "moment";
import { DailyNotesPluginInstance } from "obsidian-typings";

export class DailyNotesHelper {
    /**
     * TODO: This needs to parse the weird moment paths that Obsidian supports.
     * `daily/YYYY/MM/WW-E.md`
     * @param app 
     * @param date 
     * @returns 
     */
    public static getNoteForDate(app: App, date: Moment): TFile|null {
        const dailyNoteOptions = app.internalPlugins.plugins["daily-notes"].instance.options;
        const dateFormat = (dailyNoteOptions.format) ? dailyNoteOptions.format : 'YYYY-MM-DD';
        const dailyParentFolder = dailyNoteOptions.folder ?? '';
        const filePath = `${dailyParentFolder}/${date.format(dateFormat)}.md`;
        const file = app.vault.getFileByPath(filePath);
        return file;
    }

    public static getDailyNotes(app: App): TAbstractFile[] {
        const dailyNoteOptions = app.internalPlugins.plugins["daily-notes"].instance.options;
        const folderStr = dailyNoteOptions.folder ?? '';
        const folder = app.vault.getFolderByPath(folderStr);
        if (!folder) {
            console.warn(`Folder not found: ${folderStr}`);
            return [];
        }
        return folder.children;
    }

    public static getDailyNotesOptions(app: App): DailyNotesPluginInstance["options"] {
        return app.internalPlugins.plugins["daily-notes"].instance.options;
    }
}

