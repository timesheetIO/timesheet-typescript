import { TaskActivityResource } from '../../../resources/TaskActivityResource';
import { ApiClient } from '../../../http/ApiClient';
import type { TaskActivity } from '../../../models/TaskActivity';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

describe('TaskActivityResource', () => {
  let resource: TaskActivityResource;
  let mockClient: jest.Mocked<ApiClient>;

  const activity: TaskActivity = {
    id: '0123456789abcdef0123456789abcdef',
    taskId: 'task-1',
    appName: 'Code',
    startDateTime: '2026-09-19T09:00:00+02:00',
    endDateTime: '2026-09-19T09:30:00+02:00',
  };

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      postMultipart: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;

    resource = new TaskActivityResource(mockClient);
  });

  it('lists the activities of a task', async () => {
    mockClient.get.mockResolvedValueOnce({
      items: [activity],
      params: { page: 1, limit: 200, count: 1 },
    });

    const page = await resource.list({ taskId: 'task-1', limit: 200 });

    expect(mockClient.get).toHaveBeenCalledWith('/v1/task-activities', {
      taskId: 'task-1',
      page: undefined,
      limit: 200,
    });
    expect(page.items).toEqual([activity]);
  });

  it('upserts a batch under the task id and keeps offset timestamps as they are', async () => {
    mockClient.post.mockResolvedValueOnce([activity]);

    const stored = await resource.upsert('task-1', [activity]);

    expect(mockClient.post).toHaveBeenCalledWith('/v1/task-activities/batch', {
      taskId: 'task-1',
      activities: [activity],
    });
    expect(stored).toEqual([activity]);
  });

  it('deletes an activity and encodes the id', async () => {
    await resource.delete('a/b');
    expect(mockClient.delete).toHaveBeenCalledWith('/v1/task-activities/a%2Fb');
  });

  it('uploads an image as a data part plus a named file part', async () => {
    mockClient.postMultipart.mockResolvedValueOnce({
      id: 'img-1',
      taskActivityId: activity.id,
      taskId: 'task-1',
    });
    const file = new Blob(['jpeg'], { type: 'image/jpeg' });

    await resource.uploadImage(activity.id, {
      id: 'img-1',
      dateTime: '2026-09-19T09:10:00+02:00',
      width: 1600,
      height: 1000,
      file,
      fileName: 'screenshot.jpg',
    });

    const [path, formData] = mockClient.postMultipart.mock.calls[0];
    expect(path).toBe(`/v1/task-activities/${activity.id}/images`);
    expect((formData.get('file') as File).name).toBe('screenshot.jpg');
    const data = JSON.parse(await (formData.get('data') as Blob).text());
    expect(data).toEqual({
      id: 'img-1',
      dateTime: '2026-09-19T09:10:00+02:00',
      width: 1600,
      height: 1000,
    });
  });

  it('gets a signed url for an image', async () => {
    mockClient.get.mockResolvedValueOnce({ url: 'https://storage.example/signed' });

    const result = await resource.getImageUrl('img-1');

    expect(mockClient.get).toHaveBeenCalledWith('/v1/task-activities/images/img-1/url');
    expect(result.url).toBe('https://storage.example/signed');
  });

  it('deletes an image', async () => {
    await resource.deleteImage('img-1');
    expect(mockClient.delete).toHaveBeenCalledWith('/v1/task-activities/images/img-1');
  });

  it('passes API errors through', async () => {
    mockClient.post.mockRejectedValueOnce(new Error('Invalid permission'));
    await expect(resource.upsert('task-1', [activity])).rejects.toThrow('Invalid permission');
  });
});
