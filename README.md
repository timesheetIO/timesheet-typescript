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
- ✅ **Authentication** - Built-in API Key, OAuth2, and OAuth 2.1 (PKCE) with automatic discovery (RFC 8414)
- ✅ **Real-Time Events** - Server-Sent Events (SSE) for live updates
- ✅ **File Uploads** - Multipart uploads for expense receipts and note attachments
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

### OAuth 2.1 Authentication (with PKCE)

OAuth 2.1 is the recommended authentication method for new applications. It requires PKCE (Proof Key for Code Exchange) for enhanced security.

```typescript
import { OAuth21Auth, generatePkceCodePair } from '@timesheet/sdk';

// Step 1: Generate PKCE code pair
const pkce = generatePkceCodePair();
// Store pkce.codeVerifier securely (e.g., in session storage)

// Step 2: Build authorization URL and redirect user
const authUrl = OAuth21Auth.buildAuthorizationUrl({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  codeChallenge: pkce.codeChallenge,
  codeChallengeMethod: pkce.codeChallengeMethod,
  state: 'random-csrf-state', // Optional but recommended
  scope: 'read write',        // Optional
});

// Redirect user to authUrl...

// Step 3: After user authorizes, exchange code for tokens
const auth = await OAuth21Auth.fromAuthorizationCode({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret', // Optional for public clients
  authorizationCode: codeFromCallback,
  redirectUri: 'https://your-app.com/callback',
  codeVerifier: pkce.codeVerifier,
});

// Step 4: Use with TimesheetClient
const client = new TimesheetClient({
  authentication: auth
});
```

#### OAuth 2.1 with Endpoint Discovery (RFC 8414)

The SDK supports automatic endpoint discovery from `/.well-known/oauth-authorization-server`, allowing you to dynamically configure OAuth endpoints:

```typescript
import { OAuth21Auth, OAuthDiscovery, generatePkceCodePair } from '@timesheet/sdk';

// Step 1: Discover OAuth endpoints
const discovery = new OAuthDiscovery();
const metadata = await discovery.discover('https://api.timesheet.io');

console.log('Authorization endpoint:', metadata.authorizationServer.authorization_endpoint);
console.log('Token endpoint:', metadata.authorizationServer.token_endpoint);
console.log('Supported scopes:', metadata.authorizationServer.scopes_supported);

// Step 2: Generate PKCE and build authorization URL using discovered endpoints
const pkce = generatePkceCodePair();

const authUrl = OAuth21Auth.buildAuthorizationUrl({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  codeChallenge: pkce.codeChallenge,
  codeChallengeMethod: pkce.codeChallengeMethod,
  scope: 'read write',
  state: 'random-csrf-state',
  authorizationEndpoint: metadata.authorizationServer.authorization_endpoint,
});

// Store pkce.codeVerifier and token endpoint securely, then redirect user
sessionStorage.setItem('pkce_verifier', pkce.codeVerifier);
sessionStorage.setItem('token_endpoint', metadata.authorizationServer.token_endpoint);

// Step 3: After callback, exchange code using discovered token endpoint
const auth = await OAuth21Auth.fromAuthorizationCode({
  clientId: 'your-client-id',
  authorizationCode: codeFromCallback,
  redirectUri: 'https://your-app.com/callback',
  codeVerifier: sessionStorage.getItem('pkce_verifier'),
  tokenEndpoint: sessionStorage.getItem('token_endpoint'),
});

const client = new TimesheetClient({
  authentication: auth
});
```

The `OAuthDiscovery` class provides caching and additional discovery options:

```typescript
import { OAuthDiscovery, discoverOAuth } from '@timesheet/sdk';

// Using convenience function (uses shared cached instance)
const result = await discoverOAuth('https://api.timesheet.io');

// Using class with custom options
const discovery = new OAuthDiscovery({
  cacheTtl: 3600000,           // Cache for 1 hour (default)
  timeout: 10000,              // Request timeout in ms
  fetchOpenIdConfig: true,      // Also fetch OpenID Connect config
  fetchProtectedResource: true, // Also fetch protected resource metadata (RFC 9728)
});

const metadata = await discovery.discover('https://api.timesheet.io');

// Check cache status
if (discovery.isCached('https://api.timesheet.io')) {
  console.log('Using cached metadata');
}

// Clear cache when needed
discovery.clearCache();
```

#### Using OAuth 2.1 with existing tokens

```typescript
import { OAuth21Auth } from '@timesheet/sdk';

// With just an access token
const auth = new OAuth21Auth('your-access-token');

// With refresh token for automatic token refresh
const auth = new OAuth21Auth({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret', // Optional for public clients
  refreshToken: 'your-refresh-token',
});

const client = new TimesheetClient({
  authentication: auth
});
```

## Resources

All API resources are available through the client:

```typescript
client.tasks             // Task management
client.projects          // Project management (including project members)
client.tags              // Tag management
client.teams             // Team management (including team members)
client.organizations     // Organization settings
client.timer             // Real-time time tracking
client.rates             // Billing rates
client.expenses          // Expense tracking (with file upload)
client.notes             // Note attachments (with file upload)
client.pauses            // Break time tracking
client.documents         // Document and invoice generation
client.webhooks          // Webhook subscriptions
client.automations       // Time tracking automation
client.todos             // Todo management
client.events            // Real-time SSE event streaming
client.absences          // Absence requests and approvals
client.absenceTypes      // Absence type configuration
client.contracts         // Employment contracts
client.contractTemplates // Contract templates
client.profile           // User profile
client.settings          // User settings
client.reports           // Reports API (documents, tasks, expenses, notes, exports)
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

// Search tasks (advanced filtering)
const results = await client.tasks.search({
  projectIds: ['project-id'],
  search: 'feature',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

> **`list()` vs `search()`** — `list()` is a `GET` and only forwards the filters its
> endpoint supports (typically `sort`, `order`, `page`, `limit`, plus a few
> endpoint-specific filters). Any other field is dropped before the request is sent.
> For advanced filtering (array filters like `projectIds`/`tagIds`, date ranges,
> free-text `search`, etc.) use `search()`, which sends the full `*ListParams` as a
> `POST` body. Both return a paginated `NavigablePage`.

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

### Real-Time Events (SSE)

Subscribe to live changes for tasks, projects, teams, and other entities via Server-Sent Events.

```typescript
const subscription = await client.events.subscribe({
  onConnected: (connectionId) => {
    console.log('Connected with ID:', connectionId);
  },
  onEvent: (event) => {
    switch (event.event) {
      case 'task.create':
        console.log('New task:', event.item);
        break;
      case 'task.update':
        console.log('Task updated:', event.item);
        break;
    }
  },
  onError: (error) => {
    console.error('SSE error:', error);
  },
});

// Check connection status
const status = await client.events.getStatus();

// Close when done
subscription.close();
```

### File Uploads

Attach receipts to expenses and files to notes via `multipart/form-data` uploads.

```typescript
// Upload a receipt to an existing expense
await client.expenses.uploadFile('expense-id', {
  file: fileBuffer,        // Buffer, Blob, or ReadableStream
  filename: 'receipt.pdf',
  contentType: 'application/pdf',
});

// Create a note with an attachment in one call
const note = await client.notes.createWithFile({
  taskId: 'task-id',
  description: 'Meeting notes',
  file: fileBuffer,
  filename: 'notes.pdf',
});
```

### Team and Project Members

```typescript
// Add a member to a team
const teamMember = await client.teams.addMember('team-id', {
  email: 'colleague@example.com',
  permission: { role: 'manager' },
});

// Get team members with current activity status
const status = await client.teams.getMemberStatus({
  teamId: 'team-id',
  status: 'running', // all | active | inactive | running | idle
});

// Add a member to a project
await client.projects.addMember('project-id', {
  userId: 'user-id',
  permission: { role: 'member' },
});

// List project members
const members = await client.projects.listMembers('project-id', {
  status: 'active',
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
// (use search() to filter by project; projectId is not a list() filter)
const allTasks = await client.tasks.search({ projectId: 'project-id' });
for await (const task of allTasks) {
  console.log(task.description);
}

// Collect all results across all pages
const allTasksArray = await client.tasks.search({
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
