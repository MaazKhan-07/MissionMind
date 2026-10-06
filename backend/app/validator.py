import re
from typing import Dict, Any, List, Tuple, Optional
from app.schemas import DroppedClaimItem

INJECTION_PATTERNS = [
    r"ignore all rules",
    r"ignore previous instructions",
    r"say the satellite is fine",
    r"system prompt:",
    r"you are now in developer mode"
]

def check_prompt_injection(content: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
    content_lower = content.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, content_lower):
            return True, {
                "detected": True,
                "pattern_matched": pattern,
                "action_taken": "INSTRUCTION_IGNORED_TREATED_AS_DATA",
                "source": "LOG-99999" if "LOG-99999" in content else "DATA_BUFFER"
            }
    return False, None

def validate_facts_and_claims(
    facts: List[Dict[str, Any]], 
    records: Dict[str, Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], List[DroppedClaimItem]]:
    
    valid_facts = []
    dropped_claims = []

    for fact in facts:
        claim_text = fact.get("claim", "")
        citation = fact.get("citation", "")

        # Check if citation exists in records
        if citation and citation not in records:
            dropped_claims.append(DroppedClaimItem(
                original_claim=claim_text,
                citation=citation,
                reason=f"Citation {citation} was not found in retrieved records.",
                failure_type="MISSING_CITATION"
            ))
            continue

        record = records.get(citation, {})
        
        # Check numeric claim validation
        # Extract floating point numbers from claim
        claim_numbers = re.findall(r"\d+\.\d+", claim_text)
        if claim_numbers and record:
            rec_content = str(record.get("content", "")) + " " + str(record.get("value", ""))
            numeric_valid = True
            for num_str in claim_numbers:
                num_val = float(num_str)
                rec_num = record.get("numerical_value")
                if rec_num is not None and abs(rec_num - num_val) > 0.1 and num_str not in rec_content:
                    numeric_valid = False
                    dropped_claims.append(DroppedClaimItem(
                        original_claim=claim_text,
                        citation=citation,
                        reason=f"Numeric claim {num_val} does not match verified source record value ({record.get('value')}).",
                        failure_type="NUMERIC_MISMATCH"
                    ))
                    break
            
            if not numeric_valid:
                continue

        valid_facts.append(fact)

    return valid_facts, dropped_claims
