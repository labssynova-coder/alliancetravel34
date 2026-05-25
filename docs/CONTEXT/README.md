# 🧭 CONTEXT — "What happened to this repo, and where is everything?"

> **Read this first.** This folder exists because work on Alliance Travel felt *lost* — a language switcher you remembered building seemed to have vanished. **Nothing was lost.** This index gives you the current truth in one screen; the four sibling docs go deep.

**Last reconciled:** 2026-05-25 · **HEAD:** `24c625e` on `feat/v12-hierarchy-pass`

---

## ⚡ The 30-second answer

1. **You did build a trilingual (FR/EN/AR) language switcher.** It was never deleted.
2. On **2026-05-22** it was `git stash`-ed (`stash@{1}`), then a deliberate decision shelved it in favor of a **FR-only** site.
3. On **2026-05-25** a **concurrent Claude Code session** (one of ≥4 running in this same folder) **partially restored it** — commit `24c625e`. The switcher pill is now **live**, but it doesn't translate body text yet.
4. The reason it all *felt* chaotic: **multiple Claude Code sessions have been editing and committing in this one working directory at the same time.** That's the real root cause — not lost work.

---

## 🟢 Current state of the language switcher (HEAD `24c625e`)

| Capability | Live? |
|---|---|
| Switcher pill `FR · EN · عر` in the nav | ✅ |
| Flips `<html lang>` + `<html dir>` (RTL for Arabic) | ✅ |
| Lazy-loads Arabic fonts (Cairo/Tajawal) on first AR pick | ✅ |
| Persists choice in `localStorage` | ✅ |
| `i18n.js` engine committed + loaded on all 8 pages | ✅ |
| **Translates visible body text** | ❌ **not yet** — needs the 161 `data-i18n` attrs (still in `stash@{1}`) |
| Mobile drawer absorbs the switcher | ❌ not yet — needs `stash@{0}` (`enhance.js`) |

**So it's a working *chrome foundation*, not yet a translating site.** Finishing it = reapply the `data-i18n` attrs (bounded, per-page) + apply `stash@{0}`. Recipe: **`I18N-SWITCHER-RECOVERY.md` §5 (steps b + e)**.

---

## ⚠️ Root cause: concurrent sessions on one working tree

A process scan on 2026-05-25 found **≥4 Claude Code sessions** live against `C:\Users\ROG STRIX\Documents\alliance travel`:

- CLI `--effort max` (11:33) · CLI global (11:36) · **VS Code extension** (12:42) · CLI `--effort max` (13:09) · plus `npx serve site -p 5501`.

The three commits today (`9cd7dd1` 11:51, `71c8d77` 12:03, `24c625e` 12:36) came from these sessions — **not** from a cron job or background loop (`CronList`/`TaskList` are both empty). One session restored the switcher while another documented it as shelved. They didn't corrupt anything *this time*, but they can.

**✅ Recommended working rule:** **one Claude Code session per working tree.** If you want parallel work, give each session its own `git worktree` (`git worktree add ../alliance-<topic> <branch>`) so edits and commits never collide. Close stray sessions (CLI + VS Code extension running together is the trap).

---

## 🗂️ The four deep-dive docs

| Doc | Answers |
|---|---|
| **[REPO-STATE-AUDIT.md](REPO-STATE-AUDIT.md)** | Where every branch, stash, worktree, and `git fsck` "dangling" object lives, with exact SHAs + safe recovery commands. The master map. |
| **[I18N-SWITCHER-RECOVERY.md](I18N-SWITCHER-RECOVERY.md)** | Deep dive on the switcher: engine architecture, FR/EN/AR coverage, and the **finish-the-job checklist** (steps b + e remain). |
| **[SESSION-TIMELINE.md](SESSION-TIMELINE.md)** | The full build history in order — pitch deck → site → v21 cleanup → v22 → i18n decision → today's restore — and *why it looked scattered*. |
| **[PITCH-DECK-ARCHIVE.md](PITCH-DECK-ARCHIVE.md)** | The two old `origin/claude/*` pitch-deck branches (forked 2026-05-18), what they contain, and archive options. |

---

## ✅ Where things stand & sensible next steps

- **Site posture:** FR canonical for SEO (`hreflang="x-default"` on indexable pages) **+** a client-side language switcher as a UX surface. `docs/I18N-SEO.md` was revised 2026-05-25 to reflect this.
- **Branch:** `feat/v12-hierarchy-pass`, ~28+ commits ahead of `origin/feat` (unpushed), ~30 min from a Cloudflare Pages deploy per `docs/DEPLOY.md`.
- **Safe to do anytime:** `git push origin feat/v12-hierarchy-pass` to back up local work.

**Pick your next move (none are done automatically):**
1. **Finish the switcher** → `I18N-SWITCHER-RECOVERY.md` §5 steps (b) + (e). After that, EN/AR copy should get a brand-voice review (the original caveat in `I18N-SEO.md`).
2. **Verify it works** → serve locally and run the §5(f) checklist.
3. **Deploy as-is** → `docs/DEPLOY.md` (the switcher is a non-blocking enhancement).
4. **Tidy clutter** → prune the `v22-docs` worktree + 2 stale pitch-deck branches (commands in `REPO-STATE-AUDIT.md`, all flagged *confirm-before-running*).

---

*This `docs/CONTEXT/` set was generated read-only from git on 2026-05-25, then reconciled after discovering commit `24c625e` had restored the switcher mid-session. It documents repo state; it does not modify history.*
