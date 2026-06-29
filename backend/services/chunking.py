import re
from typing import List, Dict


def is_noise(line: str) -> bool:
    line = line.strip()
    noise_patterns = [
        r'^Page \d+',
        r'^LAB \d+',
        r'^SD \d+',
        r'^\d{5,}$',
        r'^Phone:',
        r'^FAX:',
        r'^P\.O\.',
        r'^www\.',
        r'^http',
        r'^\(?\d{3}\)?[-\s]\d{3}',
        r'^THO NOT USE',
        r'^[\W_]+$',
    ]
    return any(re.match(p, line, re.IGNORECASE) for p in noise_patterns)


def clean_title(title: str) -> str:
    title = re.sub(r'Page No.*', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\s+', ' ', title)
    return title.strip()


def header_score(text: str) -> float:
    stripped = text.strip()

    if not stripped or is_noise(stripped):
        return 0.0

    score = 0.0

    if stripped.isupper() and len(stripped) > 5:
        score += 0.40

    if len(stripped) <= 100:
        score += 0.10

    if len(stripped.split()) <= 12:
        score += 0.10

    if stripped[-1] not in '.,;':
        score += 0.10

    if re.match(r'^\d+\.', stripped):
        score += 0.35

    if re.match(r'^[IVXLC]+\.', stripped):
        score += 0.25

    keywords = [
        'section', 'article', 'clause', 'order',
        'judgment', 'procedure', 'definitions'
    ]
    if any(k in stripped.lower() for k in keywords):
        score += 0.20

    legal_signals = [
        "ORDER",
        "JUDGMENT",
        "FACTS",
        "ISSUES",
        "REASONING",
        "DECISION",
        "GROUNDS",
        "SUBSTANTIAL QUESTIONS OF LAW"
    ]
    if any(k in stripped.upper() for k in legal_signals):
        score += 0.35

    return min(score, 1.0)


def auto_threshold(paragraphs: List[str]) -> float:
    if not paragraphs:
        return 0.5

    scores = [header_score(p) for p in paragraphs]
    ratio = sum(1 for s in scores if s > 0.4) / len(scores)

    if ratio > 0.15:
        return 0.65
    elif ratio < 0.04:
        return 0.35
    return 0.5


def chunk_by_tokens(text: str, max_tokens: int = 1200, overlap: int = 100):
    words = text.split()

    chunks = []
    start = 0
    part = 0

    while start < len(words):
        end = min(start + max_tokens, len(words))

        chunks.append({
            "text": " ".join(words[start:end]),
            "word_count": end - start,
            "is_continuation": part > 0,
            "part": part
        })

        if end == len(words):
            break

        start += max_tokens - overlap
        part += 1

    return chunks


def classify_chunk(title: str) -> str:
    t = title.upper()

    if "ORDER" in t or "DECISION" in t:
        return "decision"
    elif "REASONING" in t or "ANALYSIS" in t:
        return "reasoning"
    elif "FACTS" in t:
        return "facts"
    elif "ISSUES" in t or "QUESTION" in t:
        return "issues"
    elif "JUDGMENT" in t:
        return "judgment"
    else:
        return "content"


def universal_chunk(text: str, max_tokens=1200):
    paragraphs = [
        p.strip() for p in re.split(r'\n\s*\n', text)
        if p.strip() and not is_noise(p)
    ]

    threshold = auto_threshold(paragraphs)

    raw_chunks = []
    current_paragraphs = []
    current_title = "Introduction"
    chunk_index = 0

    for para in paragraphs:
        score = header_score(para)

        if score >= threshold:
            if current_paragraphs:
                text_block = "\n\n".join(current_paragraphs)

                raw_chunks.append({
                    "chunk_id": str(chunk_index),
                    "section_title": clean_title(current_title),
                    "text": text_block,
                    "word_count": len(text_block.split()),
                    "chunk_type": classify_chunk(current_title),
                    "is_continuation": False,
                })
                chunk_index += 1

            current_title = para
            current_paragraphs = []
        else:
            current_paragraphs.append(para)

    if current_paragraphs:
        text_block = "\n\n".join(current_paragraphs)

        raw_chunks.append({
            "chunk_id": str(chunk_index),
            "section_title": clean_title(current_title),
            "text": text_block,
            "word_count": len(text_block.split()),
            "chunk_type": classify_chunk(current_title),
            "is_continuation": False,
        })

    merged_chunks = []

    for chunk in raw_chunks:
        if merged_chunks and chunk["word_count"] < 30:
            merged_chunks[-1]["text"] += "\n\n" + chunk["text"]
            merged_chunks[-1]["word_count"] += chunk["word_count"]
        else:
            merged_chunks.append(chunk)

    final_chunks = []

    for chunk in merged_chunks:
        if chunk["word_count"] > max_tokens:
            subs = chunk_by_tokens(chunk["text"], max_tokens)

            for s in subs:
                final_chunks.append({
                    "chunk_id": f"{chunk['chunk_id']}.{s['part']}",
                    "section_title": chunk["section_title"],
                    "text": s["text"],
                    "word_count": s["word_count"],
                    "chunk_type": chunk["chunk_type"],
                    "is_continuation": s["is_continuation"],
                })
        else:
            final_chunks.append(chunk)

    return final_chunks


def chunk_document(cleaned_text: str, verbose=False) -> List[Dict]:
    if not cleaned_text.strip():
        return []

    chunks = universal_chunk(cleaned_text)

    if verbose:
        print("\n── FINAL CHUNK OUTPUT ──")
        for c in chunks:
            print(
                f"[{c['chunk_id']}] "
                f"{c['section_title']} "
                f"({c['chunk_type']}, {c['word_count']} words)"
            )

    return chunks