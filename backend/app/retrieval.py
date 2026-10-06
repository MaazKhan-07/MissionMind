import re
import sqlite3
import numpy as np
from typing import List, Dict, Any, Tuple, Optional, Set
from datetime import datetime, timedelta
from backend.app.config import settings
from backend.app.db import get_connection, deserialize_vec

STOPWORDS = {
    "why", "did", "the", "at", "is", "what", "how", "when", "who", "which",
    "and", "or", "in", "on", "of", "to", "for", "with", "about", "was", "were",
    "a", "an", "by", "from", "be", "been", "there", "cause", "caused"
}

_embed_model = None

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embed_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        except Exception:
            _embed_model = None
    return _embed_model

def get_text_embedding(text: str) -> np.ndarray:
    model = get_embed_model()
    if model is not None:
        return model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
    
    vec = np.zeros(384, dtype=np.float32)
    for word in text.lower().split():
        h = abs(hash(word)) % 384
        vec[h] += 1.0
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec

def get_text_embeddings_batch(texts: List[str]) -> List[np.ndarray]:
    model = get_embed_model()
    if model is not None:
        embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True, batch_size=64, show_progress_bar=False)
        return [embeddings[i] for i in range(len(texts))]
    
    return [get_text_embedding(t) for t in texts]

def extract_time_anchor(query: str) -> Optional[datetime]:
    iso_match = re.search(r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?", query)
    if iso_match:
        try:
            return datetime.fromisoformat(iso_match.group(0).replace(" ", "T"))
        except ValueError:
            pass

    time_match = re.search(r"\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b", query)
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2))
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT ts_utc FROM records WHERE strftime('%H', ts_utc) = ? AND strftime('%M', ts_utc) = ? ORDER BY ts_utc ASC LIMIT 1;",
            (f"{hour:02d}", f"{minute:02d}")
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return datetime.fromisoformat(row["ts_utc"].replace("Z", "+00:00"))

    return None

def perform_sql_retrieval(
    time_anchor: Optional[datetime],
    subsystem: Optional[str],
    conn: sqlite3.Connection
) -> List[Tuple[str, int]]:
    cursor = conn.cursor()
    results = []

    if time_anchor:
        start_ts = (time_anchor - timedelta(minutes=settings.TIME_WINDOW_BEFORE_MIN)).isoformat()
        end_ts = (time_anchor + timedelta(minutes=settings.TIME_WINDOW_AFTER_MIN)).isoformat()
        cursor.execute("""
            SELECT record_id FROM records
            WHERE ts_utc >= ? AND ts_utc <= ?
            ORDER BY severity = 'critical' DESC, severity = 'warning' DESC, ts_utc ASC;
        """, (start_ts, end_ts))
        for idx, row in enumerate(cursor.fetchall()):
            results.append((row["record_id"], idx + 1))

    if subsystem:
        # Also retrieve relevant procedures and historical incidents
        cursor.execute("""
            SELECT record_id FROM records
            WHERE subsystem LIKE ? AND rtype IN ('procedure', 'incident')
            ORDER BY rtype = 'procedure' DESC, severity = 'critical' DESC LIMIT 10;
        """, (f"%{subsystem}%",))
        offset = len(results)
        for idx, row in enumerate(cursor.fetchall()):
            results.append((row["record_id"], offset + idx + 1))

    return results

def perform_fts_retrieval(query: str, conn: sqlite3.Connection) -> List[Tuple[str, int]]:
    cursor = conn.cursor()
    raw_tokens = re.findall(r"[A-Za-z0-9_-]+", query)
    tokens = [t for t in raw_tokens if t.lower() not in STOPWORDS and len(t) > 1]
    
    if not tokens:
        tokens = raw_tokens
    if not tokens:
        return []

    fts_query = " OR ".join([f'"{t}"' for t in tokens])

    try:
        cursor.execute("""
            SELECT record_id, rank
            FROM records_fts
            WHERE records_fts MATCH ?
            ORDER BY rank ASC LIMIT 30;
        """, (fts_query,))
        rows = cursor.fetchall()
        return [(r["record_id"], idx + 1) for idx, r in enumerate(rows)]
    except sqlite3.OperationalError:
        cursor.execute("""
            SELECT record_id FROM records
            WHERE text LIKE ? OR record_id LIKE ?
            LIMIT 20;
        """, (f"%{tokens[0]}%", f"%{tokens[0]}%"))
        rows = cursor.fetchall()
        return [(r["record_id"], idx + 1) for idx, r in enumerate(rows)]

def perform_vector_retrieval(query_vec: np.ndarray, conn: sqlite3.Connection) -> List[Tuple[str, int, float]]:
    cursor = conn.cursor()
    cursor.execute("SELECT record_id, vec FROM embeddings;")
    rows = cursor.fetchall()

    scored = []
    for r in rows:
        r_vec = deserialize_vec(r["vec"])
        dot_val = float(np.dot(query_vec, r_vec))
        scored.append((r["record_id"], dot_val))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [(item[0], idx + 1, item[1]) for idx, item in enumerate(scored[:40])]

def get_out_of_limit_telemetry_in_window(
    time_anchor: Optional[datetime],
    conn: sqlite3.Connection
) -> List[str]:
    if not time_anchor:
        return []

    start_ts = (time_anchor - timedelta(minutes=settings.TIME_WINDOW_BEFORE_MIN)).isoformat()
    end_ts = (time_anchor + timedelta(minutes=settings.TIME_WINDOW_AFTER_MIN)).isoformat()

    cursor = conn.cursor()
    cursor.execute("""
        SELECT record_id FROM telemetry
        WHERE ts_utc >= ? AND ts_utc <= ? AND status IN ('warning', 'critical')
        ORDER BY ts_utc ASC;
    """, (start_ts, end_ts))
    
    return [r["record_id"] for r in cursor.fetchall()]

def hybrid_retrieval(query: str, anomaly_id: Optional[str] = None) -> Tuple[Dict[str, Dict[str, Any]], float]:
    conn = get_connection()
    time_anchor = extract_time_anchor(query)
    
    if not time_anchor and anomaly_id:
        cursor = conn.cursor()
        cursor.execute("SELECT ts_utc FROM records WHERE record_id = ?", (anomaly_id,))
        row = cursor.fetchone()
        if row:
            time_anchor = datetime.fromisoformat(row["ts_utc"].replace("Z", "+00:00"))

    subsystem = None
    for sub in ["comms", "power", "thermal", "aocs", "payload", "propulsion"]:
        if sub in query.lower():
            subsystem = sub
            break

    # 1. SQL Retrieval
    sql_results = perform_sql_retrieval(time_anchor, subsystem, conn)
    
    # 2. FTS Keyword Retrieval
    fts_results = perform_fts_retrieval(query, conn)
    
    # 3. Vector Retrieval
    query_vec = get_text_embedding(query)
    vec_results = perform_vector_retrieval(query_vec, conn)
    
    # 4. Reciprocal Rank Fusion (RRF)
    rrf_scores: Dict[str, float] = {}
    k = settings.RRF_K

    for rec_id, rank in sql_results:
        rrf_scores[rec_id] = rrf_scores.get(rec_id, 0.0) + (1.2 / (k + rank))

    for rec_id, rank in fts_results:
        rrf_scores[rec_id] = rrf_scores.get(rec_id, 0.0) + (1.0 / (k + rank))

    for rec_id, rank, sim in vec_results:
        rrf_scores[rec_id] = rrf_scores.get(rec_id, 0.0) + (1.0 / (k + rank))

    # 5. Out of limit preservation and subsystem procedures/incidents preservation
    preserved_ids = list(get_out_of_limit_telemetry_in_window(time_anchor, conn))

    # Add subsystem procedures and incidents
    if subsystem:
        cursor = conn.cursor()
        cursor.execute("SELECT record_id FROM records WHERE subsystem LIKE ? AND rtype IN ('procedure', 'incident') LIMIT 4;", (f"%{subsystem}%",))
        for r in cursor.fetchall():
            if r["record_id"] not in preserved_ids:
                preserved_ids.append(r["record_id"])

    # 6. Rank records by RRF score
    sorted_candidates = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    
    top_ids: List[str] = []
    for p_id in preserved_ids:
        if p_id not in top_ids:
            top_ids.append(p_id)

    for rec_id, _ in sorted_candidates:
        if rec_id not in top_ids:
            top_ids.append(rec_id)
        if len(top_ids) >= settings.TOP_K_RECORDS + 5:
            break

    cursor = conn.cursor()
    retrieved_dict: Dict[str, Dict[str, Any]] = {}
    
    for r_id in top_ids:
        cursor.execute("SELECT * FROM records WHERE record_id = ?", (r_id,))
        rec_row = cursor.fetchone()
        if rec_row:
            retrieved_dict[r_id] = dict(rec_row)

    best_score = sorted_candidates[0][1] if sorted_candidates else 0.0
    time_window_useful_count = len(sql_results)
    retrieval_strength = float(best_score * 10.0 + min(time_window_useful_count, 5) * 0.1)

    conn.close()
    return retrieved_dict, round(retrieval_strength, 4)
