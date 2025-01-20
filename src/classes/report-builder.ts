import { App } from "obsidian";
import { DailyNotesHelper } from "./daily-notes-helper";
import { DailyNotesSummaryInfo } from "./daily-notes-summary-info";

export class ReportBuilder {
    app: App;
    info: DailyNotesSummaryInfo;

    constructor(app: App, info: DailyNotesSummaryInfo) {
        this.app = app;
        this.info = info;
    }

    public getDefaultReport(): string {

        const dailyNoteOptions = DailyNotesHelper.getDailyNotesOptions(this.app);
        const dateFormat = (dailyNoteOptions.format) ? dailyNoteOptions.format : 'YYYY-MM-DD';

        let report = '';

        // Generate header
        report += '# Daily Notes Report\n';

        // Time span covered
        report += `${this.info.startDate.format(dateFormat)} through ${this.info.endDate.format(dateFormat)}\n\n`

        // Check for any notes
        if (!this.info.dailyData.size) {
            report += 'No daily notes for this date range.\n';
            return report;
        }

        // Unique notes accessed
        if (this.info.uniqueNotes.size) {
            report += '## Notes Accessed\n';

            for (const note of this.info.uniqueNotes) {
                report += `- [[${note}]]\n`;
            }
            report += '\n';
        }

        // Links by day
        report += '## Links by Day\n';

        const sortedDailyInfo = this.info.getSortedDailyData();
        for (const day of sortedDailyInfo) {
            // Title for day summary
            report += `### ${day.date.format(dateFormat)}\n`;
            report += `#### Outgoing Links\n`;
            if (!day.outgoingLinks?.length)
                report += `*None*\n`;
            for (const link of day.outgoingLinks) {
                report += `- [[${link.link}]]\n`;
            }

            report += '#### Backlinks\n';
            if (!day.incommingLinks?.size)
                report += '*None*\n';
            for (const link of day.getBacklinkBaseNames()) {
                report += `- [[${link}]]\n`;
            }
            report += '\n';
        }

        // Daily notes embed
        report += '## Notes\n';
        for (const day of sortedDailyInfo) {
            report += `![[${day.date.format(dateFormat)}]]\n`;
        }

        return report;
    }
}