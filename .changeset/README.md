# Changesets

This repo uses [changesets](https://github.com/changesets/changesets) for version bumps (PR-134 / D25).

```bash
yarn changeset          # record a change
yarn changeset:version  # apply pending changesets → package.json + CHANGELOG
yarn changeset:publish  # npm publish (prefer GitHub Release workflow)
```

Semver policy: see [`CONTRIBUTING.md`](../CONTRIBUTING.md#versioning-d25).
