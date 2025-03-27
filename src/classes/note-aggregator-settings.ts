export interface NoteAggregatorSettings {
	reportHeader: string;
	/** Moment format for displaying dates in the report. */
	dateDisplay: string;
	/** Number of days in the past that the first day in the report will be. */
	startDateDistance: number;
	/** Number of days in the past that the last day in the report will be. Must be after the startDateDistance. */
	endDateDistance: number;
	/** Include a list of referenced notes (in and out) in the report. */
	includeNotesReferenced: boolean;
	/** Include a list of daily notes in the report. */
	includeDailyNoteList: boolean;
	/** In the daily notes list, include outgoing references */
	includeOutgoingReferences: boolean;
	/** In the daily notes list, include incomming references */
	includeIncomingReferences: boolean;
	/** Embed daily notes in the report. */
	includeDailyNoteEmbeds: boolean;
}

export const DEFAULT_SETTINGS: NoteAggregatorSettings = {
	reportHeader: 'Note Report',
	dateDisplay: 'dddd MMMM Do, YYYY', // e.g., "Wednesday March 26, 2025"
	startDateDistance: 7,
	endDateDistance: 1,
	includeNotesReferenced: true,
	includeDailyNoteList: true,
	includeOutgoingReferences: true,
	includeIncomingReferences: true,
	includeDailyNoteEmbeds: false,
};
