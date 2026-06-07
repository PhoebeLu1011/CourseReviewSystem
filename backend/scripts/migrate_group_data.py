import argparse
import json
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from migrations.group_data_migration import GroupDataMigration


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize group data and create indexes.")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write changes. Without this flag the migration runs as a dry-run.",
    )
    args = parser.parse_args()

    # Importing mongo connects immediately, so keep it out of tests and dry module imports.
    from mongo import db

    try:
        report = GroupDataMigration(db, apply_changes=args.apply).run()
    except ValueError as error:
        print(f"Migration stopped: {error}")
        raise SystemExit(1) from error
    print(json.dumps(report.to_dict(), indent=2, default=str))
    print("Migration applied." if args.apply else "Dry-run only. Re-run with --apply to write changes.")


if __name__ == "__main__":
    main()
