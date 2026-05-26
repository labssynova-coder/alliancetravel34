# 🗺️ REPO-STATE-AUDIT — Where Does Everything Live?

> **Bottom line: nothing is lost.** Every commit, stash, branch, worktree, and "scary" `git fsck` dangling object in this repo has been traced to a known, recoverable home. The full trilingual language switcher is safe inside `stash@{1}` (and mirrored by a phantom dangling commit). Its dependent mobile-nav refactor is safe in `stash@{0}`. The two `origin/claude/*` branches and the `v22-docs` worktree are old/duplicate artifacts that can be tidied later. Read this file whenever you feel "lost" — it is the master recovery map.

**Audit date:** 2026-05-25 · **Audited ref (HEAD):** `71c8d77` on `feat/v12-hierarchy-pass`
**Method:** read-only git only (`git show -s`, `git cat-file`, `git ls-tree`, `git stash list`, `git worktree list`, `git fsck --no-reflogs`, `git rev-list --left-right --count`). No stashes were popped, no branches deleted, no files touched except this doc.

> ## ⚡ STATUS UPDATE — 2026-05-25 (post-restore reconciliation)
> This audit snapshotted HEAD `71c8d77`. **HEAD has since advanced to `24c625e` and two facts changed:**
> - 🔄 **The i18n switcher was PARTIALLY RESTORED** — commit `24c625e feat(i18n): restore runtime language switcher` (2026-05-25 **12:36**). `i18n.js` is now **tracked/committed** (no longer just an untracked blob) and loaded via `<script>` on **all 8 pages**; the switcher pill CSS + RTL (`[dir="rtl"]`) shipped into `styles.css`; `docs/I18N-SEO.md` was revised from *"FR-only, locked"* → *"runtime engine ships as UX surface."* **Still pending:** the **161 `data-i18n` attrs** (so visible text does NOT translate yet) and **`stash@{0}`** (the dependent mobile-drawer nav refactor — `enhance.js` untouched, still unapplied).
> - 🧰 **`stash@{1}` is now partly superseded** — its engine + CSS are live in `24c625e`; it remains the **source for the 161 `data-i18n` markup attrs** not yet reapplied. `stash@{0}` is still fully unapplied. **Keep both.** The §5 "restore playbook" below is now a *finish-the-job* checklist (steps a/c/d done; b/e remain).
> - ⚠️ **Concurrent-session hazard — the actual root cause of "I got lost":** ≥4 Claude Code sessions ran against this *single* working tree today (CLI 11:33 & 11:36, VS Code ext 12:42, CLI 13:09) plus a `npx serve site -p 5501` preview server. One of them authored `24c625e` while another was documenting the feature as shelved. **Use one session per working tree (or a dedicated `git worktree` each)** to stop edits/commits from colliding. See `README.md` in this folder.

---

## 🧭 Ref Topology

```
                      origin/main
                      6d049c3  (2026-05-02 "Fix typo in project title in README.md")
                          │  ← the ONLY commit feat is "behind" on; reconciles on merge
                          │
   merge-base 005ccfc ───┤
                          │
                          ▼
   feat/v12-hierarchy-pass ............ HEAD = 71c8d77
        ▲  (local; 28 ahead of origin/feat, 81 ahead of origin/main, 1 behind origin/main)
        │
        ├── origin/feat/v12-hierarchy-pass   (28 commits behind local HEAD — just unpushed work)
        │
        ├── main (local)                     (HEAD is 65 ahead of it)
        │
   base 587ab0d (2026-05-21) ── both stashes hang off here
        │
        ├── 🧰 stash@{1}  9a84ddb's sibling → backing commit 5472d56c   [i18n switcher]
        │        ├─ parent1 587ab0d  (base)
        │        ├─ parent2 81a9250  (index/staged snapshot)
        │        └─ parent3 ed68595  (UNTRACKED tree) → site/assets/js/i18n.js  blob d82e096b
        │
        └── 🧰 stash@{0}  9a84ddb → 2 parents (587ab0d base + fc9fa5c index)  [mobile nav]

   FORKED LONG AGO @ merge-base 005ccfc (2026-05-02 14:56):
        ├── origin/claude/pitch-deck-standalone          (5 ahead / 81 behind HEAD)  📦 old pitch deck
        └── origin/claude/project-summary-marketing-rJVd8 (2 ahead / 81 behind HEAD)  📦 old pitch deck

   WORKTREE:
        └── .claude/worktrees/v22-docs  →  branch docs/v22-roadmap  @ 5c8e0e7
               (1 ahead / 7 behind HEAD — near-duplicate of committed 73be0c6, cherry-picked)

   👻 git fsck --no-reflogs reports:
        • 1 dangling commit  5472d56c  → IS stash@{1}'s backing commit (NOT lost work)
        • 16 dangling blobs              → normal git debris (stash internals / aborted edits)
```

---

## 📋 Master Inventory

| Ref / Object | Exact SHA / blob | Contains | Created | Recover command | Verdict |
|---|---|---|---|---|---|
| **HEAD** (`feat/v12-hierarchy-pass`) | `71c8d77` | Current working branch, 28 commits unpushed | live | — (you're on it) | ✅ keep |
| `origin/feat/v12-hierarchy-pass` | (remote tip) | The pushed state; 28 commits behind local | remote | `git push origin feat/v12-hierarchy-pass` | ✅ keep |
| `main` (local) | — | Trails HEAD by 65 commits | — | merge target | ✅ keep |
| `origin/main` | `6d049c3` | 1 commit feat lacks ("Fix typo … README") | 2026-05-02 | reconciles on merge (see below) | ✅ keep |
| **🧰 stash@{1}** — i18n switcher | backing commit `5472d56c`<br>tree `f5f6a61` | **The FULL trilingual language switcher.** 9 files / **+939 / −224**: `404.html`, `styles.css (+645)`, `azerbaidjan`, `cairo-sharm`, `index.html (+287)`, `istanbul`, `kuala-lumpur`, `sharm-constantine`, `voyages` | 2026-05-22 09:09 | `git stash apply stash@{1}` (see recovery notes — won't merge clean) | ✅ keep (high value) |
| ↳ untracked tree in stash@{1} | `ed68595c` | Holds the runtime engine file | 2026-05-22 09:09 | `git ls-tree -r ed68595c` | ✅ keep |
| ↳ **i18n.js engine** | blob `d82e096b` (**41 459 bytes**) | `site/assets/js/i18n.js` — runtime i18n engine | 2026-05-22 09:09 | `git cat-file -p d82e096b > <path>` | ✅ keep (crown jewel) |
| **🧰 stash@{0}** — mobile nav | `9a84ddb` (2 parents: `587ab0d` + `fc9fa5c`) | `site/assets/js/enhance.js` **+93 / −17** — mobile drawer refactor. **Depends on** stash@{1}'s lang-switcher | 2026-05-22 09:44 | `git stash apply stash@{0}` (apply AFTER {1}) | ✅ keep (dependent pair) |
| **👻 dangling commit** | `5472d56c` | Identical timestamp (09:09:20) + identical 939-line stat as stash@{1} | 2026-05-22 09:09 | n/a — it's stash@{1}'s internal backing commit | 👻 phantom (do NOT panic) |
| **👻 16 dangling blobs** | `2cf03c8`, `7500805`, `6311344`, `dea5c1a`, `9e26dfe`, `97a82ac`, `9629d1a`, `e7196c4`, `edd9ace`, `455d97d`, `471d78b`, `cfcd3d3`, `fccdc63`, `4b7eee4`, `cc0fe73` (+ stray) | Normal git debris — stash internals, aborted/superseded edits | various | `git cat-file -p <blob>` to peek if curious | 👻 phantom (harmless) |
| `origin/claude/pitch-deck-standalone` | tip `36be656` | Old B2B pitch-deck artifact, 5 commits | forked 2026-05-02 | see **PITCH-DECK-ARCHIVE.md** | 📦 archive |
| `origin/claude/project-summary-marketing-rJVd8` | tip `bab6b5a` | Old pitch deck / marketing summary, 2 commits | forked 2026-05-02 | see **PITCH-DECK-ARCHIVE.md** | 📦 archive |
| **Worktree** `.claude/worktrees/v22-docs` (`docs/v22-roadmap`) | `5c8e0e7` | Roadmap doc, near-duplicate of committed `73be0c6` (same subject; cherry-picked into HEAD) | 2026-05-22 16:26 | already in history as `73be0c6` | 🧹 trivial (tidy-able) |

> ⚠️ **Snapshot drift note:** earlier notes said "26 ahead." The live count today is **28 ahead** of `origin/feat`, **81 ahead / 1 behind** `origin/main`. The earlier note also estimated "~15 dangling blobs"; the live `fsck` shows **16**. HEAD itself moved from `693346d` to `71c8d77` since those notes — all expected branch progress, nothing lost.

---

## 🛟 How to Recover X (read-only-safe inspection commands)

All commands below are **safe to run** — none modify history or pop a stash. Anything that *would* change state is explicitly flagged.

### 1. Extract the i18n runtime engine (`i18n.js`) without touching the stash
The engine lives as blob `d82e096b` inside stash@{1}'s untracked-files tree. Dump it straight to disk:
```bash
# ⚠️ HEADS-UP: an untracked site/assets/js/i18n.js (also 41459 bytes) already exists
#   in the working tree. Write to a SAFE temp path first so you don't clobber it:
git cat-file -p d82e096b > site/assets/js/i18n.recovered.js
# verify it's the full 41459-byte engine:
git cat-file -s d82e096b      # → 41459
```

### 2. Inspect what stash@{1} (the language switcher) changes — before applying anything
```bash
git stash show --stat stash@{1}          # the 9-file / +939 summary
git stash show -p   stash@{1}             # full patch, read-only
git ls-tree -r ed68595c                   # the untracked file(s) it carries
```

### 3. Apply stash@{1} — knowing it will NOT merge cleanly after 28 commits of drift
The stash was created off base `587ab0d` (2026-05-21). HEAD has moved 28+ commits since, so a plain `apply` will conflict on `index.html`, `styles.css`, and the city pages.
```bash
# SAFEST: do it on a throwaway branch so HEAD stays pristine
git switch -c recover/i18n-switcher        # ⚠️ creates a branch (not destructive to stash)
git stash apply stash@{1}                  # ⚠️ applies (does NOT drop) — expect conflicts
#   → resolve conflicts in index.html / styles.css / city pages by hand,
#     using the patch from step 2 as the source of truth.
# The stash is preserved either way: `apply` never deletes it. Only `pop`/`drop` would.
```
Alternatively, recover **one file at a time** from the stash's tree without any merge:
```bash
git show stash@{1}:site/assets/css/styles.css > styles.from-stash.css   # read-only extract
git show stash@{1}:site/index.html            > index.from-stash.html
```

### 4. Recover the dependent mobile-nav refactor (stash@{0})
Apply **after** stash@{1}, since the drawer logic calls into the lang-switcher:
```bash
git stash show -p stash@{0}                # +93/-17 on enhance.js, read-only
git stash apply stash@{0}                   # ⚠️ apply AFTER {1}; preserves the stash
# or single-file extract:
git show stash@{0}:site/assets/js/enhance.js > enhance.from-stash.js
```

### 5. Prove the "dangling commit" is just stash@{1} (so fsck never alarms you again)
```bash
git show -s --format="%H %ci %s" 5472d56c    # same timestamp + subject as stash@{1}
git rev-parse stash@{1}                       # → 5472d56c…  (identical SHA)
```
Same SHA ⇒ it is **not** separate lost work; it's the stash's internal backing commit.

### 6. Reconcile the 1 commit feat is "behind" origin/main
`origin/main` tip `6d049c3` (README typo fix, 2026-05-02) is the single commit `feat` lacks. It folds in automatically when `feat` merges to `main`:
```bash
git log --oneline origin/main ^feat/v12-hierarchy-pass   # shows exactly: 6d049c3
# on merge, this commit is absorbed — no action needed now.
```

---

## 🧹 Safe-to-Tidy (with owner confirmation)

These items are recoverable elsewhere or stale. **None should be removed in this audit.**
Each command below is shown **for reference only**.

> 🚫 **DO NOT RUN any command in this section without explicitly confirming first.** They are destructive and are documented here purely so you know the option exists.

| Item | Why it's tidy-able | Prune command (⚠️ DO NOT RUN without confirming) |
|---|---|---|
| Worktree `.claude/worktrees/v22-docs` (`docs/v22-roadmap` @ `5c8e0e7`) | Content already in history as committed `73be0c6` (identical subject, cherry-picked). 1 ahead / 7 behind HEAD. | `git worktree remove .claude/worktrees/v22-docs` then `git branch -d docs/v22-roadmap` |
| `origin/claude/pitch-deck-standalone` (`36be656`) | Old pitch-deck artifact; archived in PITCH-DECK-ARCHIVE.md | `git push origin --delete claude/pitch-deck-standalone` |
| `origin/claude/project-summary-marketing-rJVd8` (`bab6b5a`) | Old pitch deck / marketing summary; archived in PITCH-DECK-ARCHIVE.md | `git push origin --delete claude/project-summary-marketing-rJVd8` |

> 💡 Leave the two stashes and all dangling objects **alone**. Once the i18n switcher is successfully recovered and committed, you may then choose to `git stash drop` — but that is a separate, deliberate, confirmed action, not part of any tidy-up here.

---

*This doc is part of the **`docs/CONTEXT/`** recovery set — siblings: **I18N-SWITCHER-RECOVERY.md**, **PITCH-DECK-ARCHIVE.md**, **SESSION-TIMELINE.md**.*
