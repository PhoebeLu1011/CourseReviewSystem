"""
seed_courses.py — Import ALL NTNU courses from CSV into MongoDB.
Unique key: {serialNumber}_{academicYear}_{semester}

Usage (run from the backend/ directory):
    python scripts/seed_courses.py [path/to/courses.csv]
"""
import sys
import os
import csv
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mongo import db
from models.course import Course, derive_level
from pymongo import UpdateOne


def clean_title(raw: str) -> str:
    return re.sub(r"\s*</br>\s*\[.*?\]", "", raw, flags=re.DOTALL).strip()


def parse_professors(raw: str) -> list:
    return [n.strip() for n in raw.split() if n.strip()]


def parse_capacity(raw: str) -> int:
    try:
        return int(raw.strip())
    except (ValueError, AttributeError):
        return 0


def seed(csv_path: str):
    collection = db["courses"]

    # ── Clear old data ──────────────────────────────────────────────────────
    deleted = collection.delete_many({})
    print(f"Cleared {deleted.deleted_count} old documents.")

    inserted = 0
    errors   = 0

    with open(csv_path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        batch  = []

        for i, row in enumerate(reader, start=1):
            try:
                serial    = row["開課序號"].strip()
                year      = row["學年"].strip()
                semester  = row["學期"].strip()
                course_id = f"{serial}_{year}_{semester}"

                course_code = row["課程資訊"].strip()
                title       = clean_title(row["課程名稱"])
                dept        = row["開課系所"].strip()
                profs       = parse_professors(row["老師"])
                time_loc    = row["上課時間與地點"].strip()
                syllabus    = row["課程大綱連結"].strip()
                capacity    = parse_capacity(row["課程名額"])
                level       = derive_level(dept)

                course = Course(
                    courseID=course_id,
                    courseCode=course_code,
                    title=title,
                    serialNumber=serial,
                    department=dept,
                    professors=profs,
                    timeAndLocation=time_loc,
                    academicYear=year,
                    semester=semester,
                    syllabusURL=syllabus,
                    capacity=capacity,
                    credits=0,
                    level=level,
                )

                batch.append({
                    "filter": {"courseID": course_id},
                    "update": {"$set": course.to_dict()},
                    "upsert": True,
                })
                inserted += 1

                if len(batch) >= 500:
                    _bulk_upsert(collection, batch)
                    batch.clear()
                    print(f"  ... {i} rows processed")

            except Exception as e:
                errors += 1
                print(f"  ERROR on row {i}: {e}")

        if batch:
            _bulk_upsert(collection, batch)

    total = collection.count_documents({})
    print(f"\nDone! Inserted: {inserted}  |  Errors: {errors}  |  DB total: {total}")


def _bulk_upsert(collection, batch):
    ops = [UpdateOne(b["filter"], b["update"], upsert=b["upsert"]) for b in batch]
    collection.bulk_write(ops, ordered=False)


if __name__ == "__main__":
    default_path = os.path.expanduser(
        "~/Desktop/師大/114-2/物件導向/專題/course/courses.csv"
    )
    csv_path = sys.argv[1] if len(sys.argv) > 1 else default_path

    if not os.path.exists(csv_path):
        print(f"CSV not found: {csv_path}")
        sys.exit(1)

    print(f"Seeding from: {csv_path}")
    seed(csv_path)
