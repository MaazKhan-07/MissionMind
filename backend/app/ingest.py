import csv
import json
import sqlite3
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.config import settings
from backend.app.db import get_connection, init_db, serialize_vec, rebuild_fts
from backend.app.models import RecordModel, TelemetryModel
from backend.app.retrieval import get_text_embeddings_batch

def normalize_timestamp(ts_str: str) -> str:
    """Normalizes string timestamp into ISO UTC format."""
    try:
        clean_ts = ts_str.strip().replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_ts)
        return dt.astimezone(timezone.utc).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()

def ingest_file(file_path: Path | str) -> Dict[str, int]:
    """
    Ingests CSV, JSON, Markdown, or TXT file into SQLite database with batch embedding acceleration.
    """
    p = Path(file_path)
    if not p.exists():
        raise FileNotFoundError(f"File not found: {p}")

    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    records_to_insert: List[RecordModel] = []
    telemetry_to_insert: List[TelemetryModel] = []

    suffix = p.suffix.lower()

    if suffix == ".json":
        with open(p, "r", encoding="utf-8") as f:
            data = json.load(f)
            items = data if isinstance(data, list) else [data]
            for idx, item in enumerate(items):
                rtype = item.get("rtype", "log")
                r_id = item.get("record_id") or item.get("id") or f"GEN-{idx+1:05d}"
                ts = normalize_timestamp(item.get("ts_utc") or item.get("timestamp") or datetime.now(timezone.utc).isoformat())
                subsys = item.get("subsystem", "GENERAL")
                sev = item.get("severity", "info")
                text = item.get("text") or item.get("summary") or json.dumps(item)

                rec = RecordModel(
                    record_id=r_id,
                    rtype=rtype,
                    ts_utc=ts,
                    subsystem=subsys,
                    severity=sev,
                    text=text,
                    raw_json=json.dumps(item),
                    source_file=p.name
                )
                records_to_insert.append(rec)

                raw_dict = {}
                if "raw_json" in item and item["raw_json"]:
                    try:
                        raw_dict = json.loads(item["raw_json"]) if isinstance(item["raw_json"], str) else item["raw_json"]
                    except Exception:
                        raw_dict = {}
                merged = {**raw_dict, **item}

                if "parameter" in merged and "value" in merged:
                    telem = TelemetryModel(
                        record_id=r_id,
                        ts_utc=ts,
                        subsystem=subsys,
                        parameter=str(merged["parameter"]),
                        value=float(merged["value"]),
                        unit=str(merged.get("unit", "")),
                        limit_low=float(merged["limit_low"]) if merged.get("limit_low") is not None else None,
                        limit_high=float(merged["limit_high"]) if merged.get("limit_high") is not None else None,
                        status=str(merged.get("status", "normal"))
                    )
                    telemetry_to_insert.append(telem)

    elif suffix == ".csv":
        with open(p, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                rtype = row.get("rtype", "telemetry")
                r_id = row.get("record_id") or row.get("id") or f"CSV-{idx+1:05d}"
                ts = normalize_timestamp(row.get("ts_utc") or row.get("timestamp") or datetime.now(timezone.utc).isoformat())
                subsys = row.get("subsystem", "GENERAL")
                sev = row.get("severity", "info")
                
                if "parameter" in row and "value" in row:
                    text = f"Telemetry [{subsys}] {row['parameter']} = {row['value']} {row.get('unit', '')} at {ts}. Status: {row.get('status', 'normal')}"
                else:
                    text = row.get("text", json.dumps(row))

                rec = RecordModel(
                    record_id=r_id,
                    rtype=rtype,
                    ts_utc=ts,
                    subsystem=subsys,
                    severity=sev,
                    text=text,
                    raw_json=json.dumps(row),
                    source_file=p.name
                )
                records_to_insert.append(rec)

                if "parameter" in row and "value" in row:
                    try:
                        telem = TelemetryModel(
                            record_id=r_id,
                            ts_utc=ts,
                            subsystem=subsys,
                            parameter=row["parameter"],
                            value=float(row["value"]),
                            unit=row.get("unit", ""),
                            limit_low=float(row["limit_low"]) if row.get("limit_low") else None,
                            limit_high=float(row["limit_high"]) if row.get("limit_high") else None,
                            status=row.get("status", "normal")
                        )
                        telemetry_to_insert.append(telem)
                    except ValueError:
                        pass

    elif suffix in (".md", ".txt"):
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
            sections = content.split("\n## ")
            for idx, sec in enumerate(sections):
                lines = sec.strip().split("\n")
                title = lines[0].replace("#", "").strip() if lines else "Procedure"
                r_id = f"DOC-{idx+1:03d}"
                if "-" in title and len(title.split()[0]) < 12:
                    r_id = title.split()[0]
                
                ts = datetime.now(timezone.utc).isoformat()
                rec = RecordModel(
                    record_id=r_id,
                    rtype="procedure",
                    ts_utc=ts,
                    subsystem="PROCEDURE",
                    severity="info",
                    text=sec.strip(),
                    raw_json=json.dumps({"title": title, "content": sec}),
                    source_file=p.name
                )
                records_to_insert.append(rec)

    # 1. Insert Records
    cursor.executemany("""
        INSERT OR REPLACE INTO records (record_id, rtype, ts_utc, subsystem, severity, text, raw_json, source_file)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, [
        (r.record_id, r.rtype, r.ts_utc, r.subsystem, r.severity, r.text, r.raw_json, r.source_file)
        for r in records_to_insert
    ])

    # 2. Insert Telemetry
    cursor.executemany("""
        INSERT OR REPLACE INTO telemetry (record_id, ts_utc, subsystem, parameter, value, unit, limit_low, limit_high, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, [
        (t.record_id, t.ts_utc, t.subsystem, t.parameter, t.value, t.unit, t.limit_low, t.limit_high, t.status)
        for t in telemetry_to_insert
    ])

    # 3. Batch Compute & Insert Embeddings
    all_texts = [r.text for r in records_to_insert]
    if all_texts:
        embeddings = get_text_embeddings_batch(all_texts)
        cursor.executemany("""
            INSERT OR REPLACE INTO embeddings (record_id, vec)
            VALUES (?, ?);
        """, [
            (records_to_insert[i].record_id, serialize_vec(embeddings[i]))
            for i in range(len(records_to_insert))
        ])

    conn.commit()
    conn.close()

    # 4. Rebuild FTS5 Virtual Index
    rebuild_fts()

    return {
        "records_ingested": len(records_to_insert),
        "telemetry_ingested": len(telemetry_to_insert),
        "embeddings_generated": len(records_to_insert)
    }
