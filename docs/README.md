# Docs

Current project documentation only. Historical cleanup notes and session logs
were removed from the active tree to keep the repository focused.

## Read These

- [DEPLOY.md](DEPLOY.md): production and demo deployment guide
- [reference/README.md](reference/README.md): asset, SEO, color, and CSS notes

## Structure

```text
docs/
├── README.md
├── DEPLOY.md
└── reference/
    ├── COLOR-MAP.md
    ├── CSS-COLOR-AUDIT.csv
    ├── CSS-DUPLICATES.md
    ├── CSS-IMPORTANT-RATIONALE.md
    ├── I18N-SEO.md
    ├── IMAGE-ASSETS.md
    ├── SITEMAP.md
    └── design-system/MASTER.md
```

## Rules

- Keep deployment instructions in `DEPLOY.md`.
- Keep operational inventories in `reference/`.
- Keep one-off investigations out of the active tree unless they are needed for
  maintenance today.
