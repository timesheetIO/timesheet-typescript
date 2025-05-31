# Contributing to Timesheet TypeScript SDK

Thank you for your interest in contributing to the Timesheet TypeScript SDK! We welcome contributions from the community.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or fix
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git

### Setting Up the Development Environment

```bash
# Clone the repository
git clone https://github.com/timesheetIO/timesheet-typescript.git
cd timesheet-typescript

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Code Style

We use ESLint and Prettier to maintain code quality and consistency:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run typecheck
```

### Style Guidelines

- Use TypeScript for all source files
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for all public APIs
- Keep functions small and focused
- Use async/await over promises where possible

## Testing

All contributions should include appropriate tests:

- Unit tests for individual functions
- Integration tests for API interactions
- Test edge cases and error conditions
- Maintain test coverage above 80%

```bash
# Run tests with coverage
npm run test:coverage
```

### Writing Tests

```typescript
describe('TaskResource', () => {
  it('should create a task', async () => {
    const task = await client.tasks.create({
      projectId: 'project-123',
      description: 'Test task'
    });
    
    expect(task.id).toBeDefined();
    expect(task.description).toBe('Test task');
  });
});
```

## Documentation

- Update the README.md for any new features
- Add JSDoc comments for all public methods
- Update the CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/)
- Include examples for new functionality

### JSDoc Example

```typescript
/**
 * Creates a new task.
 * 
 * @param params - The task creation parameters
 * @returns The created task
 * @throws {TimesheetApiError} If the API request fails
 * 
 * @example
 * ```typescript
 * const task = await client.tasks.create({
 *   projectId: 'project-123',
 *   description: 'Implement feature'
 * });
 * ```
 */
async create(params: TaskCreateParams): Promise<Task> {
  // Implementation
}
```

## Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation

3. **Commit Your Changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     ```
     feat: add task filtering by date range
     fix: correct timezone handling in task creation
     docs: update README with new examples
     test: add tests for error handling
     refactor: simplify pagination logic
     ```

4. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a Pull Request**
   - Provide a clear description of your changes
   - Reference any related issues
   - Ensure all tests pass
   - Wait for code review

## Reporting Issues

When reporting issues, please include:

- SDK version
- Node.js version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages/stack traces

## Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists
- Search for existing feature requests
- Provide a clear use case
- Explain why this would benefit other users

## Code of Conduct

Please be respectful and professional in all interactions. We strive to maintain a welcoming and inclusive community.

## Questions?

If you have questions about contributing:

- Check the [API documentation](https://timesheet.io/api/docs)
- Join our [Discord community](https://discord.gg/timesheet)
- Email us at support@timesheet.io

## License

By contributing to this project, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing to the Timesheet TypeScript SDK! 🎉 