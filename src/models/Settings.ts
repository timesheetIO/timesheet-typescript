export interface Settings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  currency?: string;
  distance?: string;
  dateFormat?: string;
  timeFormat?: string;
  durationFormat?: string;
  csvSeparator?: string;
  slotDuration?: number;
  snapDuration?: number;
  entriesPerPage?: number;
  firstDay?: number;
  defaultTaskDuration?: number;
  defaultBreakDuration?: number;
  showRelatives?: boolean;
  weeklySummary?: boolean;
  monthlySummary?: boolean;
  lastUpdate?: number;
  timerRounding?: number;
  timerRoundingType?: number;
  timerEditView?: boolean;
  pauseRounding?: number;
  pauseRoundingType?: number;
  pauseEditView?: boolean;
  autofillProjectSelection?: boolean;
}

export interface SettingsUpdateRequest extends Settings {}
