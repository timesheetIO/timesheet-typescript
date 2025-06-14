# Changelog

All notable changes to the Timesheet TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nothing yet

### Changed
- Nothing yet

### Deprecated
- Nothing yet

### Removed
- Nothing yet

### Fixed
- Fixed all ESLint errors throughout the codebase
- Added proper TypeScript types to replace `any` usage
- Fixed import type consistency for type-only imports
- Added typed interfaces for OAuth2 token responses
- Fixed Error.captureStackTrace type checking
- Updated tsconfig.json to include test files
- Fixed TypeScript compilation errors by adding generic type parameters to ApiClient methods
- Updated all resource list methods to properly type HTTP request parameters

### Security
- Nothing yet

## [1.0.0] - 2024-01-XX

### Added
- Initial release of the Timesheet TypeScript SDK
- Complete API coverage for all 108 endpoints
- Full TypeScript support with comprehensive type definitions
- Authentication support (API Key and OAuth2)
- All resource implementations:
  - Tasks (with search, status updates, time updates, printing)
  - Projects (full CRUD operations)
  - Tags (tag management)
  - Teams (team and member management)
  - Organizations (organization settings)
  - Timers (real-time time tracking)
  - Rates (billing rate configuration)
  - Expenses (expense tracking)
  - Notes (note attachments)
  - Pauses (break time tracking)
  - Documents (invoice/timesheet generation)
  - Reports (analytics and reporting)
  - Webhooks (event notifications with signature verification)
  - Integrations (third-party integrations)
  - Export (data export functionality)
- Automatic retry logic with exponential backoff
- Pagination support with async iterators
- Comprehensive error handling with typed exceptions
- Tree-shakeable ES modules build
- CommonJS and ESM dual package support
- Minimal dependencies (axios and jsonwebtoken only)
- Extensive JSDoc documentation
- Unit tests with high coverage
- Example applications
- GitHub Actions CI/CD pipeline

[Unreleased]: https://github.com/timesheetIO/timesheet-typescript/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/timesheetIO/timesheet-typescript/releases/tag/v1.0.0 