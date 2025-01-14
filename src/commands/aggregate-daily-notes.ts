import moment from "moment";
import DailyNoteAggregatorPlugin from "../main";
import { App, Command, Editor, MarkdownFileInfo, MarkdownView, Modal, Setting, SuggestModal, TAbstractFile } from "obsidian";
import { get } from "http";

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

        getDailyNotes(this.plugin.app);
        const test = new AggregateDailyNotesCommandModal(this.plugin.app);
        let data: AggregateDailyNotesCommandModalData;
        try {
            data = await test.openAndGetValue();
        } catch (error) {
            console.error(error);
            new Notice('Error getting data from modal');
            return;
        }
        const dailyNoteOptions = this.plugin.app.internalPlugins.plugins["daily-notes"].instance.options;
        // Format may be undefined if not touched by user, or empty string if touched and then deleted
        const dateFormat = (dailyNoteOptions.format) ? dailyNoteOptions.format : 'YYYY-MM-DD';
        const dailyParentFolder = dailyNoteOptions.folder ?? '';
        const cache = this.plugin.app.metadataCache;

        let date = data.startDate;
        let linksSection = '';
        let notesSection = '';

        while (date.isBefore(data.endDate, 'day')) {
            const filePath = `${dailyParentFolder}/${date.format(dateFormat)}.md`;
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
interface AggregateDailyNotesCommandModalData {
    startDate: moment.Moment;
    endDate: moment.Moment;
}

function getDailyNotes(app: App): TAbstractFile[] {
    const dailyNoteOptions = app.internalPlugins.plugins["daily-notes"].instance.options;
    const folderStr = dailyNoteOptions.folder ?? '';
    console.log(`Getting daily notes in ${folderStr}`);
    const folder = app.vault.getFolderByPath(folderStr);
    if (!folder) {
        console.warn(`Folder not found: ${folderStr}`);
        return [];
    }

    for (const file of folder.children) {
        console.log(file.name);
    }
    return folder.children;
}

class AggregateDailyNotesCommandModal extends Modal {
    private resolvePromise!: (value: AggregateDailyNotesCommandModalData) => void;
    private rejectPromise!: (reason?: any) => void;
    data: AggregateDailyNotesCommandModalData;
    cats: Record<string, (value?: string|undefined) => string> = {
        'one': () => 'one',
        'two': input => input ?? 'two',
        'three': input => input ?? 'three',
    };
    dailyNotes: TAbstractFile[] = [];

    constructor(app: App) {
        super(app);
        this.data = {
            startDate: moment().subtract(7, 'days'),
            endDate: moment().subtract(1, 'days'),
        };
        this.dailyNotes = getDailyNotes(app);
    }

    onOpen() {
        this.setTitle('Aggregate Daily Notes');

        // Set up suggestions for start and end date
        // Informed by what's in the daily notes folder
        const datalist = document.createElement('datalist');
        datalist.id = 'daily-notes-datalist';
        for (const note of this.dailyNotes) {
            const option = document.createElement('option');

            // Remove the .md extension
            option.value = note.name.substring(0, note.name.length - 3);
            datalist.appendChild(option);
        }

        this.containerEl.appendChild(datalist);
        new Setting(this.contentEl)
            .setName('Start Date')
            .addMomentFormat(start => {
                start.setPlaceholder('YYYY-MM-DD');
                start.onChange(value => {
                    this.data.startDate = moment(value);
                });
                start.inputEl.setAttribute('list', 'daily-notes-datalist');
                start.setValue(this.data.startDate.format('YYYY-MM-DD'));
            });
        new Setting(this.contentEl)
            .setName('End Date')
            .addMomentFormat(end => {
                end.setPlaceholder('YYYY-MM-DD');
                end.onChange(value => {
                    this.data.endDate = moment(value);
                });
                end.inputEl.setAttribute('list', 'daily-notes-datalist');
                end.setValue(this.data.endDate.format('YYYY-MM-DD'));
            });
        new Setting(this.contentEl)
            .addButton(btn => {
                btn.setButtonText('Submit');
                btn.setCta();
                btn.onClick(() => {
                    this.resolvePromise(this.data);
                    this.close();
                });
            });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    async openAndGetValue(): Promise<AggregateDailyNotesCommandModalData> {
        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
            this.open();
        });
    }

}
