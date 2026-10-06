import re
from typing import List, Set

# Regex for numbers including floats, integers, signed values, percentages
# Excludes ISO timestamps and time patterns (e.g. 14:31:42, 2026-10-05)
TIME_PATTERN = re.compile(r"\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}:\d{2}(?::\d{2})?\b")
RECORD_ID_PATTERN = re.compile(r"\b(?:T|LOG|INC|COMMS|PWR|AOCS|PAYLOAD|GNC|THM|PROP|DOC|SAFE)-\d+\b", re.IGNORECASE)
NUMBER_PATTERN = re.compile(r"(?<![a-zA-Z_:/-])([+-]?\d+(?:\.\d+)?%?)(?![a-zA-Z_:/-])")

def extract_numbers(text: str) -> List[str]:
    """
    Extracts numerical measurement tokens (e.g. '23.8', '+17%', '-12', '78.4').
    Ignores record identifiers and clock times.
    """
    # Remove record identifiers and timestamps
    sanitized = RECORD_ID_PATTERN.sub("", text)
    sanitized = TIME_PATTERN.sub("", sanitized)
    
    matches = NUMBER_PATTERN.findall(sanitized)
    cleaned = []
    for m in matches:
        m_str = m.strip()
        if m_str and m_str not in ("+", "-"):
            cleaned.append(m_str)
    return cleaned

def extract_numbers_from_text(text: str) -> Set[str]:
    """
    Returns set of normalized number representations found in source text.
    """
    sanitized = RECORD_ID_PATTERN.sub("", text)
    sanitized = TIME_PATTERN.sub("", sanitized)

    numbers = set()
    raw_nums = NUMBER_PATTERN.findall(sanitized)
    for num in raw_nums:
        num_clean = num.strip().rstrip('%')
        numbers.add(num.strip())
        numbers.add(num_clean)
        try:
            val = float(num_clean)
            numbers.add(str(val))
            if val.is_integer():
                numbers.add(str(int(val)))
                numbers.add(str(int(abs(val))))
            numbers.add(f"+{num_clean}")
            numbers.add(f"-{num_clean}")
        except ValueError:
            pass
    return numbers

def validate_numbers_in_statement(statement: str, source_texts: List[str]) -> bool:
    """
    Verifies that all numerical values in statement exist in at least one of the source texts.
    """
    claimed_numbers = extract_numbers(statement)
    if not claimed_numbers:
        return True

    all_source_numbers = set()
    for src in source_texts:
        all_source_numbers.update(extract_numbers_from_text(src))

    for claimed in claimed_numbers:
        claimed_clean = claimed.rstrip('%')
        is_supported = False

        if claimed in all_source_numbers or claimed_clean in all_source_numbers:
            is_supported = True
        else:
            try:
                c_val = float(claimed_clean)
                for src_num in all_source_numbers:
                    try:
                        s_val = float(src_num)
                        if abs(c_val - s_val) < 1e-5:
                            is_supported = True
                            break
                    except ValueError:
                        continue
            except ValueError:
                for src in source_texts:
                    if claimed in src:
                        is_supported = True
                        break

        if not is_supported:
            return False

    return True
