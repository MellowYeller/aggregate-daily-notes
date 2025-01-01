import { InternalPluginInstance, DailyNotesPlugin } from "obsidian-typings";


declare module 'obsidian-typings' {
    /** @public */
    interface DailyNotesPluginInstance extends InternalPluginInstance<DailyNotesPlugin> {
        options: {
            folder?: string;
            format?: string;
            template?: string;
        }
    }
}