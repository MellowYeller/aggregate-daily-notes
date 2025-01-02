import { InternalPluginInstance, DailyNotesPlugin } from "obsidian-typings";

declare module 'obsidian-typings' {
    /** @public */
    interface DailyNotesPluginInstance extends InternalPluginInstance<DailyNotesPlugin> {
        options: {
            autorun?: boolean;
            folder?: string;
            format?: string;
            template?: string;
        }
    }
}