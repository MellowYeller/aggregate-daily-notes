import { DailyNotesHelper } from "classes/daily-notes-helper";
import moment from "moment";
import { Modal, TAbstractFile, App, Setting } from "obsidian";

export interface StartAndEndDateModalData {
    startDate: moment.Moment;
    endDate: moment.Moment;
}

export class StartAndEndDateModal extends Modal {
    private resolvePromise!: (value: StartAndEndDateModalData) => void;
    private rejectPromise!: (reason?: any) => void;
    data: StartAndEndDateModalData;
    dailyNotes: TAbstractFile[] = [];

    constructor(app: App) {
        super(app);
        this.data = {
            startDate: moment().subtract(7, 'days'),
            endDate: moment().subtract(1, 'days'),
        };
        this.dailyNotes = DailyNotesHelper.getDailyNotes(app);
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

    async openAndGetValue(): Promise<StartAndEndDateModalData> {
        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
            this.open();
        });
    }

}