import type { ApiClient } from '../http';
import type {
  Timer,
  TimerPauseRequest,
  TimerResumeRequest,
  TimerStartRequest,
  TimerStopRequest,
  TimerUpdateRequest,
} from '../models';
import { DateUtils } from '../utils/date';

export class TimerResource {
  constructor(private readonly http: ApiClient) {}

  async get(): Promise<Timer> {
    return this.http.get<Timer>('/v1/timer');
  }

  async start(data: TimerStartRequest): Promise<Timer> {
    // Format startDateTime if provided
    const formattedData = {
      ...data,
      startDateTime: data.startDateTime
        ? DateUtils.formatTimestamp(data.startDateTime)
        : DateUtils.formatTimestamp(),
    };
    return this.http.post<Timer>('/v1/timer/start', formattedData);
  }

  async stop(data?: TimerStopRequest): Promise<Timer> {
    // Format endDateTime if provided
    const formattedData = data
      ? {
          ...data,
          endDateTime: data.endDateTime
            ? DateUtils.formatTimestamp(data.endDateTime)
            : DateUtils.formatTimestamp(),
        }
      : { endDateTime: DateUtils.formatTimestamp() };
    return this.http.post<Timer>('/v1/timer/stop', formattedData);
  }

  async pause(data?: TimerPauseRequest): Promise<Timer> {
    // Format startDateTime if provided
    const formattedData = data
      ? {
          ...data,
          startDateTime: data.startDateTime
            ? DateUtils.formatTimestamp(data.startDateTime)
            : DateUtils.formatTimestamp(),
        }
      : { startDateTime: DateUtils.formatTimestamp() };
    return this.http.post<Timer>('/v1/timer/pause', formattedData);
  }

  async resume(data?: TimerResumeRequest): Promise<Timer> {
    // Format endDateTime if provided
    const formattedData = data
      ? {
          ...data,
          endDateTime: data.endDateTime
            ? DateUtils.formatTimestamp(data.endDateTime)
            : DateUtils.formatTimestamp(),
        }
      : { endDateTime: DateUtils.formatTimestamp() };
    return this.http.post<Timer>('/v1/timer/resume', formattedData);
  }

  async update(data: TimerUpdateRequest): Promise<Timer> {
    // Format startDateTime if provided
    const formattedData = {
      ...data,
      startDateTime: data.startDateTime ? DateUtils.formatTimestamp(data.startDateTime) : undefined,
    };
    return this.http.put<Timer>('/v1/timer/update', formattedData);
  }
}
