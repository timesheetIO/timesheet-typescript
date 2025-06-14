# Timesheet TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@timesheet/sdk.svg)](https://www.npmjs.com/package/@timesheet/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@timesheet/sdk.svg)](https://www.npmjs.com/package/@timesheet/sdk)
[![Build Status](https://github.com/timesheetIO/timesheet-typescript/workflows/NPM%20Build%20and%20Publish/badge.svg)](https://github.com/timesheetIO/timesheet-typescript/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

The official TypeScript SDK for the [Timesheet API](https://timesheet.io), providing a comprehensive solution for time tracking, project management, and team collaboration.

## Features

- ✅ **Type-Safe** - Full TypeScript support with comprehensive types
- ✅ **Modern Architecture** - Promise-based with async/await support
- ✅ **Authentication** - Built-in API Key and OAuth2 support
- ✅ **Error Handling** - Typed exceptions for better error management
- ✅ **Pagination** - Automatic pagination with async iterators
- ✅ **Retry Logic** - Configurable retry with exponential backoff
- ✅ **Lightweight** - Minimal dependencies
- ✅ **Tree-Shakeable** - Import only what you need
- ✅ **Well Documented** - Extensive JSDoc and examples

## Installation

```bash
npm install @timesheet/sdk
# or
yarn add @timesheet/sdk
# or
pnpm add @timesheet/sdk
```

## Quick Start

```typescript
import { TimesheetClient } from '@timesheet/sdk';

// Initialize with API key
const client = new TimesheetClient({
  apiKey: 'your-api-key'
});

// Create a project
const project = await client.projects.create({
  title: 'My Project',
  description: 'Created with TypeScript SDK'
});

// Start a timer
const timer = await client.timer.start({
  projectId: project.id,
  startDateTime: new Date().toISOString()
});

// List recent tasks
const tasks = await client.tasks.list({
  limit: 10,
  sort: 'created',
  order: 'desc'
});

console.log(`Found ${tasks.params.count} tasks`);
```

## Authentication

### API Key Authentication

```typescript
const client = new TimesheetClient({
  apiKey: 'your-api-key'
});
```

### OAuth2 Authentication

```typescript
const client = new TimesheetClient({
  oauth2Token: 'your-access-token'
});

// With automatic token refresh
const client = new TimesheetClient({
  oauth2: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    refreshToken: 'your-refresh-token'
  }
});
```

## Resources

All API resources are available through the client:

```typescript
client.tasks         // Task management
client.projects      // Project management
client.tags          // Tag management
client.teams         // Team management
client.organizations // Organization settings
client.timer         // Real-time time tracking
client.rates         // Billing rates
client.expenses      // Expense tracking
client.notes         // Note attachments
client.pauses        // Break time tracking
client.documents     // Document generation
client.webhooks      // Event notifications
client.automations   // Time tracking automation
client.todos         // Task management
client.profile       // User profile
client.settings      // User settings
```

## Examples

### Task Management

```typescript
// Create a task
const task = await client.tasks.create({
  projectId: 'project-id',
  description: 'Implement new feature',
  startDateTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  endDateTime: new Date().toISOString(),
  tagIds: ['tag-1', 'tag-2'],
  billable: true
});

// Update task
await client.tasks.update(task.id, {
  description: 'Implement new feature - completed'
});

// Search tasks
const results = await client.tasks.searchAdvanced({
  projectIds: ['project-id'],
  search: 'feature',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Project Management

```typescript
// Create a project
const project = await client.projects.create({
  title: 'New Website',
  teamId: 'team-id',
  color: 3,
  taskDefaultBillable: true
});

// List projects with filters
const projects = await client.projects.list({
  status: 'active',
  limit: 20
});
```

### Timer Operations

```typescript
// Start a timer
const timer = await client.timer.start({
  projectId: 'project-id',
  startDateTime: new Date().toISOString()
});

// Pause the timer
await client.timer.pause({
  startDateTime: new Date().toISOString()
});

// Resume the timer
await client.timer.resume({
  endDateTime: new Date().toISOString()
});

// Stop and create task
const stoppedTimer = await client.timer.stop({
  endDateTime: new Date().toISOString()
});
```

### Pagination

```typescript
// Manual pagination
const firstPage = await client.tasks.list({ limit: 50 });
console.log(`Page ${firstPage.params.page} of ${firstPage.totalPages}`);
console.log(`Total items: ${firstPage.params.count}`);

// Get next page
if (firstPage.hasNextPage) {
  const nextPage = await firstPage.nextPage();
}

// Auto-pagination with async iterator
const allTasks = await client.tasks.list({ projectId: 'project-id' });
for await (const task of allTasks) {
  console.log(task.description);
}

// Collect all results across all pages
const allTasksArray = await client.tasks.list({ 
  projectId: 'project-id' 
}).then(page => page.toArray());
```

### Error Handling

```typescript
import { 
  TimesheetApiError,
  TimesheetAuthError,
  TimesheetRateLimitError
} from '@timesheet/sdk';

try {
  const task = await client.tasks.get('task-id');
} catch (error) {
  if (error instanceof TimesheetAuthError) {
    console.error('Authentication failed');
  } else if (error instanceof TimesheetRateLimitError) {
    console.error(`Rate limited. Retry after: ${error.retryAfter}s`);
  } else if (error instanceof TimesheetApiError) {
    console.error(`API error: ${error.statusCode} - ${error.message}`);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  Task,
  Project,
  TaskCreateRequest,
  TaskListQueryParams,
  NavigablePage
} from '@timesheet/sdk';

// All methods are fully typed
const task: Task = await client.tasks.get('task-id');
const projects: NavigablePage<Project> = await client.projects.list();

// Type-safe parameters
const params: TaskCreateRequest = {
  projectId: 'project-id',
  description: 'Task description',
  billable: true,
  startDateTime: new Date().toISOString()
};
```

## Documentation

- [API Documentation](https://timesheet.io/api/docs)
- [TypeScript API Reference](https://timesheetio.github.io/timesheet-typescript)
- [Examples](https://github.com/timesheetIO/timesheet-typescript/tree/main/examples)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development

```bash
# Clone the repository
git clone https://github.com/timesheetIO/timesheet-typescript.git
cd timesheet-typescript

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Generate documentation
npm run docs
```

## Support

- 📧 Email: support@timesheet.io
- 🐛 Issues: [GitHub Issues](https://github.com/timesheetIO/timesheet-typescript/issues)

## License

This SDK is distributed under the [Apache License 2.0](LICENSE.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

Made with ❤️ by the [timesheet.io](https://timesheet.io) team 
