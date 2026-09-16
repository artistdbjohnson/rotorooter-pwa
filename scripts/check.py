#!/usr/bin/env python3
"""Static gates for the Roto-Rooter design-study PWA."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OFFICIAL_DESC = (
    "Roto-Rooter Plumbing and Water Cleanup® service is the #1 plumbing and "
    "drain cleaning company. Open & Available 24/7. Call 1-800-768-6911!"
)
FAILS: list[str] = []


def fail(msg: str) -> None:
    FAILS.append(msg)


def read(rel: str) -> str:
    path = ROOT / rel
    if not path.exists():
        fail(f"missing {rel}")
        return ""
    return path.read_text(encoding="utf-8")


def main() -> int:
    vercel = json.loads(read("vercel.json") or "{}")
    if vercel.get("cleanUrls") is not True:
        fail("vercel.json cleanUrls must be true")
    if vercel.get("trailingSlash") is not False:
        fail("vercel.json trailingSlash must be false")
    extra = set(vercel) - {"cleanUrls", "trailingSlash"}
    if extra:
        fail(f"vercel.json has extra keys: {sorted(extra)}")

    index = read("index.html")
    meta = re.search(r'<meta name="description" content="([^"]+)"', index)
    if not meta:
        fail("index.html missing meta description")
    else:
        got = meta.group(1).replace("&amp;", "&")
        if got != OFFICIAL_DESC:
            fail(f"index meta description is not the official line: {got!r}")
        if "The Plumbing Experts You" in got and "Over 90 Years" not in got:
            fail("index meta description is still truncated")

    for tag in ("og:title", "og:description", "og:image", "twitter:description"):
        if f'property="{tag}"' not in index and f'name="{tag}"' not in index:
            fail(f"index.html missing {tag}")

    css = read("css/app.css")
    js = read("js/app.js")
    if ".liquid-glass" not in css:
        fail("css missing .liquid-glass")
    if "--r: 5px" not in css:
        fail("css missing 5px craft radius")
    if "#C8102E" not in css:
        fail("css missing official red")
    if "prefers-reduced-motion" not in css:
        fail("css missing reduced-motion gate")
    if "visibilitychange" not in js:
        fail("js missing visibility gate")
    if "prefers-reduced-motion" not in js:
        fail("js missing reduced-motion gate")
    if "IntersectionObserver" not in js:
        fail("js missing visibility/offscreen gate")
    if "serviceWorker" not in js:
        fail("js missing service worker registration")

    manifest = json.loads(read("manifest.json") or "{}")
    if manifest.get("display") != "standalone":
        fail("manifest is not installable standalone")
    if not manifest.get("icons"):
        fail("manifest missing icons")

    for rel in (
        "sw.js",
        "manifest.json",
        "icons/icon.svg",
        "icons/icon-192.svg",
        "icons/icon-512.svg",
        "images/grain.svg",
        "images/og.png",
        "services.html",
        "reviews.html",
        "contact.html",
        "schedule.html",
        "checkout.html",
    ):
        if not (ROOT / rel).exists():
            fail(f"missing {rel}")

    pages = ["index.html", "services.html", "reviews.html", "contact.html", "schedule.html", "checkout.html"]
    for rel in pages:
        html = read(rel)
        if "Independent design study" not in html:
            fail(f"{rel} missing independent design-study disclaimer")
        if "liquid-glass" not in html:
            fail(f"{rel} missing liquid-glass chrome")
        if "hello@" + "dglxss.com" in html:
            fail(f"{rel} contains forbidden email")

    banned = "hello@" + "dglxss.com"
    for path in ROOT.rglob("*"):
        if ".git" in path.parts or path.is_dir():
            continue
        if path.suffix.lower() in {".png", ".webp", ".jpg", ".jpeg", ".gif", ".mp4"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if banned in text:
            fail(f"{path.relative_to(ROOT)} contains forbidden email")

    if FAILS:
        print("FAIL")
        for item in FAILS:
            print(f"- {item}")
        return 1
    print("PASS")
    print("official meta, OG, liquid glass, PWA, vercel.json, motion gates")
    return 0


if __name__ == "__main__":
    sys.exit(main())
