#!/usr/bin/env python
"""
Apply the 3 marketing-agent copy upgrades to site/assets/js/i18n.js.

Reads each proposal MD, extracts the ```js fenced block (the new T.<lang>
object literal), then stitches a new i18n.js by replacing the corresponding
language section while preserving the engine code unchanged.

Boundaries in current i18n.js (verified):
  preamble:    lines 1-35
  fr block:    lines 36-234   (T.fr = { ... },)
  separator:   lines 235-236
  en block:    lines 237-431  (T.en = { ... },)
  separator:   lines 432-433
  ar block:    lines 434-628  (T.ar = { ... })
  postamble:   lines 629-end  (closing of const T, engine functions)
"""
import io, re, sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ROOT = Path(r'C:/Users/ROG STRIX/Documents/alliance travel')
TARGET = ROOT / 'site' / 'assets' / 'js' / 'i18n.js'
PROPOSALS_DIR = ROOT / 'docs' / '_archive' / 'copy-revisions-2026-05-26'

LANG_BOUNDS = {
    'fr': (35, 234),  # 0-indexed inclusive: lines 36-234 → index 35 to 233
    'en': (236, 431),
    'ar': (433, 628),
}

def extract_js_block(md_path: Path) -> str:
    """Pull the first ```js ... ``` fenced block from a proposal MD."""
    text = md_path.read_text(encoding='utf-8')
    m = re.search(r'```(?:js|javascript)\s*\n(.*?)\n```', text, re.DOTALL)
    if not m:
        raise RuntimeError(f'No ```js block found in {md_path.name}')
    return m.group(1).rstrip()

def normalize_block(raw: str, lang: str) -> str:
    """Each agent might have returned the block in one of these shapes:
       (a) the raw object literal `{...}` with no `lang:` prefix
       (b) `fr: {...},`
       (c) `T.fr = {...};`
       (d) the whole `const T = { fr: {...} }` wrapper
       We want exactly:
           `    {lang}: {\n      ... contents ...\n    }`
       with 4-space outer indent matching the existing file.
    """
    # Find the `lang:` keyword anywhere in the raw text (skipping comments
    # and wrappers naturally — we don't need to strip them).
    m = re.search(r'\b' + lang + r'\s*:\s*\{', raw)
    if not m:
        # Maybe the agent omitted the lang prefix and gave us bare `{ ... }`
        # (with possibly a leading comment). Strip leading whitespace +
        # comments, then expect `{`.
        s = raw.lstrip()
        while True:
            if s.startswith('/*'):
                end = s.find('*/')
                if end < 0: break
                s = s[end+2:].lstrip()
            elif s.startswith('//'):
                nl = s.find('\n')
                s = s[nl+1:].lstrip() if nl >= 0 else ''
            else:
                break
        if not s.startswith('{'):
            raise RuntimeError(f'{lang} block does not contain `{lang}:` and does not start with `{{`: {s[:80]}')
        start_brace = 0
    else:
        s = raw[m.end()-1:]  # start at the `{`
        start_brace = 0
    # Now s starts with `{` — find the matching closing `}`
    # Find matching closing brace for the outermost object
    depth = 0
    end = -1
    in_string = None
    i = 0
    while i < len(s):
        c = s[i]
        if in_string:
            if c == '\\':
                i += 2
                continue
            if c == in_string:
                in_string = None
        else:
            if c in '"\'':
                in_string = c
            elif c == '`':
                in_string = '`'
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    end = i
                    break
        i += 1
    if end < 0:
        raise RuntimeError(f'{lang} block has unbalanced braces')
    body = s[:end+1]
    # Re-indent: existing file uses 4-space outer indent for `lang:` and 6-space
    # for child entries. The proposal might already match; we just ensure the
    # outer `lang: {` line and final `}` are at 4 spaces.
    lines = body.split('\n')
    # If the agent indented their block at 0 or 2 spaces, shift to match the
    # surrounding context (4-space). We detect by looking at the second line's
    # leading whitespace and the closing brace.
    if len(lines) > 1:
        # Find minimum non-zero indent across inner lines (proxy for base indent)
        inner_indents = []
        for ln in lines[1:-1]:
            if ln.strip():
                inner_indents.append(len(ln) - len(ln.lstrip(' ')))
        if inner_indents:
            current_base = min(inner_indents)
            target_base = 6  # children of `lang: {` should sit at 6-space indent
            shift = target_base - current_base
            if shift != 0:
                new_lines = [lines[0]]
                for ln in lines[1:]:
                    if ln.strip():
                        if shift > 0:
                            new_lines.append(' ' * shift + ln)
                        else:
                            # shrink: strip up to -shift spaces from front
                            stripped = ln[max(0, -shift):] if ln[:-shift].strip() == '' else ln
                            # safer: only shrink if line starts with at least -shift spaces
                            lead = len(ln) - len(ln.lstrip(' '))
                            if lead >= -shift:
                                new_lines.append(ln[-shift:])
                            else:
                                new_lines.append(ln.lstrip(' '))
                    else:
                        new_lines.append(ln)
                lines = new_lines
    body = '\n'.join(lines)
    # Final assembly
    return f'    {lang}: {body},'

def main():
    if not TARGET.exists():
        sys.exit(f'Target not found: {TARGET}')

    new_blocks = {}
    for lang in ('fr', 'en', 'ar'):
        proposal = PROPOSALS_DIR / f'i18n-{lang}-proposed.md'
        if not proposal.exists():
            sys.exit(f'Proposal missing: {proposal}')
        raw = extract_js_block(proposal)
        normalized = normalize_block(raw, lang)
        new_blocks[lang] = normalized
        print(f'  {lang}: extracted {len(normalized)} chars, '
              f'{len(normalized.splitlines())} lines')

    # The AR block is the LAST in T, so it should NOT have a trailing comma
    new_blocks['ar'] = new_blocks['ar'].rstrip(',')

    # Rebuild i18n.js
    src_lines = TARGET.read_text(encoding='utf-8').split('\n')
    out_lines = []
    # Preamble (before fr)
    out_lines.extend(src_lines[:LANG_BOUNDS['fr'][0]])
    # FR
    out_lines.extend(new_blocks['fr'].split('\n'))
    # Separator FR→EN
    out_lines.extend(src_lines[LANG_BOUNDS['fr'][1]+1:LANG_BOUNDS['en'][0]])
    # EN
    out_lines.extend(new_blocks['en'].split('\n'))
    # Separator EN→AR
    out_lines.extend(src_lines[LANG_BOUNDS['en'][1]+1:LANG_BOUNDS['ar'][0]])
    # AR
    out_lines.extend(new_blocks['ar'].split('\n'))
    # Postamble (from line after AR end onwards)
    out_lines.extend(src_lines[LANG_BOUNDS['ar'][1]+1:])

    new_src = '\n'.join(out_lines)
    TARGET.write_text(new_src, encoding='utf-8')
    print(f'\nWrote {len(new_src)} bytes, {len(out_lines)} lines.')
    print(f'Old size: {sum(len(l) for l in src_lines) + len(src_lines)} bytes')
    print(f'New size: {len(new_src)} bytes')

if __name__ == '__main__':
    main()
