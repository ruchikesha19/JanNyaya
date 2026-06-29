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

    if collection is None:
        print("⚠️ No collection active (no document uploaded yet). Skipping retrieval.")
        context = "No document uploaded yet."
    else:
        print("🔍 Retrieving relevant chunks...")
        try:
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
        except Exception as e:
            print(f"⚠️ Retrieval failed: {str(e)}")
            context = "No relevant context found."

    # =========================
    # SYSTEM PROMPT
    # =========================
    if collection is None:
        SYSTEM_PROMPT = """
You are the JanNyaya Legal Assistant.

STRICT RULES:
- Politely greet the user and introduce yourself as their legal assistant.
- Inform them that they need to upload a legal document first (using the "New Document" button or file upload area) before you can assist them with questions about it.
"""
    else:
        SYSTEM_PROMPT = f"""
You are a legal assistant chatbot.

STRICT RULES:
- If the user query is a greeting (e.g., "hi", "hello", "hey", "good morning") or a conversational inquiry like "who are you" or "how can you help", greet them back politely, introduce yourself as the JanNyaya Legal Assistant, and invite them to ask questions about the uploaded document.
- For all other questions, answer ONLY using the CONTEXT and STRUCTURED DATA.
- If the answer to a document-related question is NOT clearly in CONTEXT → say "Not found in document".
- Do NOT use outside knowledge for document-related questions.
- Keep answers simple and clear.
- STRUCTURED DATA is secondary (use only if needed).

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