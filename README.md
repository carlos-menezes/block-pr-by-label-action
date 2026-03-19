# block-pr-by-label-action

A GitHub Action that **fails the workflow** if a pull request has any of the specified labels, preventing it from being merged.

## Usage

```yaml
name: Block PR if it has certain labels

on:
  pull_request:
    types: [labeled, unlabeled, opened, synchronize, reopened]

jobs:
  check-labels:
    runs-on: ubuntu-latest
    steps:
      - name: Block PRs with do-not-merge or wip labels
        uses: carlos-menezes/block-pr-by-label-action@v1.0
        with:
          labels: |
            do-not-merge
            wip
```

If a label name contains a comma, keep it on a single line so it is parsed correctly:

```yaml
with:
  labels: |
    needs,review
    security-hold
```

## Inputs

| Input    | Required | Description                                                                 |
|----------|----------|-----------------------------------------------------------------------------|
| `labels` | ✅ Yes   | Newline-delimited labels to block (case-insensitive), one label per line. |

## Behaviour

- Compares the PR's current labels against the newline-delimited `labels` input (case-insensitive).
- If **any** label matches, the action calls `core.setFailed` with a message listing the matched labels, causing the workflow job to exit with code 1.
- If no labels match, it logs a success message and exits with code 0.

## Notes

- This action is designed for workflows triggered by `pull_request` (or `pull_request_target`) events. It will emit a warning and exit cleanly on other event types.
- The `dist/` directory is committed to the repository so the action can be consumed directly without a build step.

## Development

```bash
pnpm install
pnpm run lint
pnpm run format
pnpm run typecheck
pnpm run build
```

This repository uses Husky + lint-staged. On each commit, it will:

- format and lint staged `src/**/*.ts` files;
- run `pnpm run typecheck`.

On push, Husky runs:

- `pnpm run build`.

After making changes to `src/`, always run `pnpm build` and commit the updated `dist/` directory.