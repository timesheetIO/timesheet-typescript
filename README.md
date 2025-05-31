# Timesheet TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@timesheet/sdk.svg)](https://www.npmjs.com/package/@timesheet/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@timesheet/sdk.svg)](https://www.npmjs.com/package/@timesheet/sdk)
[![Build Status](https://github.com/timesheetIO/timesheet-typescript/workflows/NPM%20Build%20and%20Publish/badge.svg)](https://github.com/timesheetIO/timesheet-typescript/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

The official TypeScript SDK for the [Timesheet API](https://timesheet.io), providing a comprehensive solution for time tracking, project management, and team collaboration.

## Features

- ✅ **Complete API Coverage** - All 108 endpoints implemented
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
  name: 'My Project',
  description: 'Created with TypeScript SDK'
});

// Start a timer
const timer = await client.timers.start({
  projectId: project.id,
  description: 'Working on TypeScript SDK'
});

// List recent tasks
const tasks = await client.tasks.list({
  limit: 10,
  sort: 'created',
  order: 'desc'
});

console.log(`Found ${tasks.count} tasks`);
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
  oauth2: {
    accessToken: 'your-access-token'
  }
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
client.timers        // Real-time time tracking
client.rates         // Billing rates
client.expenses      // Expense tracking
client.notes         // Note attachments
client.pauses        // Break time tracking
client.documents     // Document generation
client.reports       // Analytics and reporting
client.webhooks      // Event notifications
client.integrations  // Third-party integrations
client.export        // Data export
```

## Examples

### Task Management

```typescript
// Create a task
const task = await client.tasks.create({
  projectId: 'project-id',
  description: 'Implement new feature',
  startTime: new Date(Date.now() - 3600000), // 1 hour ago
  endTime: new Date(),
  tags: ['development', 'frontend'],
  billable: true
});

// Update task
await client.tasks.update(task.id, {
  description: 'Implement new feature - completed'
});

// Search tasks
const results = await client.tasks.search({
  projectId: 'project-id',
  search: 'feature',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Project Management

```typescript
// Create a project
const project = await client.projects.create({
  name: 'New Website',
  teamId: 'team-id',
  color: '#3B82F6',
  billable: true,
  public: false
});

// List projects with filters
const projects = await client.projects.list({
  status: 'active',
  billable: true,
  limit: 20
});
```

### Timer Operations

```typescript
// Start a timer
const timer = await client.timers.start({
  projectId: 'project-id',
  description: 'Working on task'
});

// Pause the timer
await client.timers.pause({
  description: 'Taking a break'
});

// Resume the timer
await client.timers.resume();

// Stop and create task
const task = await client.timers.stop({
  description: 'Completed work'
});
```

### Pagination

```typescript
// Manual pagination
const firstPage = await client.tasks.list({ limit: 50 });
console.log(`Page ${firstPage.page} of ${firstPage.totalPages}`);

// Get next page
if (firstPage.hasMore) {
  const nextPage = await client.tasks.list({ 
    limit: 50, 
    page: firstPage.page + 1 
  });
}

// Auto-pagination with async iterator
for await (const task of client.tasks.listAll({ projectId: 'project-id' })) {
  console.log(task.description);
}

// Collect all results
const allTasks = await client.tasks.listAll({ 
  projectId: 'project-id' 
}).toArray();
```

### Error Handling

```typescript
import { 
  TimesheetApiError,
  TimesheetNotFoundError,
  TimesheetRateLimitError,
  TimesheetAuthError 
} from '@timesheet/sdk';

try {
  const task = await client.tasks.get('task-id');
} catch (error) {
  if (error instanceof TimesheetNotFoundError) {
    console.error('Task not found');
  } else if (error instanceof TimesheetRateLimitError) {
    console.error(`Rate limited. Retry after: ${error.retryAfter}s`);
  } else if (error instanceof TimesheetAuthError) {
    console.error('Authentication failed');
  } else if (error instanceof TimesheetApiError) {
    console.error(`API error: ${error.code} - ${error.message}`);
  }
}
```

### Advanced Configuration

```typescript
const client = new TimesheetClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://custom.timesheet.io',   // Custom API endpoint
  timeout: 30000,                            // Request timeout (30s)
  maxRetries: 5,                             // Retry attempts
  retryDelay: 1000,                          // Initial retry delay
  onRetry: (attempt, error) => {             // Retry callback
    console.log(`Retry attempt ${attempt}: ${error.message}`);
  }
});
```

### Webhook Handling

```typescript
// Create a webhook
const webhook = await client.webhooks.create({
  target: 'https://your-app.com/webhook',
  events: ['task.created', 'task.updated'],
  secret: 'your-webhook-secret'
});

// Verify webhook signature (in your webhook handler)
import { verifyWebhookSignature } from '@timesheet/sdk';

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-timesheet-signature'];
  const isValid = verifyWebhookSignature(
    req.body,
    signature,
    'your-webhook-secret'
  );
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook event
  const event = req.body;
  console.log(`Received ${event.type} event`);
});
```

### Export Data

```typescript
// Export tasks as CSV
const csvExport = await client.export.generate({
  type: 'csv',
  resource: 'tasks',
  filters: {
    projectId: 'project-id',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  }
});

// Export as PDF report
const pdfReport = await client.export.generate({
  type: 'pdf',
  resource: 'timesheet',
  filters: {
    userId: 'user-id',
    period: 'month'
  }
});
```

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  Task,
  Project,
  TaskCreateParams,
  TaskListParams,
  PaginatedResponse
} from '@timesheet/sdk';

// All methods are fully typed
const task: Task = await client.tasks.get('task-id');
const projects: PaginatedResponse<Project> = await client.projects.list();

// Type-safe parameters
const params: TaskCreateParams = {
  projectId: 'project-id',
  description: 'Task description',
  billable: true
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
- 💬 Discord: [Join our community](https://discord.gg/timesheet)
- 🐛 Issues: [GitHub Issues](https://github.com/timesheetIO/timesheet-typescript/issues)

## License

This SDK is distributed under the [Apache License 2.0](LICENSE.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

Made with ❤️ by the [Timesheet.io](https://timesheet.io) team 