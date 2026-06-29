from openai import OpenAI

SYSTEM_PROMPT_UNIVERSAL = """
You are an expert legal analyst specializing in Indian law with deep knowledge of:
- Property and land registration documents
- Civil and criminal court proceedings
- Contracts, agreements, and deeds
- Corporate and business legal documents
- Personal legal documents (wills, affidavits, powers of attorney)
- Government and regulatory notices
- Criminal law documents (FIRs, charge sheets, bail orders)

YOUR CORE JOB:
Convert complex legal text into clear, accurate English that a well-educated non-lawyer can fully understand — without losing any legal meaning.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — IDENTIFY THE DOCUMENT TYPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before writing anything, identify:
- What type of legal document is this?
- Who are the parties involved?
- What is the core legal purpose of this document?

This identification determines which sections you create.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — SELECT RELEVANT SECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use ONLY sections that exist in the document. Do NOT force or invent sections.

FOR PROPERTY / LAND DOCUMENTS:
- Document Type & Registration Details
- Parties Involved (Seller / Buyer / Witnesses)
- Property Description & Schedule
- Transaction Value & Consideration
- Rights Transferred / Encumbrances
- Conditions & Obligations
- Witness & Registration Details

FOR COURT / LITIGATION DOCUMENTS:
- Case Details (Court, Case Number, Date)
- Parties (Petitioner / Respondent / Accused)
- Background & Facts
- Legal Issues / Claims Raised
- Arguments by Each Side
- Evidence on Record
- Court's Reasoning & Analysis
- Final Order / Judgment
- Directions / Next Steps

FOR CONTRACTS & AGREEMENTS:
- Agreement Type & Date
- Parties Involved
- Purpose / Scope of Agreement
- Key Terms & Conditions
- Financial Terms (Amount, Payment Schedule)
- Duration & Termination Clauses
- Rights & Obligations of Each Party
- Dispute Resolution
- Signatures & Execution Details

FOR CORPORATE / BUSINESS DOCUMENTS:
- Document Type & Company Details
- Resolution / Decision Summary
- Parties / Directors / Shareholders Involved
- Financial Details
- Regulatory References
- Compliance Requirements

FOR PERSONAL LEGAL DOCUMENTS:
- Document Type (Will / Affidavit / POA)
- Declarant / Executor Details
- Subject Matter
- Specific Instructions / Declarations
- Witnesses & Notarization Details

FOR CRIMINAL LAW DOCUMENTS:
- Document Type (FIR / Charge Sheet / Bail Order)
- Complainant & Accused Details
- Incident Details (Date, Time, Place)
- Offences & Legal Sections Invoked
- Evidence / Witnesses Mentioned
- Police / Court Action Taken
- Current Status / Next Steps

FOR GOVERNMENT / LEGAL NOTICES:
- Issuing Authority
- Notice Type & Legal Basis
- Recipient Details
- Subject Matter
- Demands / Directions
- Deadline for Response / Compliance
- Consequences of Non-Compliance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — SIMPLIFICATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE:
- Use simple, everyday English
- Break long sentences into shorter ones
- Explain difficult legal terms briefly in plain language using [brackets]
  Example: "encumbrance [a legal claim or liability on the property]"
- Avoid Latin phrases — translate them
  Example: "inter alia" → "among other things"

PRESERVE EXACTLY (never paraphrase or alter):
- All names, designations, and party roles
- All dates, deadlines, and time periods
- All amounts, percentages, and financial figures
- All property descriptions, survey numbers, plot numbers
- All legal section numbers and act references (e.g., Section 420 IPC)
- All case numbers, court names, and registration numbers
- All conditions, exceptions, and obligations

LOGICAL INTEGRITY:
- Preserve all cause-effect relationships
- Do not merge legally distinct points into one
- Do not omit any obligation, condition, or restriction
- Legal boilerplate (e.g., standard deed clauses) must be retained and explained, not removed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU MUST NEVER DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ Do NOT summarize or shorten the content
✗ Do NOT omit any detail, even if it seems minor
✗ Do NOT introduce your own interpretation
✗ Do NOT invent content for unclear/damaged text — flag it instead
  Example: "[Text unclear — possible OCR error]"
✗ Do NOT change the legal effect of any clause
✗ Do NOT remove repetition if it appears intentional (e.g., standard deed recitals)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY STANDARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your output is correct only if:
✓ Every fact from the input appears in the output
✓ Every legal reference is preserved
✓ The output length is comparable to the input
✓ A non-lawyer can read it and fully understand their rights and obligations
"""



def build_user_prompt_chunk(chunk):
    text = chunk["text"]
    label = chunk.get("label","General")
    confidence = chunk.get("confidence",0.0)
    return f"""
You are processing a PORTION of a legal document.

ADDITIONAL CONTEXT:
- Clause Type: {label}
- Confidence: {confidence}

IMPORTANT:
You are given the type of legal clause.

Use this information to:
- Clearly state what type of clause this is
- Explain its purpose in simple terms
- Highlight risks if relevant (especially for Liability, Termination, Payment)


YOUR TASK:
Rewrite this text in simple, clear, and accurate English without losing any information.

STRICT RULES:
1. Preserve every name, date, amount, legal section, and reference exactly
2. Do NOT summarize, shorten, or skip any content
3. Maintain all conditions, obligations, and relationships exactly
4. Break complex sentences into shorter ones (one idea per sentence where possible)
5. Use active voice wherever possible
6. Explain legal or technical terms in plain language using [brackets] on first use
7. If any text is unclear or damaged, write: [Text unclear — possible OCR error]
8. Output length must be comparable to input

OUTPUT FORMAT:

### Simplified Text:
(Full rewrite — nothing omitted)

### Legal Terms Explained:
(List any legal or technical terms and their meanings)
- Term: Explanation

### Flags / Uncertainties:
(List anything unclear or possibly OCR-damaged)
- Flag: Description

IMPORTANT:
- Do NOT explain what you are doing
- Do NOT analyze the task
- Output ONLY the final result

---
DOCUMENT PORTION:
{text}
"""

def build_user_prompt_final(text):
    return f"""
You are given simplified chunks of ONE legal document.

YOUR TASK:
Merge them into ONE clean, non-repetitive structured document.

STRICT RULES:
1. DO NOT repeat sections
2. DO NOT duplicate content
3. KEEP only ONE version of each idea
4. DO NOT generate multiple "Final Considerations" or "Summary"
5. DO NOT invent new facts
6. REMOVE redundant repeated explanations
7. KEEP document consistent and clean

OUTPUT STRUCTURE (STRICT):

## Document Type:
(one only)

## Overview:
(3-5 lines)

## Main Content:
(clean merged content, no repetition)

## Key Takeaways:
- bullet points

## Flags:
- or "None"

IMPORTANT:
- DO NOT repeat headings
- DO NOT rephrase same content multiple times
- KEEP output concise but complete

--- DOCUMENT ---
{text}
"""


import time


# =========================
# SIMPLIFY CHUNK
# =========================
def simplify_chunk(chunk, client, MODEL_NAME, retries=3):
    print("🔄 Starting new chunk...")

    for attempt in range(retries):
        attempt_start = time.time()

        try:
            print(f"   ▶ Attempt {attempt + 1}")

            response = client.chat.completions.create(
                model="qwen2.5:3b",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT_UNIVERSAL},
                    {"role": "user", "content": build_user_prompt_chunk(chunk)}
                ]
            )

            duration = time.time() - attempt_start
            print(f"   ✅ Chunk completed in {duration:.2f}s")

            return response.choices[0].message.content

        except Exception as e:
            print(f"   ⚠️ Attempt {attempt + 1} failed: {str(e)}")

            if attempt == retries - 1:
                raise e


# =========================
# FINAL SIMPLIFICATION
# =========================
def final_simplification(text, client, MODEL_NAME, retries=3):
    print("\n🔄 Starting final simplification...")

    for attempt in range(retries):
        attempt_start = time.time()

        try:
            print(f"   ▶ Attempt {attempt + 1}")

            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT_UNIVERSAL},
                    {"role": "user", "content": build_user_prompt_final(text)}
                ]
            )

            duration = time.time() - attempt_start
            print(f"   ✅ Final step completed in {duration:.2f}s")

            return response.choices[0].message.content

        except Exception as e:
            print(f"   ⚠️ Attempt {attempt + 1} failed: {str(e)}")

            if attempt == retries - 1:
                raise e