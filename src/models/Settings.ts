export interface Settings {
  theme?: 'light' | 'dark';
  timezone?: string;
  language?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  firstDay?: number;
  timerRounding?: number;
  timerRoundingType?: 'up' | 'down' | 'nearest';
  pauseRounding?: number;
}

export interface SettingsUpdateRequest extends Settings {}
