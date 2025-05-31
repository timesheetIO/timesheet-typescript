/**
 * Represents a page of results with pagination support.
 */
export interface Page<T> {
  /**
   * The items in this page.
   */
  items: T[];
  
  /**
   * Total count of items across all pages.
   */
  count: number;
  
  /**
   * Current page number (1-based).
   */
  page: number;
  
  /**
   * Page size limit.
   */
  limit: number;
  
  /**
   * Sort field.
   */
  sort?: string;
  
  /**
   * Sort order.
   */
  order?: string;
}

/**
 * Extended page with navigation methods.
 */
export class NavigablePage<T> implements Page<T> {
  items: T[];
  count: number;
  page: number;
  limit: number;
  sort?: string;
  order?: string;
  
  private nextPageLoader?: (page: number) => Promise<NavigablePage<T>>;
  
  constructor(
    data: Page<T>,
    nextPageLoader?: (page: number) => Promise<NavigablePage<T>>
  ) {
    this.items = data.items;
    this.count = data.count;
    this.page = data.page;
    this.limit = data.limit;
    this.sort = data.sort;
    this.order = data.order;
    this.nextPageLoader = nextPageLoader;
  }
  
  /**
   * Gets the total number of pages.
   */
  get totalPages(): number {
    return Math.ceil(this.count / this.limit);
  }
  
  /**
   * Checks if there is a next page.
   */
  get hasNextPage(): boolean {
    return this.page < this.totalPages;
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
    return this.nextPageLoader(this.page + 1);
  }
  
  /**
   * Returns an async iterator for auto-pagination.
   */
  async *[Symbol.asyncIterator](): AsyncIterator<T> {
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