# Contributing to AIMes V1

AIMes V1 is currently maintained as a small-team project. Community feedback is welcome, but the default collaboration path is issue-first rather than unsolicited large pull requests.

## What to Open First

- For bugs, open an issue with reproduction steps, expected behavior, actual behavior, environment, and relevant logs.
- For feature ideas, open an issue describing the manufacturing scenario, affected role, business value, and acceptance criteria.
- For security concerns, do not open a public issue. Follow [SECURITY.md](SECURITY.md).
- For commercial or deployment questions, see [_docs/commercial-vs-opensource.md](_docs/commercial-vs-opensource.md).

## Pull Request Expectations

Before opening a pull request:

- Keep the change surgical and focused on one problem.
- Match the existing architecture, naming, formatting, and test style.
- Update documentation when behavior, setup, security, or release workflow changes.
- Add or update tests that explain the intent of the change, not only the mechanics.
- Run the relevant local checks and paste the exact commands in the PR template.
- Do not include generated build outputs, local secrets, `.env` files, database dumps, or personal machine paths.

## Required Checks

Use the smallest relevant set for your change:

```powershell
dotnet restore src/backend/AIMes.slnx
dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore
dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore
dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore
dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore
```

For frontend changes:

```powershell
cd src/frontend
npm ci
npm run lint
npm run test:unit
npm run build
```

## Coding Rules

- Backend code follows nullable-enabled C# and treats warnings as errors.
- Use async/await for asynchronous work; do not add `.Result`, `.Wait()`, or `async void`.
- Propagate `CancellationToken` through asynchronous I/O paths.
- Use constructor injection; do not add service locators or mutable process-local shared state.
- Use `ILogger<T>` with structured message templates; do not add `Console.Write*` in application code.
- EF Core read paths should use `AsNoTracking()` unless the entity is intentionally tracked for update.
- Minimal API endpoints should keep shared concerns in endpoint filters or route groups.

## Documentation Records

When a contribution changes behavior, quality gates, release process, or known risk, update the same-day documents under `_docs`:

- `_docs/_changelog/yyyyMMdd-*.md`
- `_docs/_review/yyyyMMdd-*.md`
- `_docs/_todo/yyyyMMdd-*.md`
- `_docs/_issue/yyyyMMdd-*.md`

Keep these records factual: what changed, how it was verified, what was intentionally not covered, and what remains risky.

## Review Policy

Maintainers may ask for scope reduction before reviewing implementation detail. A small, well-tested change is preferred over a broad refactor that mixes unrelated cleanup with product behavior.
