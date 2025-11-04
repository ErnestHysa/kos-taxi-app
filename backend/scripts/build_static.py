#!/usr/bin/env python3
"""Copy the built frontend assets into the Flask static directory."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIR = REPO_ROOT / 'frontend'
DIST_DIR = FRONTEND_DIR / 'dist'
STATIC_DIR = REPO_ROOT / 'backend' / 'src' / 'static'


def copy_assets() -> None:
    if not DIST_DIR.exists() or not any(DIST_DIR.iterdir()):
        raise FileNotFoundError(
            'frontend/dist/ is missing or empty. Run "pnpm run build" in the frontend directory first.'
        )

    STATIC_DIR.mkdir(parents=True, exist_ok=True)

    # Clear existing assets to avoid stale files.
    for item in STATIC_DIR.iterdir():
        if item.name == '.gitignore':
            continue
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()

    for item in DIST_DIR.iterdir():
        destination = STATIC_DIR / item.name
        if item.is_dir():
            shutil.copytree(item, destination)
        else:
            shutil.copy2(item, destination)


def main() -> int:
    try:
        copy_assets()
    except FileNotFoundError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # pragma: no cover - unexpected failure path
        print(f"Unexpected error while copying assets: {exc}", file=sys.stderr)
        return 1

    print(f"Copied assets from {DIST_DIR} to {STATIC_DIR}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
