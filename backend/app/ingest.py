"""
MissionMind Data Ingestion
===========================
Ingests mission records, telemetry, anomalies, and procedures
into the database. Generates embeddings for vector retrieval.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from app import db
from app.retrieval import embed_record

logger = logging.getLogger("missionmind.ingest")


def ingest_records(records: list[dict[str, Any]], generate_embeddings: bool = True) -> int:
    """
    Ingest a list of mission records into the database.

    Args:
        records: List of record dicts
        generate_embeddings: Whether to compute and store vector embeddings

    Returns:
        Number of records ingested
    """
    count = 0
    for record in records:
        try:
            db.insert_record(record)
            count += 1

            # Generate embedding for vector retrieval
            if generate_embeddings:
                _generate_and_store_embedding(record)

        except Exception as e:
            logger.error("Failed to ingest record %s: %s", record.get("id", "?"), e)

    logger.info("Ingested %d / %d records", count, len(records))
    return count


def ingest_telemetry(data_points: list[dict[str, Any]]) -> int:
    """Ingest telemetry data points."""
    count = 0
    for point in data_points:
        try:
            db.insert_telemetry(point)
            count += 1
        except Exception as e:
            logger.error("Failed to ingest telemetry: %s", e)
    logger.info("Ingested %d telemetry points", count)
    return count


def ingest_anomalies(anomalies: list[dict[str, Any]]) -> int:
    """Ingest anomaly records."""
    count = 0
    for anomaly in anomalies:
        try:
            db.insert_anomaly(anomaly)
            count += 1
        except Exception as e:
            logger.error("Failed to ingest anomaly %s: %s", anomaly.get("id", "?"), e)
    logger.info("Ingested %d anomalies", count)
    return count


def ingest_from_json(filepath: str | Path) -> int:
    """
    Ingest records from a JSON file.

    Expected format:
    {
        "records": [...],
        "telemetry": [...],
        "anomalies": [...]
    }
    """
    path = Path(filepath)
    if not path.exists():
        logger.error("File not found: %s", path)
        return 0

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    total = 0

    if "records" in data:
        total += ingest_records(data["records"])
    if "telemetry" in data:
        total += ingest_telemetry(data["telemetry"])
    if "anomalies" in data:
        total += ingest_anomalies(data["anomalies"])

    return total


def _generate_and_store_embedding(record: dict[str, Any]) -> None:
    """Generate and store embedding for a record."""
    try:
        from app.config import EMBEDDING_MODEL
        embedding = embed_record(record)
        if embedding is not None:
            db.store_embedding(record["id"], embedding, EMBEDDING_MODEL)
    except Exception as e:
        logger.debug("Could not generate embedding for %s: %s", record.get("id", "?"), e)
