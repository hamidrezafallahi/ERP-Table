# Contributing

Thanks for helping with `persian-data-grid`. English is the source language for docs (D23); Persian translations are welcome beside it.

## Before you change code

1. Read [`WORKLOG.md`](./WORKLOG.md) (Current Snapshot).
2. Read [`docs/agent-handoff.md`](./docs/agent-handoff.md).
3. Take the first unchecked `PR-N` in [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) Phase 16+.
4. Do not reopen Phase 1–15 except for a bugfix.

Open decisions `D13`–`D21` and `D23`–`D25` are locked — execute them. Only **D22 (monorepo)** is still open; ask before `PR-132`.

## Setup

Node 18+ and Yarn. The lockfile is `yarn.lock` (no `package-lock.json`).

```bash
yarn install --frozen-lockfile
yarn test
yarn typecheck:publish
yarn typecheck:host-ui
yarn lint:publish
yarn typecheck:publish
yarn typecheck:host-ui
yarn build
yarn verify:dist
yarn size
```

Local demo: `yarn dev` (port 5175).

Docs site (VitePress + TypeDoc): `yarn docs:dev` · `yarn docs:build` · `yarn deploy:docs`.

## Architecture

- `domain/` and `application/` never import React or DOM.
- Data logic (sort, filter, aggregation, cell range) lives in `engine/` as pure functions, not in React components.
- Hot-path algorithms (keyboard, scroll, edit) must be `O(window)` or `O(log n)`.
- No README or docs claim without a CI test. Delete the claim rather than invent a fake test.
- Feature PRs must declare their bundle cost in `size-limit`.

Deprecated aliases (D13 / D14 / D18 / D24) need all four of: `@deprecated` tag, a test that both paths work, a `MIGRATION.md` row, and a codemod entry (`PR-131`).

## Versioning (D25)

Follow [SemVer](https://semver.org/). Pre-`1.0.0` track:

| Range | Meaning |
|-------|---------|
| `0.6.0` … `0.13.x` | Phase 16–24 feature trains; each release ships `CHANGELOG.md` + `MIGRATION.md` rows |
| `x.y.z-next.n` | Prerelease on the npm **`next`** dist-tag (e.g. `0.13.0-next.0`; early adopters; may break) |
| `1.0.0` | Only when `scripts/release-gate.mjs` is green (PR-135). Deprecated aliases from D13/D14/D18/D24 are removed |

### How to release

1. Record the change: `yarn changeset`
2. Apply bumps when cutting a release: `yarn changeset:version` (updates `package.json` + `CHANGELOG.md`)
3. Tag matching `package.json`: `git tag v$(node -p "require('./package.json').version")`
4. Push the tag → [`.github/workflows/release.yml`](./.github/workflows/release.yml):
   - runs `yarn prepublishOnly`
   - `npm publish --provenance --access public`
   - prerelease versions (`*-next.*`, etc.) use `--tag next`; stables use `--tag latest`
   - opens a GitHub Release whose body is extracted from `CHANGELOG.md` (`yarn release:notes`)

Dry-run a next-channel pack without uploading: `yarn release:next:dry`.

Check whether `1.0.0` is allowed: `yarn release:gate` (must be green before tagging `1.0.0`; expected red until differentiation ≥ 90, main gzip ≤ 60 KB per gap-analysis §۴, and D22 monorepo).

`1.0.0` must not be tagged until PR-135 `release-gate` passes.

## Reporting issues

Use the GitHub issue templates. Security reports: [`SECURITY.md`](./SECURITY.md).
