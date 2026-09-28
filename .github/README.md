# GitHub automation

`dependabot.yml` configures dependency update proposals. `workflows/auto-tag.yml` creates a version tag and GitHub release after a pull request is merged into `main`. Workflow changes can affect releases, so keep trigger scope and permissions aligned with the intended release behavior.
