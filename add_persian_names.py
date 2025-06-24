#!/usr/bin/env python3
"""add_persian_names.py

Augments the original `iran.csv` with a new `name_fa` column that contains the
person's Persian name extracted from the Farsi Wikipedia page (lang code `fa`).
If a Persian article is not available, the value `NA` is written.

Usage (from repo root):
    python add_persian_names.py  # writes iran_with_fa.csv
    python add_persian_names.py --in iran.csv --out iran.csv   # in-place

Requires: requests, beautifulsoup4
"""
import argparse
import csv
import sys
import time
import urllib.parse as up
from pathlib import Path

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "IranTimeline/1.0 (+https://github.com/eledah/iran-timeline)"
}

def fetch_persian_name(en_url: str, timeout: float = 10.0) -> str:
    """Return Persian name from an English Wikipedia article URL.

    If the fa interlanguage link is not found or request fails, returns "NA"."""
    try:
        r = requests.get(en_url, headers=HEADERS, timeout=timeout)
        r.raise_for_status()
    except Exception as exc:
        print(f"[warn] request failed for {en_url}: {exc}", file=sys.stderr)
        return "NA"

    soup = BeautifulSoup(r.text, "html.parser")
    fa_link = soup.select_one('li.interlanguage-link.interwiki-fa > a')
    if not fa_link:
        return "NA"

    href = fa_link.get("href", "")
    if not href:
        return "NA"

    # Decode the last path component and replace underscores with spaces
    name_encoded = href.split("/wiki/")[-1]
    name_decoded = up.unquote(name_encoded).replace("_", " ")
    return name_decoded or "NA"


def process_csv(in_path: Path, out_path: Path, sleep: float = 0.3):
    rows_out = []
    with in_path.open(newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        if "name_fa" not in fieldnames:
            fieldnames.append("name_fa")
        for row in reader:
            # Skip if already filled
            if row.get("name_fa") and row["name_fa"] != "NA":
                rows_out.append(row)
                continue
            en_url = row.get("link", "")
            row["name_fa"] = fetch_persian_name(en_url)
            print(f"{row['name']} -> {row['name_fa']}")
            rows_out.append(row)
            if sleep:
                time.sleep(sleep)

    with out_path.open("w", newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows_out)
    print(f"Written {len(rows_out)} rows to {out_path}")


def main():
    p = argparse.ArgumentParser(description="Add Persian names to iran.csv")
    p.add_argument("--in", dest="in_file", default="iran.csv",
                   help="Input CSV file (default: iran.csv)")
    p.add_argument("--out", dest="out_file", default="iran_with_fa.csv",
                   help="Output CSV file (default: iran_with_fa.csv)")
    p.add_argument("--nosleep", action="store_true",
                   help="Disable polite sleep between requests")
    args = p.parse_args()

    in_path = Path(args.in_file)
    out_path = Path(args.out_file)
    if not in_path.exists():
        print(f"Input file {in_path} not found", file=sys.stderr)
        sys.exit(1)
    process_csv(in_path, out_path, sleep=0 if args.nosleep else 0.3)


if __name__ == "__main__":
    main() 