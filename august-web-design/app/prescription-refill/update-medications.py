#!/usr/bin/env python3
"""Merge FDA-style drug data (brand_name, drug_class) into medications.json.

Usage:
    python3 update-medications.py <path-to-drug_data.json>

- Matches new-data `drug_name` against existing slug keys (lowercased, non-alnum -> "-").
- On match: writes/overwrites `brandName` and `drugClass` on the medication.
- Anything that doesn't match is written to `unmatched-drugs.json` next to this script.
"""

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
MEDS_PATH = HERE / "medications.json"
UNMATCHED_PATH = HERE / "unmatched-drugs.json"


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        return 1

    drug_data_path = Path(sys.argv[1]).expanduser()
    drugs = json.loads(drug_data_path.read_text())
    meds = json.loads(MEDS_PATH.read_text())

    meds_by_slug = {k: v for k, v in meds.items()}
    name_to_slug = {slugify(v["name"]): k for k, v in meds.items()}

    matched: list[str] = []
    unmatched: list[dict] = []

    for entry in drugs:
        drug_name = entry.get("drug_name", "")
        slug = slugify(drug_name)
        target_key = slug if slug in meds_by_slug else name_to_slug.get(slug)

        if target_key is None:
            unmatched.append(entry)
            continue

        med = meds_by_slug[target_key]
        med["brandName"] = entry.get("brand_name")
        med["drugClass"] = entry.get("drug_class")
        matched.append(target_key)

    MEDS_PATH.write_text(json.dumps(meds, indent=2) + "\n")
    UNMATCHED_PATH.write_text(json.dumps(unmatched, indent=2) + "\n")

    print(f"matched:   {len(matched)} / {len(drugs)}")
    print(f"unmatched: {len(unmatched)} -> {UNMATCHED_PATH.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
