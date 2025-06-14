import type { ListParams } from './common';

/**
 * Represents a page of results with pagination support.
 */
export interface Page<T> {
  /**
   * The items in this page.
   */
  items: T[];

  /**
   * Pagination and sorting parameters.
   */
  params: ListParams;
}

/**
 * Extended page with navigation methods.
 */
export class NavigablePage<T> implements Page<T> {
  items: T[];
  params: ListParams;

  private readonly nextPageLoader?: (page: number) => Promise<NavigablePage<T>>;

  constructor(data: Page<T>, nextPageLoader?: (page: number) => Promise<NavigablePage<T>>) {
    this.items = data.items;
    this.params = data.params;
    this.nextPageLoader = nextPageLoader;
  }

  /**
   * Gets the total number of pages.
   */
  get totalPages(): number {
    return Math.ceil((this.params?.count || 0) / (this.params?.limit || 25));
  }

  /**
   * Checks if there is a next page.
   */
  get hasNextPage(): boolean {
    return (this.params?.page || 1) < this.totalPages;
  }

  /**
   * Loads the next page.
   */
  async nextPage(): Promise<NavigablePage<T>> {
    if (!this.hasNextPage) {
      throw new Error('No more pages available');
    }
    if (!this.nextPageLoader) {
      throw new Error('Next page loader not configured');
    }
    return this.nextPageLoader((this.params.page || 1) + 1);
  }

  /**
   * Returns an async iterator for auto-pagination.
   */
  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let currentPage: NavigablePage<T> = this;

    while (true) {
      for (const item of currentPage.items) {
        yield item;
      }

      if (!currentPage.hasNextPage) {
        break;
      }

      currentPage = await currentPage.nextPage();
    }
  }

  /**
   * Converts all pages to an array (loads all pages).
   */
  async toArray(): Promise<T[]> {
    const allItems: T[] = [];

    for await (const item of this) {
      allItems.push(item);
    }

    return allItems;
  }
}
