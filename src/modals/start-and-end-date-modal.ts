import { DailyNotesHelper } from "classes/daily-notes-helper";
import DailyNoteAggregatorPlugin from "main";
import moment, { Moment } from "moment";
import { Modal, TAbstractFile, Setting, MomentFormatComponent } from "obsidian";

export interface StartAndEndDateModalData {
    startDate: moment.Moment;
    endDate: moment.Moment;
}

export class StartAndEndDateModal extends Modal {
    private resolvePromise!: (value: StartAndEndDateModalData) => void;
    private rejectPromise!: (reason?: any) => void;
    data: StartAndEndDateModalData;
    dailyNotes: TAbstractFile[] = [];
    plugin: DailyNoteAggregatorPlugin;

    constructor(plugin: DailyNoteAggregatorPlugin) {
        super(plugin.app);
        this.plugin = plugin;
        this.data = {
            startDate: moment().subtract(plugin.settings.startDateDistance, 'days'),
            endDate: moment().subtract(plugin.settings.endDateDistance, 'days'),
        };
        this.dailyNotes = DailyNotesHelper.getDailyNotes(app);
    }

    onOpen() {
        this.setTitle('Aggregate Daily Notes');

        /* Is this a good idea? It's how forms work elsewhere...
        this.plugin.registerDomEvent(this.containerEl, 'keydown', e => {
            if (e.key === 'Enter') {
                this.resolvePromise(this.data);
                this.close();
            }
        });
        */

        // Set up suggestions for start and end date
        // Informed by what's in the daily notes folder
        // TODO: Make this optional, or remove it entirely.
        // Some daily note folder formats are not compatible
        // or are not suited to dropdown selection.
        // "/daily/2024/March/W01"
        const datalist = document.createElement('datalist');
        datalist.id = 'daily-notes-datalist';
        for (const note of this.dailyNotes) {
            const option = document.createElement('option');

            // Remove the .md extension
            option.value = note.name.substring(0, note.name.length - 3);
            datalist.appendChild(option);
        }

        this.containerEl.appendChild(datalist);
        let startInput: MomentFormatComponent;
        let endInput: MomentFormatComponent;
        new Setting(this.contentEl)
            .setName('Start Date')
            .addMomentFormat(start => {
                start.setPlaceholder('YYYY-MM-DD');
                start.onChange(value => {
                    this.data.startDate = moment(value);
                });
                start.inputEl.setAttribute('list', 'daily-notes-datalist');
                start.setValue(this.data.startDate.format('YYYY-MM-DD'));
                startInput = start;
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
                endInput = end;
            });

        // Quick actions for frequent date ranges
        new Setting(this.contentEl)
            .setName('Quick Actions')
            .addButton(btn => {
                btn.setButtonText('Last 7 Days');
                btn.onClick(() => {
                    new Notice('Last 7 Days selected');
                    this.data.startDate = moment().subtract(7, 'days');
                    this.data.endDate = moment().subtract(1, 'days');
                    startInput.setValue(this.data.startDate.format('YYYY-MM-DD'));
                    endInput.setValue(this.data.endDate.format('YYYY-MM-DD'));
                });
           })
            .addButton(btn => {
                btn.setButtonText('Last 30 Days');
                btn.onClick(() => {
                    new Notice('Last 30 Days selected');
                    this.data.startDate = moment().subtract(30, 'days');
                    this.data.endDate = moment().subtract(1, 'days');
                    startInput.setValue(this.data.startDate.format('YYYY-MM-DD'));
                    endInput.setValue(this.data.endDate.format('YYYY-MM-DD'));
                });
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

    async openAndGetValue(): Promise<StartAndEndDateModalData> {
        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
            this.open();
        });
    }

}