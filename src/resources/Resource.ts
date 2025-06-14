import type { ApiClient } from '../http';
import type { Page } from '../models';
import { NavigablePage } from '../models';

/**
 * Configuration for resource endpoints
 */
export interface ResourceConfig {
  basePath: string;
}

/**
 * Base resource class that provides common functionality for all API resources.
 */
export abstract class Resource {
  protected readonly basePath: string;

  protected constructor(
    protected readonly http: ApiClient,
    config: ResourceConfig | string,
  ) {
    if (typeof config === 'string') {
      this.basePath = config;
    } else {
      this.basePath = config.basePath;
    }
  }

  /**
   * Creates a NavigablePage from a Page response
   * @param page The page response
   * @param nextPageLoader Function to load the next page
   */
  protected createNavigablePage<R>(
    page: Page<R>,
    nextPageLoader: (page: number) => Promise<NavigablePage<R>>,
  ): NavigablePage<R> {
    return new NavigablePage(page, nextPageLoader);
  }
}
