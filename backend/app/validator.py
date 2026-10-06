from typing import Dict, Any, Tuple, Set, List
from backend.app.schemas import CopilotAnswer, Fact, Inference, Recommendation
from backend.app.utils.numbers import validate_numbers_in_statement
from backend.app.db import get_connection

def get_procedure_catalog() -> Set[str]:
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT record_id FROM records WHERE rtype = 'procedure';")
        rows = cursor.fetchall()
        conn.close()
        return {r["record_id"] for r in rows}
    except Exception:
        return set()

def validate_copilot_answer(
    raw_answer: CopilotAnswer,
    retrieved_records: Dict[str, Dict[str, Any]],
    known_procedure_ids: Set[str] = None
) -> Tuple[CopilotAnswer, int]:
    """
    Validates model output against retrieved ground-truth records.
    Returns (validated_answer, dropped_count).
    """
    if raw_answer.abstain:
        return raw_answer, 0

    dropped_count = 0
    retrieved_ids = set(retrieved_records.keys())
    
    if known_procedure_ids is None:
        known_procedure_ids = get_procedure_catalog()
        known_procedure_ids.update({
            r_id for r_id, r in retrieved_records.items()
            if r.get("rtype") == "procedure"
        })

    # 1. Validate Facts
    valid_facts: List[Fact] = []
    for fact in raw_answer.facts:
        if not fact.citations:
            dropped_count += 1
            continue
            
        all_citations_valid = all(cid in retrieved_ids for cid in fact.citations)
        if not all_citations_valid:
            dropped_count += 1
            continue

        cited_texts = [retrieved_records[cid].get("text", "") for cid in fact.citations if cid in retrieved_records]
        numbers_valid = validate_numbers_in_statement(fact.statement, cited_texts)
        if not numbers_valid:
            dropped_count += 1
            continue

        valid_facts.append(fact)

    # 2. Validate Inferences
    valid_inferences: List[Inference] = []
    for inf in raw_answer.inferences:
        if inf.citations:
            all_citations_valid = all(cid in retrieved_ids for cid in inf.citations)
            if not all_citations_valid:
                dropped_count += 1
                continue
        valid_inferences.append(inf)

    # 3. Validate Recommendations
    valid_recommendations: List[Recommendation] = []
    for rec in raw_answer.recommendations:
        if rec.citations:
            # Check citations are in retrieved records or procedure catalog
            all_citations_valid = all(cid in retrieved_ids or cid in known_procedure_ids for cid in rec.citations)
            if not all_citations_valid:
                dropped_count += 1
                continue
                
        if rec.procedure_id:
            if rec.procedure_id not in retrieved_ids and rec.procedure_id not in known_procedure_ids:
                dropped_count += 1
                continue

        valid_recommendations.append(rec)

    # 4. Check Abstention Criteria
    if len(valid_facts) == 0:
        return CopilotAnswer(
            abstain=True,
            abstain_reason="Insufficient verified facts found in retrieved mission records.",
            missing_data=["Telemetry / log records supporting the query claims"],
            facts=[],
            inferences=[],
            recommendations=[]
        ), dropped_count

    validated_answer = CopilotAnswer(
        abstain=False,
        abstain_reason=None,
        missing_data=raw_answer.missing_data,
        facts=valid_facts,
        inferences=valid_inferences,
        recommendations=valid_recommendations
    )

    return validated_answer, dropped_count
