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
        const settings = this.info.plugin.settings;
        const sortedDailyInfo = this.info.getSortedDailyData();

        let report = '';

        // Generate header
        report += `# ${settings.reportHeader}\n`;

        // Time span covered
        report += `${this.info.startDate.format(settings.dateDisplay)} through ${this.info.endDate.format(settings.dateDisplay)}\n\n`

        // Check for 0 daily notes in range
        if (!this.info.dailyData.size) {
            report += 'No daily notes for this date range.\n';
            return report;
        }

        // Unique notes accessed
        if (settings.includeNotesReferenced && this.info.uniqueNotes.size) {
            report += '## Notes Accessed\n';

            for (const note of this.info.uniqueNotes) {
                report += `- [[${note}]]\n`;
            }
            report += '\n';
        }

        // Links by day
        if (settings.includeDailyNoteList) {
            report += '## Links by Day\n';

            for (const day of sortedDailyInfo) {
                // Title for day summary
                report += `### [[${day.date.format(dateFormat)}|${day.date.format(settings.dateDisplay)}]]\n`;

                // Outgoing links
                if (settings.includeOutgoingReferences) {
                    report += `#### Outgoing Links\n`;
                    if (!day.outgoingLinks?.length)
                        report += `*None*\n`;
                    for (const link of day.outgoingLinks) {
                        report += `- [[${link.link}]]\n`;
                    }
                }

                // Incomming links
                if (settings.includeIncomingReferences) {
                    report += '#### Backlinks\n';
                    if (!day.incommingLinks?.size)
                        report += '*None*\n';
                    for (const link of day.getBacklinkBaseNames()) {
                        report += `- [[${link}]]\n`;
                    }
                }
                report += '\n';
            }
        }

        // Daily notes embed
        if (settings.includeDailyNoteEmbeds) {
            report += '## Notes\n';
            for (const day of sortedDailyInfo) {
                report += `![[${day.date.format(dateFormat)}]]\n`;
            }
        }

        return report;
    }
}