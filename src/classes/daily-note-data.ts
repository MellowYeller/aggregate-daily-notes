import { Reference, LinkCache, App, TFile } from "obsidian";
import { Moment } from "moment";

export class DailyNoteData {
    incommingLinks: Map<string, Reference[]>;
    outgoingLinks: LinkCache[];
    date: Moment;
    app: App;

    constructor(app: App, date: Moment, note: TFile) {
        const outgoingLinks = app.metadataCache.getFileCache(note)?.links ?? [];
        const backlinks = app.metadataCache.getBacklinksForFile(note);
        this.outgoingLinks = outgoingLinks;
        this.incommingLinks = backlinks.data;
        this.date = date;
        this.app = app;
    }

    getLinkedNoteNames(): string[] {
        const notes: string[] = [];

        // TODO: Is this the full path? Might be collisions if complicated
        // folder structure is used for daily notes.
        notes.push(...this.getBacklinkBaseNames());
        for (const link of this.outgoingLinks) {
            notes.push(link.link);
        }

        return notes;
    }

    getBacklinkBaseNames(): string[] {
        const backlinks: string[] = [];
        for (const [name, reference] of this.incommingLinks) {
            const file = this.app.vault.getFileByPath(name);
            if (file)
                backlinks.push(file.basename);
            else
                backlinks.push(name);
        }
        return backlinks;
    }
}
