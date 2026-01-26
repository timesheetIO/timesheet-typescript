import type { ApiClient } from '../http';
import type { EventData, EventType, SseStatus, SseSubscription } from '../models';
import { Resource } from './Resource';

/**
 * EventResource provides access to Server-Sent Events (SSE) for real-time updates.
 *
 * @example
 * ```typescript
 * // Subscribe to events
 * const subscription = await client.events.subscribe({
 *   onEvent: (event) => {
 *     console.log('Received event:', event.event, event.item);
 *   },
 *   onError: (error) => {
 *     console.error('SSE error:', error);
 *   }
 * });
 *
 * // Later, close the connection
 * subscription.close();
 * ```
 */
export class EventResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/events');
  }

  /**
   * Get the current SSE connection status for the authenticated user.
   * @returns Status including whether connected and connection count
   */
  async getStatus(): Promise<SseStatus> {
    return this.http.get<SseStatus>(`${this.basePath}/status`);
  }

  /**
   * Get the full URL for the SSE stream endpoint.
   * Useful if you want to use a custom EventSource implementation.
   * @returns The full URL to the SSE stream endpoint
   */
  getStreamUrl(): string {
    return `${this.http.getBaseUrl()}${this.basePath}/stream`;
  }

  /**
   * Subscribe to real-time events via Server-Sent Events.
   *
   * This method establishes an SSE connection to receive real-time updates
   * for entity changes (tasks, projects, teams, etc.).
   *
   * Note: This uses fetch with ReadableStream for broad compatibility.
   * For browser environments, you may also use getStreamUrl() with EventSource.
   *
   * @param options Subscription options including event handlers
   * @returns A subscription object with close() method
   *
   * @example
   * ```typescript
   * const subscription = await client.events.subscribe({
   *   onEvent: (event) => {
   *     switch (event.event) {
   *       case 'task.create':
   *         console.log('New task created:', event.item);
   *         break;
   *       case 'task.update':
   *         console.log('Task updated:', event.item);
   *         break;
   *     }
   *   },
   *   onConnected: (connectionId) => {
   *     console.log('Connected with ID:', connectionId);
   *   },
   *   onError: (error) => {
   *     console.error('Error:', error);
   *   },
   *   onClose: () => {
   *     console.log('Connection closed');
   *   }
   * });
   *
   * // Close when done
   * subscription.close();
   * ```
   */
  async subscribe(options: SubscribeOptions): Promise<SseSubscription> {
    const url = this.getStreamUrl();
    const authHeaders = await this.http.getAuthHeaders();

    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...authHeaders,
    };

    const abortController = new AbortController();
    let isConnected = false;
    const eventHandlers = new Map<string, Set<(data: unknown) => void>>();

    const subscription: SseSubscription = {
      close: () => {
        isConnected = false;
        abortController.abort();
        options.onClose?.();
      },
      get isConnected() {
        return isConnected;
      },
      on: (event: EventType | 'error', handler: (data: unknown) => void) => {
        if (!eventHandlers.has(event)) {
          eventHandlers.set(event, new Set());
        }
        eventHandlers.get(event)!.add(handler);
      },
      off: (event: EventType | 'error', handler: (data: unknown) => void) => {
        eventHandlers.get(event)?.delete(handler);
      },
    };

    // Start the SSE connection (intentionally not awaited - runs in background)
    void this.connectSse(url, headers, abortController.signal, {
      ...options,
      onConnected: (connectionId) => {
        isConnected = true;
        options.onConnected?.(connectionId);
      },
      onEvent: (event) => {
        options.onEvent?.(event);
        // Also emit to registered handlers
        const handlers = eventHandlers.get(event.event as EventType);
        handlers?.forEach((handler) => handler(event));
      },
      onError: (error) => {
        options.onError?.(error);
        const handlers = eventHandlers.get('error');
        handlers?.forEach((handler) => handler(error));
      },
      onClose: () => {
        isConnected = false;
        options.onClose?.();
      },
    });

    return subscription;
  }

  /**
   * Internal method to establish and manage the SSE connection.
   */
  private async connectSse(
    url: string,
    headers: Record<string, string>,
    signal: AbortSignal,
    options: SubscribeOptions,
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('SSE response has no body');
      }

      const reader = response.body.getReader() as ReadableStreamDefaultReader<Uint8Array>;
      const decoder = new TextDecoder();
      let buffer = '';

      // Current event being parsed
      let eventType = '';
      let eventData = '';
      let eventId = '';

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;

        if (done || !result.value) {
          options.onClose?.();
          break;
        }

        buffer += decoder.decode(result.value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            eventData = line.slice(5).trim();
          } else if (line.startsWith('id:')) {
            eventId = line.slice(3).trim();
          } else if (line === '') {
            // Empty line signals end of event
            if (eventData) {
              this.processEvent(eventType, eventData, eventId, options);
            }
            // Reset for next event
            eventType = '';
            eventData = '';
            eventId = '';
          }
        }
      }
    } catch (error) {
      if (signal.aborted) {
        // Connection was intentionally closed
        return;
      }
      options.onError?.(error);
    }
  }

  /**
   * Process a received SSE event.
   */
  private processEvent(
    eventType: string,
    eventData: string,
    _eventId: string,
    options: SubscribeOptions,
  ): void {
    try {
      const data: unknown = JSON.parse(eventData);

      if (eventType === 'connected') {
        const connectedData = data as { connectionId: string };
        options.onConnected?.(connectedData.connectionId);
      } else {
        options.onEvent?.(data as EventData);
      }
    } catch {
      options.onError?.(new Error(`Failed to parse event data: ${eventData}`));
    }
  }
}

/**
 * Options for subscribing to SSE events
 */
export interface SubscribeOptions {
  /**
   * Called when an event is received
   */
  onEvent?: (event: EventData) => void;

  /**
   * Called when the connection is established
   */
  onConnected?: (connectionId: string) => void;

  /**
   * Called when an error occurs
   */
  onError?: (error: unknown) => void;

  /**
   * Called when the connection is closed
   */
  onClose?: () => void;
}
