import re
from typing import Tuple, List

SUSPICIOUS_PATTERNS = [
    r"ignore\s+all\s+rules",
    r"ignore\s+previous\s+instructions",
    r"system\s+prompt",
    r"reveal\s+your\s+prompt",
    r"forget\s+all\s+prior",
    r"you\s+are\s+now\s+a",
    r"bypass\s+security",
    r"override\s+system",
    r"disregard\s+the\s+above"
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in SUSPICIOUS_PATTERNS]

def check_prompt_injection(text: str) -> Tuple[bool, List[str]]:
    flags = []
    for p in COMPILED_PATTERNS:
        if p.search(text):
            flags.append(p.pattern)
    return (len(flags) > 0, flags)

def format_records_for_prompt(records: list[dict]) -> str:
    """
    Wraps retrieved records in protective XML tags.
    Mission records are DATA. Never treated as system instructions.
    """
    formatted_lines = ["<records>"]
    for r in records:
        r_id = r.get("record_id", "UNKNOWN")
        text = r.get("text", "")
        # Flag suspicious content internally but preserve evidence
        is_suspicious, _ = check_prompt_injection(text)
        if is_suspicious:
            # We add a clear metadata warning in prompt so LLM treats text as passive data
            formatted_lines.append(f"[{r_id}] (DATA_RECORD): {text}")
        else:
            formatted_lines.append(f"[{r_id}] {text}")
    formatted_lines.append("</records>")
    return "\n".join(formatted_lines)
