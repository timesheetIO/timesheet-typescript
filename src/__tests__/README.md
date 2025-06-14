# Timesheet TypeScript SDK Tests

This directory contains unit and integration tests for the Timesheet TypeScript SDK.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Create .env file with the following content:
cat > .env << EOF
# Required for integration tests
TIMESHEET_API_KEY=your_api_key_here

# Optional - defaults to production
TIMESHEET_API_BASE_URL=https://api.timesheet.io/v1

# Optional - for specific test scenarios
TEST_PROJECT_ID=
TEST_TEAM_ID=
TEST_ORGANIZATION_ID=

# Test Configuration
SKIP_INTEGRATION_TESTS=false
EOF
```

### 3. Get API Key

1. Log in to your Timesheet account at https://my.timesheet.io
2. Navigate to Development section: https://my.timesheet.io/development
3. Create a new API key
4. Copy the key immediately (it won't be shown again)
5. Add it to your `.env` file

**API Key Format**: Your API key should follow the format `prefix.secret`

Example: `iJ39Pmy1.hixzoMeXZ5xCUpsYxsoUyCykCC1BrAek`

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run only unit tests

```bash
npm test -- unit/
```

### Run only integration tests

```bash
npm test -- integration/
```

### Skip integration tests

```bash
SKIP_INTEGRATION_TESTS=true npm test
```

## Test Structure

```
src/__tests__/
├── setup.ts                    # Test setup and utilities
├── unit/                       # Unit tests (no API calls)
│   ├── auth/                   # Authentication tests
│   │   └── apikey.test.ts     # API key auth tests
│   ├── models/                 # Model validation tests
│   │   ├── task.model.test.ts # Task model tests
│   │   └── openapi-validation.test.ts # OpenAPI spec validation
│   └── client.test.ts         # Client initialization tests
└── integration/               # Integration tests (real API calls)
    ├── timer.integration.test.ts    # Timer workflow tests
    ├── projects.integration.test.ts # Projects CRUD tests
    ├── tasks.integration.test.ts    # Tasks CRUD tests
    ├── tags.integration.test.ts     # Tags CRUD tests
    └── rates.integration.test.ts    # Rates CRUD tests
```

## Test Categories

### Unit Tests

- Test individual components in isolation
- Mock external dependencies
- Fast execution
- No network calls
- Always run in CI

### Integration Tests

- Test against real API
- Require valid API key
- Slower execution (30 second timeout)
- Create/read/update/delete real data
- Skip automatically when no API key is configured

## Recent Fixes

### Jest Configuration

- ✅ Updated to modern ts-jest configuration
- ✅ Removed deprecated globals configuration
- ✅ Increased timeout to 30 seconds for integration tests
- ✅ Added `forceExit` and `detectOpenHandles` for better cleanup

### API Key Validation

- ✅ Added proper null/undefined handling
- ✅ Added API key format validation (prefix.secret)
- ✅ Improved error messages

### Test Setup

- ✅ Better handling of missing API keys
- ✅ Graceful skipping of integration tests when credentials unavailable
- ✅ Clear console messages about test status

### OpenAPI Validation

- ✅ Fixed field count expectations in model validation tests

## Model Validation

The tests validate TypeScript models against the OpenAPI specification. Key findings:

### Field Naming Issues

- `startTime` should be `startDateTime`
- `endTime` should be `endDateTime`

### Missing Fields

Many fields from the OpenAPI spec are missing from the current models:

- Nested objects (currently only IDs)
- Calculated fields (duration, salary, etc.)
- Metadata fields (deleted, lastUpdate, created)
- Additional data fields

### Recommendations

1. Update field names to match OpenAPI spec exactly
2. Add all missing fields as optional properties
3. Create separate DTOs for create/update/response operations
4. Add TypeScript enums for constants
5. Include options for nested object expansion

## Writing New Tests

### Unit Test Example

```typescript
import { SomeComponent } from '../../components/SomeComponent';

describe('SomeComponent', () => {
  test('should do something', () => {
    const component = new SomeComponent();
    const result = component.doSomething();
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example

```typescript
import { createTestClient, skipIfNoApiKey } from '../setup';

describe('Resource Integration Tests', () => {
  let client: TimesheetClient;

  beforeAll(() => {
    if (skipIfNoApiKey()) return;
    client = createTestClient();
  });

  test('should perform API operation', async () => {
    const result = await client.resource.operation();
    expect(result).toBeDefined();
  });
});
```

## Best Practices

1. **Clean up test data**: Always clean up resources created during tests
2. **Use unique names**: Generate unique names for test data using timestamps
3. **Handle errors gracefully**: Expect and test error scenarios
4. **Skip tests appropriately**: Skip integration tests when API key is not available
5. **Test edge cases**: Include tests for error handling and edge cases
6. **Document findings**: Document any discrepancies with the API

## Troubleshooting

### "API key not configured" message

- Make sure you've created `.env` file in the project root
- Ensure `TIMESHEET_API_KEY` is set with a valid API key
- Verify the API key format: `prefix.secret`

### 401 Unauthorized errors

- Check that your API key is valid and active
- Verify the API key format: `prefix.secret`
- Ensure you're using the correct base URL

### Test timeouts

- Integration tests now have 30 second timeout
- Tests may take longer due to network calls
- Consider running integration tests separately if needed

### Rate limiting

- The API has rate limits (100 requests/minute)
- Tests may fail if run too frequently
- Add delays between tests if needed 
