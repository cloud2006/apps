#!/usr/bin/env python3
"""Stamp local CSS/JS references in every page with a content hash (?v=...).

Cloudflare tells browsers to cache CSS/JS for hours while HTML is always fresh,
so after a deploy visitors can get new markup with stale styles. Run this before
committing whenever a .css or .js file changes:

    python3 scripts/version-assets.py
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REF = re.compile(r'(?P<attr>href|src)="(?P<path>(?!https?:|//)[^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]*)?"')


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:10]


def stamp(page: Path) -> bool:
    html = page.read_text()

    def repl(m: re.Match) -> str:
        asset = (page.parent / m["path"]).resolve()
        if not asset.is_file():
            raise SystemExit(f"{page.relative_to(ROOT)}: missing {m['path']}")
        return f'{m["attr"]}="{m["path"]}?v={digest(asset)}"'

    new = REF.sub(repl, html)
    if new != html:
        page.write_text(new)
        return True
    return False


if __name__ == "__main__":
    pages = sorted(p for p in ROOT.rglob("*.html") if ".git" not in p.parts and ".claude" not in p.parts)
    changed = [p.relative_to(ROOT) for p in pages if stamp(p)]
    print("\n".join(f"updated {p}" for p in changed) or "all pages up to date")
