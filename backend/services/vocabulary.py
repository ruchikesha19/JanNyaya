import json
import re
from openai import OpenAI

# MODEL="gemini-2.5-flash-lite"
# GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
# # GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# GEMINI_API_KEY="AIzaSyAMdgDLTVaa8zVXLm6e3Iwe5_1o0xR3SuA"

# client = OpenAI(
#     base_url=GEMINI_BASE_URL,
#     api_key=GEMINI_API_KEY,
# )

# =========================
# SYSTEM PROMPT
# =========================
SYSTEM_PROMPT_VOCAB = """
You are a legal vocabulary extractor.

STRICT RULES:
- Return ONLY valid JSON
- DO NOT include any text before or after JSON
- DO NOT use markdown code fences like ```json
- DO NOT explain anything outside JSON

Extract key legal terms from the text and explain them in very simple English.

INCLUDE ONLY:
- legal procedures
- legal concepts
- statutes/sections
- doctrines

EXCLUDE:
- names
- places
- dates
- general words

Each explanation must be one short sentence.
Use exactly the key name "meaning", NOT "definition".

FORMAT:
{
  "terms": [
    {
      "term": "...",
      "meaning": "..."
    }
  ]
}
"""

# =========================
# USER PROMPT
# =========================
def build_vocab_prompt(text):
    return f"""
Extract legal terms from the following document and explain them clearly.

Text:
{text}
"""

# =========================
# MAIN FUNCTION
# =========================
def extract_legal_vocab(text, client: OpenAI, MODEL, retries=3):
# def extract_legal_vocab(text, retries=3):

    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                temperature=0,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT_VOCAB},
                    {"role": "user", "content": build_vocab_prompt(text)}
                ]
            )

            raw_output = response.choices[0].message.content.strip()
            print("RAW OUTPUT:\n", raw_output)

            # =========================
            # CLEAN OUTPUT
            # Strip markdown fences if model ignores the instruction
            # =========================
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_output, re.DOTALL)
            if match:
                json_text = match.group(1)
            else:
                match = re.search(r"\{.*\}", raw_output, re.DOTALL)
                if not match:
                    print(f"Attempt {attempt + 1}: No JSON found in output.")
                    continue
                json_text = match.group(0)

            # =========================
            # PARSE JSON
            # =========================
            parsed = json.loads(json_text)

            # =========================
            # VALIDATION
            # =========================
            if "terms" not in parsed:
                print(f"Attempt {attempt + 1}: 'terms' key missing.")
                continue

            clean_terms = []
            for item in parsed["terms"]:
                if "term" in item:
                    # Accept both "meaning" and "definition" in case model ignores instruction
                    meaning = item.get("meaning") or item.get("definition", "")
                    if meaning:
                        clean_terms.append({
                            "term": item["term"],
                            "meaning": meaning or "No Meaning Provided"
                        })

            if not clean_terms:
                print(f"Attempt {attempt + 1}: No valid terms parsed.")
                continue

            return {"terms": clean_terms}

        except json.JSONDecodeError as e:
            print(f"Attempt {attempt + 1}: JSON parse error - {e}")
        except Exception as e:
            print(f"Attempt {attempt + 1}: Unexpected error - {e}")

    return {"terms": []}

