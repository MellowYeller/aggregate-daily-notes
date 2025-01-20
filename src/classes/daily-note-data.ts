import { Reference, LinkCache, App, TFile } from "obsidian";
import { Moment } from "moment";

export class DailyNoteData {
    incommingLinks: Map<string, Reference[]>;
    outgoingLinks: LinkCache[];
    date: Moment;

    constructor(app: App, date: Moment, note: TFile) {
        const outgoingLinks = app.metadataCache.getFileCache(note)?.links ?? [];
        const backlinks = app.metadataCache.getBacklinksForFile(note);
        this.outgoingLinks = outgoingLinks;
        this.incommingLinks = backlinks.data;
        this.date = date;
    }

    getLinkedNoteNames(): string[] {
        const notes: string[] = [];

        // TODO: Is this the full path? Might be collisions if complicated
        // folder structure is used for daily notes.
        for (const [name, reference] of this.incommingLinks) {
            notes.push(name);
        }
        for (const link of this.outgoingLinks) {
            notes.push(link.link);
        }

        return notes;
    }
}
