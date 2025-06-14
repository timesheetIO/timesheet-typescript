import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// The expected format for Timesheet API: YYYY-MM-DDTHH:mm:ss±HH:mm
const TIMESTAMP_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
const TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

export const DateUtils = {
  /**
   * Validates if a timestamp string is in the correct format with timezone offset
   * (e.g. 2025-05-31T16:45:51+02:00)
   */
  isValidTimestampFormat(timestamp: string): boolean {
    return TIMESTAMP_REGEX.test(timestamp);
  },

  /**
   * Formats a date or timestamp string into the ISO 8601 format with timezone offset
   * that the Timesheet API expects (e.g. 2025-05-31T16:45:51+02:00)
   *
   * @param input Date object, timestamp string, or undefined for current time
   * @returns Formatted date string without milliseconds
   */
  formatTimestamp(input?: Date | string | dayjs.Dayjs): string {
    // If input is a string and already in correct format, return it
    if (typeof input === 'string' && this.isValidTimestampFormat(input)) {
      return input;
    }

    // Convert to dayjs object
    const dayjsDate = dayjs(input || new Date());

    // Format with timezone offset (no milliseconds)
    // dayjs's format 'Z' gives ±HH:mm format
    return dayjsDate.format(TIMESTAMP_FORMAT);
  },

  /**
   * Parses a timestamp string into a Date object.
   * Accepts both UTC ('Z') and timezone offset formats.
   *
   * @param timestamp Timestamp string to parse
   * @returns Date object
   */
  parseTimestamp(timestamp: string): Date {
    return dayjs(timestamp).toDate();
  },

  /**
   * Formats a date string to YYYY-MM-DD format
   *
   * @param input Date object, timestamp string, or undefined for current date
   * @returns Date string in YYYY-MM-DD format
   */
  formatDate(input?: Date | string | dayjs.Dayjs): string {
    return dayjs(input || new Date()).format('YYYY-MM-DD');
  },

  /**
   * Gets the current timestamp in the correct format
   *
   * @returns Current timestamp with timezone offset
   */
  now(): string {
    return this.formatTimestamp();
  },
};
