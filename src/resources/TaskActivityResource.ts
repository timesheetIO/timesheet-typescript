import type { ApiClient } from '../http';
import type {
  Page,
  TaskActivity,
  TaskActivityImage,
  TaskActivityImageUpload,
  TaskActivityListParams,
  TaskActivityUpsert,
} from '../models';
import { NavigablePage } from '../models';
import { DateUtils } from '../utils/date';
import { Resource } from './Resource';

/**
 * Window activity and screenshots that the desktop app records for a task.
 * Only the owner of the task can read or write them.
 */
export class TaskActivityResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/task-activities');
  }

  /** Activities of one task in chronological order, each with its screenshots. */
  async list(params: TaskActivityListParams): Promise<NavigablePage<TaskActivity>> {
    const query = { taskId: params.taskId, page: params.page, limit: params.limit };
    const response = await this.http.get<Page<TaskActivity>>(this.basePath, query);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  /**
   * Inserts or updates up to 200 activities of a task by their id. Safe to repeat as a whole.
   * An activity that reaches outside the task's time range is clipped to it.
   *
   * @returns the activities that were stored. Ones that lie outside the task are left out.
   */
  async upsert(taskId: string, activities: TaskActivityUpsert[]): Promise<TaskActivity[]> {
    return this.http.post<TaskActivity[]>(`${this.basePath}/batch`, {
      taskId,
      activities: activities.map((activity) => ({
        ...activity,
        startDateTime: DateUtils.formatTimestamp(activity.startDateTime),
        endDateTime: DateUtils.formatTimestamp(activity.endDateTime),
      })),
    });
  }

  /** Permanently deletes an activity with its screenshots and their files. */
  async delete(id: string): Promise<void> {
    return this.http.delete<void>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async uploadImage(
    activityId: string,
    image: TaskActivityImageUpload,
  ): Promise<TaskActivityImage> {
    const { file, fileName, ...data } = image;
    const formData = new FormData();
    formData.append(
      'data',
      new Blob(
        [
          JSON.stringify({
            ...data,
            dateTime: data.dateTime && DateUtils.formatTimestamp(data.dateTime),
          }),
        ],
        { type: 'application/json' },
      ),
    );
    formData.append('file', file, fileName);
    return this.http.postMultipart<TaskActivityImage>(
      `${this.basePath}/${encodeURIComponent(activityId)}/images`,
      formData,
    );
  }

  /** A signed download URL, valid for a few minutes. */
  async getImageUrl(imageId: string): Promise<{ url: string }> {
    return this.http.get<{ url: string }>(
      `${this.basePath}/images/${encodeURIComponent(imageId)}/url`,
    );
  }

  /** Permanently deletes a screenshot and its file. */
  async deleteImage(imageId: string): Promise<void> {
    return this.http.delete<void>(`${this.basePath}/images/${encodeURIComponent(imageId)}`);
  }
}
