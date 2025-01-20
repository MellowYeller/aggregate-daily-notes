import { DailyNoteData } from "./daily-note-data";
import { DailyNotesHelper } from "./daily-notes-helper";
import { Moment } from "moment";
import DailyNoteAggregatorPlugin from "../main";

export class DailyNotesSummaryInfo {
    plugin: DailyNoteAggregatorPlugin
    uniqueNotes: Set<string>;
    dailyData: Map<string, DailyNoteData>
    startDate: Moment;
    endDate: Moment;

    constructor(plugin: DailyNoteAggregatorPlugin, start: Moment, end: Moment) {
        this.plugin = plugin;
        this.uniqueNotes = new Set();
        this.dailyData = new Map();
        this.startDate = start;
        this.endDate = end;

        for(const date = start.clone(), stopDate = end.clone().add(1, 'day'); date.isBefore(stopDate, 'day'); date.add(1, 'day')) {
            const note = DailyNotesHelper.getNoteForDate(plugin.app, date);
            if (!note) continue;

            // TODO: Is this the full path? Might be collisions if complicated
            // folder structure is used for daily notes.
            const data = new DailyNoteData(plugin.app, date.clone(), note);

            for (const link of data.getLinkedNoteNames()) {
                this.uniqueNotes.add(link);
            }

            // Using the set internal date format allows for sorting of the key
            this.dailyData.set(date.format(plugin.internalDateFormat), data);
        }
    }

    getSortedDailyData(): DailyNoteData[] {
        const keys: string[] = [];
        for (const key of this.dailyData.keys()) {
            keys.push(key);
        }
        keys.sort();

        const data: DailyNoteData[] = [];
        for (const key of keys) {
            const item = this.dailyData.get(key);
            if (!item) throw new Error(`Attempted to get daily data failed: ${key}`);
            data.push(item);
        }

        return data;
    }
}

