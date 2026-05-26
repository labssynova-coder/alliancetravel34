# 🗄️ Archive

> Historical artifacts from the Alliance Travel build. Preserved for forensic reference, not for active maintenance. Treat everything in this folder as **frozen** — read-only, append-never.

The current source of truth for "what happened" is [`../STORY.md`](../STORY.md). The current operational reference is [`../reference/`](../reference/). Everything here is the **detailed primary source** behind those.

---

## Why these are archived (not deleted)

The Alliance Travel project went through ~30 Claude Code sessions, with overlapping work, parallel agents, and two file-system regressions. Multiple times we asked "what happened to feature X" and the answer was buried in one of these docs. **They're cheap to keep and expensive to recover.**

The user's directive when consolidating the docs (2026-05-26): *"i want you to rewrite the docs not remove them."* These files honor that.

---

## What's in here

### Cycle chronicles
| File | What it is |
|---|---|
| `ROADMAP.md` | The 942-line chronicle of every phase from v0 through v22. The source material `STORY.md` synthesizes. |
| `HANDOFF.md` | 852-line comprehensive handoff written at the v21 milestone. Architecture overview + every component. Superseded by `STORY.md` + `AUDIT.md`. |
| `QA-REPORT-v22.md` | Agent 5's read-only verification of the v22 cycle: 21-claim matrix + 10 master-prompt criteria + independent measurements. The numbers in `AUDIT.md` come from here. |
| `MOTION-CLEANUP-MASTER.md` | The v21 motion cleanup plan. Documented every keyframe, every transition, every cubic-bezier curve, and consolidated them down to 4 + 4. Outdated as a plan; useful as a historical record. |

### Cleanup investigations
| File | What it is |
|---|---|
| `CLEANUP-FLAGGED.md` | Issues flagged during a mid-v20 cleanup sweep. |
| `CLEANUP-SURVEY.md` | Earlier cleanup survey — what to remove, what to consolidate. |
| `SURVEY-BOOKING-CALCULATOR.md` | Pre-rewrite survey of the booking flow before v15 hardening landed. |

### Deploy guides (superseded)
| File | What it is |
|---|---|
| `DEPLOY-old-2026-05-13.md` | The original DEPLOY.md before the docs consolidation. Mentions the long-gone `feat/v12-hierarchy-pass` branch. |
| `LAUNCH-AND-DEPLOY.md` | An alternate deploy guide that overlapped with DEPLOY.md. |

The current deploy guide is at [`../DEPLOY.md`](../DEPLOY.md).

### Recovery dossiers (`CONTEXT/`)
Four dossiers written during the 2026-05-25 "where is everything?" session. The user reported the language switcher was missing; these dossiers documented the **forensic recovery map** — every stash, every dangling commit, every orphan branch traced to a known recoverable home.

| File | What it is |
|---|---|
| `CONTEXT/README.md` | Index of the four dossiers, the 30-second answer. |
| `CONTEXT/REPO-STATE-AUDIT.md` | "Where does everything live?" — the master recovery map. Read this if you ever feel lost. |
| `CONTEXT/I18N-SWITCHER-RECOVERY.md` | The 30-minute recovery operation for the i18n engine: extracting `i18n.js` from the dangling blob inside `stash@{1}`. |
| `CONTEXT/PITCH-DECK-ARCHIVE.md` | Investigation of the two orphan `claude/*` remote branches (since deleted, preserved as `archive/*` tags). |
| `CONTEXT/SESSION-TIMELINE.md` | Read-only git archaeology — the four-sentence answer to "how was this built?" |

### Migration scripts (`scripts/`)
| File | What it is |
|---|---|
| `scripts/_audit_colors.py` | Generated `reference/CSS-COLOR-AUDIT.csv`. One-shot — re-run only if styles.css drifts substantially. |
| `scripts/_migrate_inline_styles.py` | The script that dropped inline `style=""` from 243 to 102 in v22. Idempotent — safe to re-run if new inline styles creep in. |

---

## How to use this folder

- **Don't edit** files here. If something is wrong, append a "⚠️ as of YYYY-MM-DD this section is outdated; see [...]" header instead.
- **Cite from `STORY.md`** when you reference these docs externally — link, don't copy.
- **Don't delete** anything. Disk is cheap; context is expensive.
- **If you need to revive something** (e.g., bring back a piece of architecture), copy the relevant section into `../reference/` and update it for current state.

---

*Last updated: 2026-05-26 during the docs consolidation. If you're a future maintainer wondering "should I clean this folder up?" — no. The whole point is that it's preserved.*
