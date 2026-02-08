# Merge troubleshooting

If GitHub reports the branch has conflicts, the branch needs to be updated with the target branch (usually `main`).

## Recommended steps

1. Fetch the latest base branch.
2. Merge or rebase the base branch into your feature branch.
3. Resolve any conflicts in the listed files.
4. Commit the resolved changes and push.

## Notes for this repo

If you are running commands locally and `git remote -v` shows no remotes, add the correct `origin` remote first (e.g. from GitHub) before running fetch/merge.
