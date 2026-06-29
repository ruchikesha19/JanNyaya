import re
import unicodedata


def normalize_unicode(text: str) -> str:
    text = unicodedata.normalize("NFC", text)

    ligatures = {
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\ufb00": "ff",
        "\ufb03": "ffi",
        "\ufb04": "ffl",
    }

    for lig, rep in ligatures.items():
        text = text.replace(lig, rep)

    replacements = {
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2014": " - ",
        "\u2013": "-",
        "\u00a0": " ",
    }

    for k, v in replacements.items():
        text = text.replace(k, v)

    return text


def remove_page_artifacts(text: str) -> str:

    text = text.replace("\f", "\n")

    patterns = [
        r"^\s*Page\s+No\.?#?\s*\d+/\d+\s*$",
        r"^\s*Page\s+\d+\s+of\s+\d+\s*$",
        r"^\s*-\s*\d+\s*-\s*$",
        r"^\s*\d+\s*$",
        r"^\s*CONFIDENTIAL\s*$",
        r"^\s*DRAFT\s*$",
    ]

    for pattern in patterns:
        text = re.sub(pattern, "", text, flags=re.MULTILINE | re.IGNORECASE)

    return text


def remove_line_numbers(text: str) -> str:
    return re.sub(r"^\s{0,4}\d{1,3}\s{2,}", "", text, flags=re.MULTILINE)


def fix_line_wrap_hyphenation(text: str) -> str:
    return re.sub(r"(\w)-\n(\w)", r"\1\2", text)


def merge_broken_lines(text: str) -> str:
    """
    Convert single line breaks to spaces while preserving paragraph breaks
    """
    return re.sub(r"(?<!\n)\n(?!\n)", " ", text)


def fix_common_ocr_errors(text: str) -> str:

    fixes = {
        r"\b1aw\b": "law",
        r"\b1iability\b": "liability",
        r"\b1ien\b": "lien",
        r"\bshal1\b": "shall",
        r"\bShal1\b": "Shall",
        r"\bwil1\b": "will",
        r"\bWil1\b": "Will",
    }

    for pattern, rep in fixes.items():
        text = re.sub(pattern, rep, text)

    return text


def normalize_whitespace(text: str) -> str:

    text = text.replace("\t", " ")

    text = re.sub(r"[ ]{2,}", " ", text)

    lines = [line.strip() for line in text.splitlines()]
    text = "\n".join(lines)

    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def extract_defined_terms(text: str) -> dict:

    defined_terms = {}

    pattern = re.compile(
        r'"([A-Z][^"]{1,60})"\s+(?:means|shall mean|refers to)\s+([^.]{10,200}\.)',
        re.IGNORECASE,
    )

    for match in pattern.finditer(text):
        term = match.group(1).strip()
        definition = match.group(2).strip()
        defined_terms[term] = definition

    return defined_terms


def clean_legal_text(text: str, extract_terms=False) -> dict:

    text = normalize_unicode(text)

    text = remove_page_artifacts(text)

    text = remove_line_numbers(text)

    text = fix_line_wrap_hyphenation(text)

    text = merge_broken_lines(text)

    text = fix_common_ocr_errors(text)

    text = normalize_whitespace(text)

    defined_terms = {}

    if extract_terms:
        defined_terms = extract_defined_terms(text)

    return {
        "cleaned_text": text,
        "defined_terms": defined_terms
    }

filepath = r"C:\Users\praba\Documents\Projects\Legal\backend\uploads\Highcourt of Assam.pdf"