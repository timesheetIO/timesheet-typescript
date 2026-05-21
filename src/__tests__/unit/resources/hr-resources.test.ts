/**
 * Unit tests for HR resources: Absences, AbsenceTypes, Contracts, ContractTemplates,
 * and Organization member management.
 */

import {
  AbsenceResource,
  AbsenceTypeResource,
  ContractResource,
  ContractTemplateResource,
  OrganizationResource,
} from '../../../resources';
import { ApiClient } from '../../../http';
import { ApiKeyAuth } from '../../../auth';
import { RetryConfig } from '../../../config';

jest.mock('../../../http/ApiClient');

describe('HR Resources', () => {
  let mockClient: jest.Mocked<ApiClient>;
  const orgId = 'org-123';

  beforeEach(() => {
    const mockAuth = new ApiKeyAuth('ts_testkey.123456');
    mockClient = new ApiClient({
      baseUrl: 'https://api.timesheet.io',
      authentication: mockAuth,
      retryConfig: new RetryConfig({ maxRetries: 0 }),
    }) as jest.Mocked<ApiClient>;
    mockClient.get = jest.fn().mockResolvedValue({ items: [], params: {} });
    mockClient.post = jest.fn().mockResolvedValue({ items: [], params: {} });
    mockClient.put = jest.fn().mockResolvedValue({});
    mockClient.delete = jest.fn().mockResolvedValue(undefined);
  });

  describe('AbsenceResource', () => {
    let resource: AbsenceResource;

    beforeEach(() => {
      resource = new AbsenceResource(mockClient);
    });

    test('should have all required methods', () => {
      expect(typeof resource.list).toBe('function');
      expect(typeof resource.search).toBe('function');
      expect(typeof resource.create).toBe('function');
      expect(typeof resource.get).toBe('function');
      expect(typeof resource.update).toBe('function');
      expect(typeof resource.delete).toBe('function');
      expect(typeof resource.approve).toBe('function');
      expect(typeof resource.reject).toBe('function');
      expect(typeof resource.cancel).toBe('function');
    });

    test('list should call correct endpoint', async () => {
      await resource.list(orgId);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences`,
        undefined,
      );
    });

    test('list should pass params', async () => {
      const params = { status: 'pending', startDateTime: '2026-01-01' };
      await resource.list(orgId, params);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences`,
        params,
      );
    });

    test('search should POST to search endpoint', async () => {
      const params = { userId: 'user-1', statuses: ['pending', 'approved'] };
      await resource.search(orgId, params);
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences/search`,
        params,
      );
    });

    test('create should POST absence data', async () => {
      mockClient.post = jest.fn().mockResolvedValue({ id: 'abs-1' });
      const data = {
        contractId: 'contract-1',
        absenceTypeId: 'type-1',
        startDateTime: '2026-03-20',
        endDateTime: '2026-03-22',
      };
      await resource.create(orgId, data);
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences`,
        data,
      );
    });

    test('get should fetch specific absence', async () => {
      mockClient.get = jest.fn().mockResolvedValue({ id: 'abs-1' });
      await resource.get(orgId, 'abs-1');
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences/abs-1`,
      );
    });

    test('update should PUT absence data', async () => {
      const data = { reason: 'Updated reason' };
      await resource.update(orgId, 'abs-1', data);
      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences/abs-1`,
        data,
      );
    });

    test('delete should DELETE absence', async () => {
      await resource.delete(orgId, 'abs-1');
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences/abs-1`,
      );
    });

    test('approve should POST to approve endpoint', async () => {
      mockClient.post = jest.fn().mockResolvedValue({ id: 'abs-1', status: 'approved' });
      await resource.approve(orgId, 'abs-1');
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences/abs-1/approve`,
      );
    });

    test('reject should POST with reason', async () => {
      mockClient.post = jest.fn().mockResolvedValue({ id: 'abs-1', status: 'rejected' });
      await resource.reject(orgId, 'abs-1', { reason: 'Not enough notice' });
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences/abs-1/reject`,
        { reason: 'Not enough notice' },
      );
    });

    test('cancel should POST with reason', async () => {
      mockClient.post = jest.fn().mockResolvedValue({ id: 'abs-1', status: 'cancelled' });
      await resource.cancel(orgId, 'abs-1', { reason: 'Plans changed' });
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absences/abs-1/cancel`,
        { reason: 'Plans changed' },
      );
    });
  });

  describe('AbsenceTypeResource', () => {
    let resource: AbsenceTypeResource;

    beforeEach(() => {
      resource = new AbsenceTypeResource(mockClient);
    });

    test('should have all required methods', () => {
      expect(typeof resource.list).toBe('function');
      expect(typeof resource.create).toBe('function');
      expect(typeof resource.get).toBe('function');
      expect(typeof resource.update).toBe('function');
      expect(typeof resource.delete).toBe('function');
    });

    test('list should call correct endpoint', async () => {
      await resource.list(orgId);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absence-types`,
        undefined,
      );
    });

    test('create should POST absence type data', async () => {
      mockClient.post = jest.fn().mockResolvedValue({ id: 'type-1' });
      const data = { code: 'VACATION', name: 'Vacation', paid: true };
      await resource.create(orgId, data);
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absence-types`,
        data,
      );
    });

    test('get should fetch specific type', async () => {
      mockClient.get = jest.fn().mockResolvedValue({ id: 'type-1' });
      await resource.get(orgId, 'type-1');
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absence-types/type-1`,
      );
    });

    test('update should PUT type data', async () => {
      const data = { name: 'Updated Vacation' };
      await resource.update(orgId, 'type-1', data);
      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absence-types/type-1`,
        data,
      );
    });

    test('delete should DELETE type', async () => {
      await resource.delete(orgId, 'type-1');
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/absence-types/type-1`,
      );
    });
  });

  describe('ContractResource', () => {
    let resource: ContractResource;

    beforeEach(() => {
      resource = new ContractResource(mockClient);
    });

    test('should have all required methods', () => {
      expect(typeof resource.list).toBe('function');
      expect(typeof resource.create).toBe('function');
      expect(typeof resource.get).toBe('function');
      expect(typeof resource.update).toBe('function');
      expect(typeof resource.delete).toBe('function');
      expect(typeof resource.activate).toBe('function');
      expect(typeof resource.suspend).toBe('function');
      expect(typeof resource.reactivate).toBe('function');
      expect(typeof resource.terminate).toBe('function');
    });

    test('list should call correct endpoint', async () => {
      await resource.list(orgId);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contracts`,
        undefined,
      );
    });

    test('create should POST contract data', async () => {
      mockClient.post = jest.fn().mockResolvedValue({ id: 'contract-1' });
      const data = { name: 'Full-time', userId: 'user-1', weeklyHours: 40 };
      await resource.create(orgId, data);
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contracts`,
        data,
      );
    });

    test('get should fetch specific contract', async () => {
      mockClient.get = jest.fn().mockResolvedValue({ id: 'contract-1' });
      await resource.get(orgId, 'contract-1');
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contracts/contract-1`,
      );
    });

    test('update should PUT contract data', async () => {
      const data = { weeklyHours: 32 };
      await resource.update(orgId, 'contract-1', data);
      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contracts/contract-1`,
        data,
      );
    });

    test('delete should DELETE contract', async () => {
      await resource.delete(orgId, 'contract-1');
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contracts/contract-1`,
      );
    });

    test('activate should PUT to activate endpoint', async () => {
      await resource.activate(orgId, 'contract-1');
      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contracts/contract-1/activate`,
      );
    });

    test('suspend should PUT to suspend endpoint', async () => {
      await resource.suspend(orgId, 'contract-1');
      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contracts/contract-1/suspend`,
      );
    });

    test('reactivate should PUT to reactivate endpoint', async () => {
      await resource.reactivate(orgId, 'contract-1');
      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contracts/contract-1/reactivate`,
      );
    });

    test('terminate should PUT to terminate endpoint', async () => {
      await resource.terminate(orgId, 'contract-1');
      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contracts/contract-1/terminate`,
      );
    });
  });

  describe('ContractTemplateResource', () => {
    let resource: ContractTemplateResource;

    beforeEach(() => {
      resource = new ContractTemplateResource(mockClient);
    });

    test('should have all required methods', () => {
      expect(typeof resource.list).toBe('function');
      expect(typeof resource.create).toBe('function');
      expect(typeof resource.get).toBe('function');
      expect(typeof resource.update).toBe('function');
      expect(typeof resource.delete).toBe('function');
    });

    test('list should call correct endpoint', async () => {
      await resource.list(orgId);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contract-templates`,
        undefined,
      );
    });

    test('create should POST template data', async () => {
      mockClient.post = jest.fn().mockResolvedValue({ id: 'tmpl-1' });
      const data = { name: 'Standard', weeklyHours: 40, dailyHours: 8 };
      await resource.create(orgId, data);
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contract-templates`,
        data,
      );
    });

    test('get should fetch specific template', async () => {
      mockClient.get = jest.fn().mockResolvedValue({ id: 'tmpl-1' });
      await resource.get(orgId, 'tmpl-1');
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contract-templates/tmpl-1`,
      );
    });

    test('update should PUT template data', async () => {
      const data = { name: 'Updated Standard' };
      await resource.update(orgId, 'tmpl-1', data);
      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contract-templates/tmpl-1`,
        data,
      );
    });

    test('delete should DELETE template', async () => {
      await resource.delete(orgId, 'tmpl-1');
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/contract-templates/tmpl-1`,
      );
    });
  });

  describe('OrganizationResource - Member Management', () => {
    let resource: OrganizationResource;

    beforeEach(() => {
      resource = new OrganizationResource(mockClient);
    });

    test('should have member management methods', () => {
      expect(typeof resource.listMembers).toBe('function');
      expect(typeof resource.getMember).toBe('function');
      expect(typeof resource.addMember).toBe('function');
      expect(typeof resource.updateMember).toBe('function');
      expect(typeof resource.removeMember).toBe('function');
    });

    test('listMembers should POST to members/list endpoint', async () => {
      await resource.listMembers(orgId);
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/members/list`,
        undefined,
      );
    });

    test('listMembers should pass search params', async () => {
      const params = { search: 'john', deleted: false };
      await resource.listMembers(orgId, params);
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/members/list`,
        params,
      );
    });

    test('getMember should GET specific member', async () => {
      mockClient.get = jest.fn().mockResolvedValue({ id: 'perm-1' });
      await resource.getMember(orgId, 'perm-1');
      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/members/perm-1`,
      );
    });

    test('addMember should POST member data', async () => {
      mockClient.post = jest.fn().mockResolvedValue({ id: 'perm-1' });
      const data = { email: 'john@example.com', admin: false };
      await resource.addMember(orgId, data);
      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/members`,
        data,
      );
    });

    test('updateMember should PUT member data', async () => {
      const data = { admin: true };
      await resource.updateMember(orgId, 'perm-1', data);
      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/members/perm-1`,
        data,
      );
    });

    test('removeMember should DELETE member', async () => {
      await resource.removeMember(orgId, 'perm-1');
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/v1/organizations/${orgId}/members/perm-1`,
      );
    });
  });
});
