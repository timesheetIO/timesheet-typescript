import { DateUtils } from '../../../utils/date';

describe('DateUtils', () => {
  describe('isValidTimestampFormat', () => {
    it('should validate correct timestamp format', () => {
      expect(DateUtils.isValidTimestampFormat('2025-06-11T18:02:36+02:00')).toBe(true);
      expect(DateUtils.isValidTimestampFormat('2025-12-31T23:59:59-05:00')).toBe(true);
      expect(DateUtils.isValidTimestampFormat('2025-01-01T00:00:00+00:00')).toBe(true);
    });

    it('should reject timestamps with milliseconds', () => {
      expect(DateUtils.isValidTimestampFormat('2025-06-11T18:02:36.155+02:00')).toBe(false);
      expect(DateUtils.isValidTimestampFormat('2025-06-11T18:02:36.999Z')).toBe(false);
    });

    it('should reject invalid formats', () => {
      expect(DateUtils.isValidTimestampFormat('2025-06-11')).toBe(false);
      expect(DateUtils.isValidTimestampFormat('2025-06-11T18:02:36')).toBe(false);
      expect(DateUtils.isValidTimestampFormat('2025-06-11T18:02:36Z')).toBe(false);
      expect(DateUtils.isValidTimestampFormat('not a date')).toBe(false);
    });
  });

  describe('formatTimestamp', () => {
    it('should format Date objects without milliseconds', () => {
      const date = new Date('2025-06-11T18:02:36.155+02:00');
      const formatted = DateUtils.formatTimestamp(date);

      // Should not contain milliseconds
      expect(formatted).not.toContain('.');

      // Should match the expected format
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });

    it('should preserve already correctly formatted strings', () => {
      const correctFormat = '2025-06-11T18:02:36+02:00';
      expect(DateUtils.formatTimestamp(correctFormat)).toBe(correctFormat);
    });

    it('should format string timestamps and remove milliseconds', () => {
      const withMillis = '2025-06-11T18:02:36.155+02:00';
      const formatted = DateUtils.formatTimestamp(withMillis);

      expect(formatted).not.toContain('.');
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });

    it('should format current time when no input provided', () => {
      const formatted = DateUtils.formatTimestamp();

      expect(formatted).not.toContain('.');
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });

    it('should handle ISO strings with Z timezone', () => {
      const isoString = '2025-06-11T16:02:36.155Z';
      const formatted = DateUtils.formatTimestamp(isoString);

      expect(formatted).not.toContain('.');
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });
  });

  describe('parseTimestamp', () => {
    it('should parse timestamp strings to Date objects', () => {
      const timestamp = '2025-06-11T18:02:36+02:00';
      const date = DateUtils.parseTimestamp(timestamp);

      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(5); // June (0-indexed)
      expect(date.getDate()).toBe(11);
    });

    it('should parse timestamps with Z timezone', () => {
      const timestamp = '2025-06-11T16:02:36Z';
      const date = DateUtils.parseTimestamp(timestamp);

      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe('2025-06-11T16:02:36.000Z');
    });
  });

  describe('formatDate', () => {
    it('should format dates as YYYY-MM-DD', () => {
      const date = new Date('2025-06-11T18:02:36+02:00');
      expect(DateUtils.formatDate(date)).toBe('2025-06-11');
    });

    it('should format current date when no input provided', () => {
      const formatted = DateUtils.formatDate();
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('now', () => {
    it('should return current timestamp in correct format', () => {
      const timestamp = DateUtils.now();

      expect(timestamp).not.toContain('.');
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
      expect(DateUtils.isValidTimestampFormat(timestamp)).toBe(true);
    });
  });
});
