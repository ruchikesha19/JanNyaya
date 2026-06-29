from openai import OpenAI

MODEL_NAME = "qwen2.5:3b"   # or qwen2.5:7b

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)

LABELS = [
    "Case Details",
    "Parties",
    "Facts",
    "Arguments",
    "Evidence",
    "Legal Issues",
    "Court Reasoning",
    "Judgment",
    "General"
]


def classify_chunk(text):
    try:
        prompt = f"""
You are a legal expert.

Classify the following legal text into ONE category.

Choose the MOST relevant category:

- Case Details → case number, court name, filing info
- Parties → names of people or entities involved
- Facts → background story or events
- Arguments → claims made by lawyers/parties
- Evidence → documents, proof, records
- Legal Issues → legal questions or disputes
- Court Reasoning → judge's analysis
- Judgment → final decision/order
- General → if nothing fits

STRICT RULES:
- Return ONLY one category name (exactly as written above)
- Do NOT explain anything
- Do NOT return extra text
"""

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        raw_output = response.choices[0].message.content.strip()

        # DEBUG (optional)
        print("RAW LLM:", raw_output)

        # Clean output
        label = raw_output.split("\n")[0].strip()

        # Safety fallback
        if label not in LABELS:
            label = "General"

        return {
            "label": label,
            "confidence": 1.0
        }

    except Exception as e:
        print("LLM ERROR:", str(e))
        return {
            "label": "General",
            "confidence": 0.0
        }
