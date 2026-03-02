import type { AxiosRequestConfig } from 'axios';

/**
 * Interface for authentication mechanisms.
 */
export interface Authentication {
  /**
   * Apply authentication to the request.
   *
   * @param config The axios request configuration
   */
  applyAuth(config: AxiosRequestConfig): void;

  /**
   * Check if the authentication needs to be refreshed.
   *
   * @returns true if refresh is needed
   */
  needsRefresh(): boolean;

  /**
   * Refresh the authentication if supported.
   *
   * @throws Error if refresh is not supported
   */
  refresh(): Promise<void>;

  /**
   * Gets the authentication headers for requests.
   */
  getAuthHeaders(): Promise<Record<string, string>>;
}
