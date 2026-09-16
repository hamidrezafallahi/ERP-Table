# E2E harness (PR-133)

Playwright scenarios against a Vite harness (`e2e/harness`).

```bash
yarn e2e                  # run once
yarn e2e:update-snapshots # refresh visual baselines
yarn e2e:flake            # 10× run; fail if flake ≥ 1%
```

Locally uses system Chrome (`channel: 'chrome'`). CI installs Playwright Chromium.

Scenarios: edit+undo, clipboard paste, scroll 100k, sort/filter, Excel download, visual light/dark × LTR/RTL.
