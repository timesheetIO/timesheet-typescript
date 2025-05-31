import { ApiClient } from '../http';
import {
  Timer,
  TimerStartRequest,
  TimerStopRequest,
  TimerUpdateRequest
} from '../models/Timer';

export class TimerResource {
  constructor(private readonly client: ApiClient) {}
  
  async get(): Promise<Timer> {
    return this.client.get<Timer>('/v1/timer');
  }
  
  async start(data: TimerStartRequest): Promise<Timer> {
    return this.client.post<Timer>('/v1/timer/start', data);
  }
  
  async stop(data?: TimerStopRequest): Promise<Timer> {
    return this.client.post<Timer>('/v1/timer/stop', data || {});
  }
  
  async pause(): Promise<Timer> {
    return this.client.post<Timer>('/v1/timer/pause', {});
  }
  
  async resume(): Promise<Timer> {
    return this.client.post<Timer>('/v1/timer/resume', {});
  }
  
  async update(data: TimerUpdateRequest): Promise<Timer> {
    return this.client.put<Timer>('/v1/timer/update', data);
  }
}
