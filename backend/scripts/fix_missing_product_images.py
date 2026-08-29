# backend/scripts/fix_missing_product_images.py
"""Audit + repair product images that 404 — no manual psql required.

Case A: image_url points to a missing file  -> re-download to the SAME path.
Case B: image_url is NULL/empty             -> download file AND update rows by product name (all sellers together).
Idempotent: running twice changes nothing the second time.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import select, update

from app.core.database import AsyncSessionLocal  # adapt if your session factory has another name
from app.models.product import Product  # adapt module if your Product model lives elsewhere

import fill_product_images as fill  # reuse commons_thumb_url + download helpers

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PUBLIC_CANDIDATES = [
    PROJECT_ROOT / "via-app" / "public" / "products",
    PROJECT_ROOT / "frontend" / "public" / "products",
]
PUBLIC_DIR = next((d for d in PUBLIC_CANDIDATES if d.exists()), PUBLIC_CANDIDATES[0])


def fetch_to(slug: str, ext: str) -> Path | None:
    """Download a Commons thumbnail for a slug; return path or None."""
    target = PUBLIC_DIR / f"{slug}.{ext}"
    try:
        remote = fill.commons_thumb_url(slug.replace("-", " ").replace("_", " "))
        if not remote:
            return None
        fill.download(remote, target)
        return target
    except Exception as exc:
        print(f"[warn] download failed for {slug}: {exc}")
        return None


async def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    async with AsyncSessionLocal() as session:
        rows = (await session.execute(select(Product.id, Product.name, Product.image_url))).all()
        fixed_files = 0
        fixed_rows = 0
        for product_id, name, image_url in rows:
            if image_url:
                path = PUBLIC_DIR / image_url.replace("/products/", "", 1)
                if path.exists():
                    continue
                slug, _, ext = path.name.rpartition(".")
                if fetch_to(slug, ext or "jpg"):
                    fixed_files += 1
                    print(f"[file] restored missing {path.name}")
                else:
                    print(f"[skip] could not restore {path.name}")
                continue

            slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in name).strip("-")
            target = fetch_to(slug, "jpg")
            if target is None:
                print(f"[skip] no image for {name}")
                continue
            result = await session.execute(
                update(Product).where(Product.name == name).values(image_url=f"/products/{target.name}")
            )
            fixed_rows += result.rowcount
            print(f"[db] {name}: NULL -> /products/{target.name} ({result.rowcount} rows)")
        await session.commit()
        print(f"Done. Restored {fixed_files} missing files, updated {fixed_rows} NULL rows.")


if __name__ == "__main__":
    asyncio.run(main())