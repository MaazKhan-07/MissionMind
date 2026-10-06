"""
MissionMind Hybrid Retrieval Engine
====================================
Implements Section 5.2 of the architecture:
  1. Time-aware SQL retrieval
  2. FTS5 full-text retrieval
  3. Vector (semantic) retrieval
  4. Reciprocal Rank Fusion (RRF)
  5. Retrieval strength scoring

Pipeline:
  QUERY → SQL + FTS + VECTOR → RRF → TOP EVIDENCE → STRENGTH
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import numpy as np

from app import db
from app.config import (
    EMBEDDING_DIM,
    EMBEDDING_MODEL,
    RETRIEVAL_MIN_STRENGTH,
    RETRIEVAL_TOP_K,
    RRF_K,
)

logger = logging.getLogger("missionmind.retrieval")


# ═══════════════════════════════════════════════════════════════════════════
# Embedding Model (lazy-loaded singleton)
# ═══════════════════════════════════════════════════════════════════════════

_embedding_model = None


def _get_embedding_model():
    """Lazy-load the sentence transformer model."""
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedding_model = SentenceTransformer(EMBEDDING_MODEL)
            logger.info("Loaded embedding model: %s", EMBEDDING_MODEL)
        except Exception as e:
            logger.warning("Could not load embedding model: %s", e)
            _embedding_model = None
    return _embedding_model


def compute_embedding(text: str) -> Optional[np.ndarray]:
    """Compute embedding vector for a text string."""
    model = _get_embedding_model()
    if model is None:
        return None
    return model.encode(text, normalize_embeddings=True)


def embed_record(record: dict[str, Any]) -> Optional[np.ndarray]:
    """Create embedding for a mission record."""
    text = _record_to_text(record)
    return compute_embedding(text)


def _record_to_text(record: dict[str, Any]) -> str:
    """Convert a mission record to a text representation for embedding."""
    parts = [
        f"subsystem: {record.get('subsystem', '')}",
        f"type: {record.get('record_type', '')}",
        record.get("text", ""),
    ]
    params = record.get("parameters", {})
    if isinstance(params, dict):
        for k, v in params.items():
            parts.append(f"{k}: {v}")
    return " ".join(parts)


# ═══════════════════════════════════════════════════════════════════════════
# Retrieval Methods
# ═══════════════════════════════════════════════════════════════════════════

def retrieve_sql(
    subsystems: list[str],
    time_start: Optional[str] = None,
    time_end: Optional[str] = None,
    record_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = RETRIEVAL_TOP_K,
) -> list[dict[str, Any]]:
    """
    SQL / structured retrieval.
    Useful for timestamps, subsystem, parameter, severity, record IDs.
    """
    results = []
    if subsystems:
        for sub in subsystems:
            records = db.search_records_sql(
                subsystem=sub,
                record_type=record_type,
                severity=severity,
                time_start=time_start,
                time_end=time_end,
                limit=limit,
            )
            results.extend(records)
    else:
        records = db.search_records_sql(
            record_type=record_type,
            severity=severity,
            time_start=time_start,
            time_end=time_end,
            limit=limit,
        )
        results.extend(records)

    # Deduplicate
    seen = set()
    unique = []
    for r in results:
        if r["id"] not in seen:
            seen.add(r["id"])
            unique.append(r)
    return unique


def retrieve_fts(query: str, limit: int = RETRIEVAL_TOP_K) -> list[dict[str, Any]]:
    """
    Full-text search using SQLite FTS5.
    """
    try:
        return db.search_records_fts(query, limit=limit)
    except Exception as e:
        logger.warning("FTS search failed: %s", e)
        return []


def retrieve_vector(
    query: str, limit: int = RETRIEVAL_TOP_K
) -> list[dict[str, Any]]:
    """
    Vector / semantic retrieval using cosine similarity.
    """
    query_embedding = compute_embedding(query)
    if query_embedding is None:
        return []

    # Load all stored embeddings
    all_embeddings = db.get_all_embeddings(EMBEDDING_MODEL)
    if not all_embeddings:
        return []

    # Compute cosine similarities
    scored: list[tuple[str, float]] = []
    for record_id, stored_vec in all_embeddings:
        similarity = float(np.dot(query_embedding, stored_vec))
        scored.append((record_id, similarity))

    # Sort by similarity descending
    scored.sort(key=lambda x: x[1], reverse=True)

    # Get top-k record IDs
    top_ids = [rid for rid, _ in scored[:limit]]
    records = db.get_records_by_ids(top_ids)

    # Return in similarity order
    result = []
    for rid, score in scored[:limit]:
        if rid in records:
            rec = records[rid].copy()
            rec["_vector_score"] = score
            result.append(rec)
    return result


# ═══════════════════════════════════════════════════════════════════════════
# Reciprocal Rank Fusion
# ═══════════════════════════════════════════════════════════════════════════

def reciprocal_rank_fusion(
    *result_lists: list[dict[str, Any]],
    k: int = RRF_K,
) -> list[dict[str, Any]]:
    """
    Combine results from multiple retrieval methods using RRF.

    RRF score for document d:
        score(d) = Σ  1 / (k + rank_i(d))

    where rank_i(d) is the rank of d in result list i (1-indexed).
    """
    scores: dict[str, float] = {}
    record_map: dict[str, dict[str, Any]] = {}

    for result_list in result_lists:
        for rank, record in enumerate(result_list, start=1):
            rid = record["id"]
            scores[rid] = scores.get(rid, 0.0) + 1.0 / (k + rank)
            if rid not in record_map:
                record_map[rid] = record

    # Sort by RRF score descending
    sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)

    result = []
    for rid in sorted_ids:
        rec = record_map[rid].copy()
        rec["_rrf_score"] = scores[rid]
        result.append(rec)
    return result


# ═══════════════════════════════════════════════════════════════════════════
# Retrieval Strength
# ═══════════════════════════════════════════════════════════════════════════

def compute_retrieval_strength(
    records: list[dict[str, Any]],
    query: str,
    subsystems: list[str],
) -> float:
    """
    Compute an evidence strength score in [0.0, 1.0].

    Factors:
      - Number of retrieved records
      - Diversity of record types
      - Subsystem coverage
      - Presence of procedures
      - Presence of incidents
    """
    if not records:
        return 0.0

    n = len(records)
    types_found = set(r.get("record_type", "") for r in records)
    subs_found = set(r.get("subsystem", "") for r in records)

    # Base score from record count (saturates at 10)
    count_score = min(n / 10.0, 1.0)

    # Type diversity bonus
    type_score = len(types_found) / 4.0  # 4 main types
    type_score = min(type_score, 1.0)

    # Subsystem coverage
    if subsystems:
        sub_coverage = len(subs_found.intersection(set(subsystems))) / len(subsystems)
    else:
        sub_coverage = min(len(subs_found) / 3.0, 1.0)

    # Procedure bonus
    has_procedure = any(r.get("record_type") == "procedure" for r in records)
    proc_bonus = 0.15 if has_procedure else 0.0

    # Incident bonus
    has_incident = any(r.get("record_type") == "incident" for r in records)
    incident_bonus = 0.10 if has_incident else 0.0

    # Weighted combination
    strength = (
        0.35 * count_score
        + 0.25 * type_score
        + 0.15 * sub_coverage
        + proc_bonus
        + incident_bonus
    )

    return round(min(strength, 1.0), 3)


# ═══════════════════════════════════════════════════════════════════════════
# Main Retrieval Pipeline
# ═══════════════════════════════════════════════════════════════════════════

def hybrid_retrieve(
    query: str,
    subsystems: list[str],
    time_window: Optional[dict[str, str]] = None,
    top_k: int = RETRIEVAL_TOP_K,
) -> tuple[list[dict[str, Any]], float]:
    """
    Execute the full hybrid retrieval pipeline:
      SQL → FTS → Vector → RRF → Strength

    Returns:
        (records, retrieval_strength)
    """
    time_start = time_window.get("start") if time_window else None
    time_end = time_window.get("end") if time_window else None

    # 1. SQL retrieval
    sql_results = retrieve_sql(
        subsystems=subsystems,
        time_start=time_start,
        time_end=time_end,
        limit=top_k,
    )
    logger.info("SQL retrieval: %d records", len(sql_results))

    # 2. FTS retrieval
    fts_results = retrieve_fts(query, limit=top_k)
    logger.info("FTS retrieval: %d records", len(fts_results))

    # 3. Vector retrieval
    vector_results = retrieve_vector(query, limit=top_k)
    logger.info("Vector retrieval: %d records", len(vector_results))

    # 4. RRF fusion
    fused = reciprocal_rank_fusion(sql_results, fts_results, vector_results)
    logger.info("RRF fusion: %d unique records", len(fused))

    # Limit to top-k
    top_records = fused[:top_k]

    # 5. Compute retrieval strength
    strength = compute_retrieval_strength(top_records, query, subsystems)
    logger.info("Retrieval strength: %.3f", strength)

    return top_records, strength


def should_abstain(strength: float) -> bool:
    """Check if retrieval strength is too weak to proceed."""
    return strength < RETRIEVAL_MIN_STRENGTH
