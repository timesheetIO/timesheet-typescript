import { NavigablePage, Page } from '../../../models/Page';
import { ListParams } from '../../../models/common';

describe('NavigablePage', () => {
  let mockNextPageLoader: jest.Mock<Promise<NavigablePage<string>>>;

  beforeEach(() => {
    mockNextPageLoader = jest.fn();
  });

  describe('constructor', () => {
    it('should initialize with page data', () => {
      const pageData: Page<string> = {
        items: ['item1', 'item2', 'item3'],
        params: {
          page: 1,
          limit: 10,
          count: 50,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.items).toEqual(['item1', 'item2', 'item3']);
      expect(navigablePage.params).toEqual({
        page: 1,
        limit: 10,
        count: 50,
      });
    });

    it('should accept optional nextPageLoader', () => {
      const pageData: Page<string> = {
        items: ['item1'],
        params: {
          page: 1,
          limit: 10,
          count: 20,
        },
      };

      const navigablePage = new NavigablePage(pageData, mockNextPageLoader);

      expect(navigablePage).toBeDefined();
    });
  });

  describe('totalPages', () => {
    it('should calculate total pages correctly', () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 1,
          limit: 10,
          count: 50,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.totalPages).toBe(5);
    });

    it('should round up for partial pages', () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 1,
          limit: 10,
          count: 51,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.totalPages).toBe(6);
    });

    it('should handle missing count', () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 1,
          limit: 10,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.totalPages).toBe(0);
    });

    it('should handle missing limit with default value', () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 1,
          count: 100,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.totalPages).toBe(4); // 100 / 25 (default limit)
    });
  });

  describe('hasNextPage', () => {
    it('should return true when there are more pages', () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 1,
          limit: 10,
          count: 50,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.hasNextPage).toBe(true);
    });

    it('should return false when on last page', () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 5,
          limit: 10,
          count: 50,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.hasNextPage).toBe(false);
    });

    it('should return false when count is 0', () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.hasNextPage).toBe(false);
    });

    it('should handle missing page number with default value', () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          limit: 10,
          count: 50,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.hasNextPage).toBe(true); // page defaults to 1
    });
  });

  describe('nextPage', () => {
    it('should load next page successfully', async () => {
      const pageData: Page<string> = {
        items: ['item1', 'item2'],
        params: {
          page: 1,
          limit: 2,
          count: 4,
        },
      };

      const nextPageData = new NavigablePage<string>({
        items: ['item3', 'item4'],
        params: {
          page: 2,
          limit: 2,
          count: 4,
        },
      });

      mockNextPageLoader.mockResolvedValueOnce(nextPageData);
      const navigablePage = new NavigablePage(pageData, mockNextPageLoader);

      const result = await navigablePage.nextPage();

      expect(mockNextPageLoader).toHaveBeenCalledWith(2);
      expect(result.items).toEqual(['item3', 'item4']);
      expect(result.params.page).toBe(2);
    });

    it('should throw error when no more pages available', async () => {
      const pageData: Page<string> = {
        items: ['item1', 'item2'],
        params: {
          page: 2,
          limit: 2,
          count: 4,
        },
      };

      const navigablePage = new NavigablePage(pageData, mockNextPageLoader);

      await expect(navigablePage.nextPage()).rejects.toThrow('No more pages available');
      expect(mockNextPageLoader).not.toHaveBeenCalled();
    });

    it('should throw error when nextPageLoader not configured', async () => {
      const pageData: Page<string> = {
        items: ['item1', 'item2'],
        params: {
          page: 1,
          limit: 2,
          count: 4,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      await expect(navigablePage.nextPage()).rejects.toThrow('Next page loader not configured');
    });

    it('should handle missing page number with default', async () => {
      const pageData: Page<string> = {
        items: ['item1', 'item2'],
        params: {
          limit: 2,
          count: 4,
        },
      };

      const nextPageData = new NavigablePage<string>({
        items: ['item3', 'item4'],
        params: {
          page: 2,
          limit: 2,
          count: 4,
        },
      });

      mockNextPageLoader.mockResolvedValueOnce(nextPageData);
      const navigablePage = new NavigablePage(pageData, mockNextPageLoader);

      await navigablePage.nextPage();

      expect(mockNextPageLoader).toHaveBeenCalledWith(2); // 1 (default) + 1
    });
  });

  describe('async iterator', () => {
    it('should iterate through single page', async () => {
      const pageData: Page<string> = {
        items: ['item1', 'item2', 'item3'],
        params: {
          page: 1,
          limit: 10,
          count: 3,
        },
      };

      const navigablePage = new NavigablePage(pageData);
      const items: string[] = [];

      for await (const item of navigablePage) {
        items.push(item);
      }

      expect(items).toEqual(['item1', 'item2', 'item3']);
    });

    it('should iterate through multiple pages', async () => {
      const page1Data: Page<string> = {
        items: ['item1', 'item2'],
        params: {
          page: 1,
          limit: 2,
          count: 5,
        },
      };

      const page2 = new NavigablePage<string>({
        items: ['item3', 'item4'],
        params: {
          page: 2,
          limit: 2,
          count: 5,
        },
      }, mockNextPageLoader);

      const page3 = new NavigablePage<string>({
        items: ['item5'],
        params: {
          page: 3,
          limit: 2,
          count: 5,
        },
      });

      mockNextPageLoader
        .mockResolvedValueOnce(page2)
        .mockResolvedValueOnce(page3);

      const navigablePage = new NavigablePage(page1Data, mockNextPageLoader);
      const items: string[] = [];

      for await (const item of navigablePage) {
        items.push(item);
      }

      expect(items).toEqual(['item1', 'item2', 'item3', 'item4', 'item5']);
      expect(mockNextPageLoader).toHaveBeenCalledTimes(2);
    });

    it('should handle empty pages', async () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };

      const navigablePage = new NavigablePage(pageData);
      const items: string[] = [];

      for await (const item of navigablePage) {
        items.push(item);
      }

      expect(items).toEqual([]);
    });

    it('should handle iteration errors gracefully', async () => {
      const page1Data: Page<string> = {
        items: ['item1', 'item2'],
        params: {
          page: 1,
          limit: 2,
          count: 4,
        },
      };

      mockNextPageLoader.mockRejectedValueOnce(new Error('Network error'));

      const navigablePage = new NavigablePage(page1Data, mockNextPageLoader);
      const items: string[] = [];

      await expect(async () => {
        for await (const item of navigablePage) {
          items.push(item);
        }
      }).rejects.toThrow('Network error');

      expect(items).toEqual(['item1', 'item2']); // First page items before error
    });
  });

  describe('toArray', () => {
    it('should convert single page to array', async () => {
      const pageData: Page<string> = {
        items: ['item1', 'item2', 'item3'],
        params: {
          page: 1,
          limit: 10,
          count: 3,
        },
      };

      const navigablePage = new NavigablePage(pageData);
      const result = await navigablePage.toArray();

      expect(result).toEqual(['item1', 'item2', 'item3']);
    });

    it('should convert multiple pages to array', async () => {
      const page1Data: Page<string> = {
        items: ['item1', 'item2'],
        params: {
          page: 1,
          limit: 2,
          count: 5,
        },
      };

      const page2 = new NavigablePage<string>({
        items: ['item3', 'item4'],
        params: {
          page: 2,
          limit: 2,
          count: 5,
        },
      }, mockNextPageLoader);

      const page3 = new NavigablePage<string>({
        items: ['item5'],
        params: {
          page: 3,
          limit: 2,
          count: 5,
        },
      });

      mockNextPageLoader
        .mockResolvedValueOnce(page2)
        .mockResolvedValueOnce(page3);

      const navigablePage = new NavigablePage(page1Data, mockNextPageLoader);
      const result = await navigablePage.toArray();

      expect(result).toEqual(['item1', 'item2', 'item3', 'item4', 'item5']);
    });

    it('should handle empty pages', async () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };

      const navigablePage = new NavigablePage(pageData);
      const result = await navigablePage.toArray();

      expect(result).toEqual([]);
    });

    it('should propagate errors from async iterator', async () => {
      const page1Data: Page<string> = {
        items: ['item1', 'item2'],
        params: {
          page: 1,
          limit: 2,
          count: 4,
        },
      };

      mockNextPageLoader.mockRejectedValueOnce(new Error('API error'));

      const navigablePage = new NavigablePage(page1Data, mockNextPageLoader);

      await expect(navigablePage.toArray()).rejects.toThrow('API error');
    });
  });

  describe('edge cases', () => {
    it('should handle complex object types', async () => {
      interface User {
        id: number;
        name: string;
      }

      const pageData: Page<User> = {
        items: [
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' },
        ],
        params: {
          page: 1,
          limit: 10,
          count: 2,
        },
      };

      const navigablePage = new NavigablePage(pageData);
      const users: User[] = [];

      for await (const user of navigablePage) {
        users.push(user);
      }

      expect(users).toEqual([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ]);
    });

    it('should handle very large page counts', () => {
      const pageData: Page<string> = {
        items: [],
        params: {
          page: 1,
          limit: 10,
          count: 1000000,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      expect(navigablePage.totalPages).toBe(100000);
      expect(navigablePage.hasNextPage).toBe(true);
    });

    it('should handle concurrent iterations', async () => {
      const pageData: Page<string> = {
        items: ['item1', 'item2', 'item3'],
        params: {
          page: 1,
          limit: 10,
          count: 3,
        },
      };

      const navigablePage = new NavigablePage(pageData);

      // Start two concurrent iterations
      const items1: string[] = [];
      const items2: string[] = [];

      const promise1 = (async () => {
        for await (const item of navigablePage) {
          items1.push(item);
        }
      })();

      const promise2 = (async () => {
        for await (const item of navigablePage) {
          items2.push(item);
        }
      })();

      await Promise.all([promise1, promise2]);

      expect(items1).toEqual(['item1', 'item2', 'item3']);
      expect(items2).toEqual(['item1', 'item2', 'item3']);
    });
  });
});