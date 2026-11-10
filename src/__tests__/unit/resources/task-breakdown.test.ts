import { OrganizationResource } from '../../../resources/OrganizationResource';
import { TaskResource } from '../../../resources/TaskResource';
import { ApiClient } from '../../../http/ApiClient';
import type { TaskBreakdown } from '../../../models';

jest.mock('../../../http/ApiClient');

describe('TaskResource.breakdown', () => {
  it('posts the filter to tasks/breakdown and returns the totals', async () => {
    const mockClient = { post: jest.fn() } as unknown as jest.Mocked<ApiClient>;
    const breakdown: TaskBreakdown = {
      projects: [
        {
          id: 'p1',
          name: 'Website',
          color: 3,
          duration: 7200,
          durationBreak: 600,
          salaryTotal: '120.00',
          salaryBreak: '10.00',
          taskCount: 2,
          lastStartDateTime: '2026-11-10T09:00:00+01:00',
        },
      ],
      members: [],
      tags: [],
      locations: [],
      days: [
        {
          id: '2026-11-10',
          duration: 7200,
          durationBreak: 600,
          salaryTotal: '120.00',
          salaryBreak: '10.00',
          taskCount: 2,
        },
      ],
    };
    mockClient.post.mockResolvedValueOnce(breakdown);

    const params = { startDate: '2026-11-01', endDate: '2026-11-30', filter: 'billable' };
    const result = await new TaskResource(mockClient).breakdown(params);

    expect(mockClient.post).toHaveBeenCalledWith('/v1/tasks/breakdown', params);
    expect(result).toEqual(breakdown);
  });
});

describe('OrganizationResource.list', () => {
  it('sends includeFormer as a query parameter', async () => {
    const mockClient = { get: jest.fn() } as unknown as jest.Mocked<ApiClient>;
    mockClient.get.mockResolvedValueOnce({ items: [], params: { count: 0 } });

    await new OrganizationResource(mockClient).list({ includeFormer: true, page: 1, limit: 20 });

    expect(mockClient.get).toHaveBeenCalledWith(
      '/v1/organizations',
      expect.objectContaining({ includeFormer: true, page: 1, limit: 20 }),
    );
  });
});
