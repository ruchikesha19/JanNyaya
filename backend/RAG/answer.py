from openai import OpenAI

def retrieve_chunks(collection, question, model, k=3):

    q_embeddings = model.encode([question]).tolist()

    results = collection.query(
        query_embeddings=q_embeddings,
        n_results=k
    )

    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    retrieved = []

    for doc, dist, meta in zip(documents, distances, metadatas):
        retrieved.append({
            "text": doc,
            "score": dist,
            "metadata": meta
        })

    return retrieved


# =========================
# ANSWER FUNCTION
# =========================
def answer_question(question, collection, structured_data, client, MODEL, model, chat_history):

    print("🔍 Retrieving relevant chunks...")

    relevant_chunks = retrieve_chunks(collection, question, model)

    # =========================
    # FILTER CHUNKS
    # =========================
    filtered_chunks = [
        chunk for chunk in relevant_chunks
        if chunk["score"] < 1.5
    ]

    if not filtered_chunks:
        context = "No relevant context found."
    else:
        context = "\n\n".join(chunk["text"] for chunk in filtered_chunks)

    print(f"📊 Retrieved {len(filtered_chunks)} relevant chunks")

    # =========================
    # SYSTEM PROMPT
    # =========================
    SYSTEM_PROMPT = f"""
You are a legal assistant chatbot.

STRICT RULES:
- Answer ONLY using CONTEXT
- If answer is NOT clearly in CONTEXT → say "Not found in document"
- Do NOT use outside knowledge
- Keep answers simple and clear
- STRUCTURED DATA is secondary (use only if needed)

CONTEXT:
{context}

STRUCTURED DATA:
{structured_data}
"""

    # =========================
    # BUILD CHAT
    # =========================
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in chat_history:
        messages.append(msg)

    messages.append({"role": "user", "content": question})

    print("🤖 Generating answer...")

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0
    )

    return response.choices[0].message.content