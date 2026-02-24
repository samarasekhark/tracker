"""
example_script.py — Template Execution Script

This is a template for all scripts in the execution/ folder.
Each script must be:
  - Deterministic (same inputs → same outputs)
  - Reliable (handles errors gracefully)
  - Testable (can be run in isolation)
  - Repeatable (safe to run multiple times)

Usage:
    python execution/example_script.py --url <url> --pages <max_pages>
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path


# ── Configuration ─────────────────────────────────────────

TMP_DIR = Path(".tmp")
TMP_DIR.mkdir(exist_ok=True)

LOG_FILE = TMP_DIR / "error_log.txt"


# ── Helpers ───────────────────────────────────────────────

def log_error(message: str) -> None:
    """Write an error to the log file and stderr."""
    timestamp = datetime.utcnow().isoformat()
    entry = f"[{timestamp}] ERROR: {message}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(entry)
    print(entry, file=sys.stderr)


def validate_inputs(url: str, pages: int) -> bool:
    """Validate that all required inputs are present and reasonable."""
    if not url or not url.startswith("http"):
        log_error(f"Invalid URL: {url!r}")
        return False
    if pages < 1:
        log_error(f"Invalid page count: {pages}")
        return False
    return True


# ── Core Logic ────────────────────────────────────────────

def run(url: str, pages: int, output_format: str = "json") -> dict:
    """
    Main execution function.
    Replace this with your actual logic.
    """
    print(f"[INFO] Starting execution for URL: {url}, pages: {pages}")

    # --- Your logic here ---
    # Example: fetch data, process it, return results
    results = {
        "status": "success",
        "url": url,
        "pages_processed": pages,
        "timestamp": datetime.utcnow().isoformat(),
        "data": [],  # Replace with actual data
    }
    # --- End of your logic ---

    return results


def save_output(results: dict, output_format: str) -> None:
    """Persist results to the designated output system."""
    if output_format == "json":
        output_path = TMP_DIR / "output.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        print(f"[INFO] Results saved to {output_path}")
    else:
        print(f"[WARN] Unsupported output format: {output_format!r}")


# ── Entry Point ───────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Example execution script")
    parser.add_argument("--url", required=True, help="Target URL to process")
    parser.add_argument("--pages", type=int, default=5, help="Max pages to process")
    parser.add_argument("--output", default="json", help="Output format (json)")
    args = parser.parse_args()

    # Step 1: Validate inputs
    if not validate_inputs(args.url, args.pages):
        sys.exit(1)

    # Step 2: Execute core logic
    try:
        results = run(args.url, args.pages, args.output)
    except Exception as e:
        log_error(f"Unhandled exception: {e}")
        sys.exit(1)

    # Step 3: Validate output
    if not results.get("data") is not None:
        print("[WARN] Output appears empty — verify results before storing.")

    # Step 4: Save output
    save_output(results, args.output)

    print("[INFO] Execution complete.")
    return results


if __name__ == "__main__":
    main()
