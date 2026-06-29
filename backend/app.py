from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

from werkzeug.utils import secure_filename
import os
import json
import hashlib
import datetime
from concurrent.futures import ThreadPoolExecutor

# =========================
# IMPORT YOUR MODULES
# =========================
from services.extraction import extract_text
from services.cleaning import clean_legal_text
from services.chunking import chunk_document
from services.classifier import classify_chunk
from services.simplifier import simplify_chunk, final_simplification
from services.vocabulary import extract_legal_vocab
from services.multilingual import translate_text_single, detect_indic_language, translate_to_english

from RAG.injest import ingest_document, delete_collection, model
from RAG.answer import answer_question

from openai import OpenAI

# =========================
# CONFIG
# =========================
app = Flask(__name__)
CORS(app)


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

HISTORY_FOLDER = "history"
os.makedirs(HISTORY_FOLDER, exist_ok=True)

MODEL_NAME = "qwen2.5:3b"
# MODEL_NAME = "llama3"
# MODEL_NAME = "mistral:7b"

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)
# MODEL_NAME="gemini-2.5-flash-lite"
# GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
# # GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# client = OpenAI(
#     base_url=GEMINI_BASE_URL,
#     api_key=GEMINI_API_KEY,
# )


# client = OpenAI(
#     api_key=OR_API_KEY,
#     base_url="https://openrouter.ai/api/v1"
# )

# MODEL_NAME = "qwen/qwen-2.5-7b-instruct"

# =========================
# GLOBAL SESSION STORAGE
# =========================
CURRENT_COLLECTION = None
CURRENT_SESSION_ID = None
CHAT_HISTORY = []
STRUCTURED_DATA = ""
CURRENT_FILE_HASH = None


# =========================
# HOME
# =========================
@app.route("/")
def home():
    return jsonify({"message": "API is running"})

# =========================
# UPLOAD + PROCESS
# =========================
@app.route("/upload", methods=["POST"])
def upload():

    global CURRENT_COLLECTION, CURRENT_SESSION_ID, STRUCTURED_DATA, CHAT_HISTORY, CURRENT_FILE_HASH

    file = request.files["file"]
    filename = secure_filename(file.filename)

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # =========================
    # CACHE CHECK: Compute file hash
    # =========================
    with open(filepath, "rb") as f:
        file_bytes = f.read()
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    CURRENT_FILE_HASH = file_hash
    cache_path = os.path.join(HISTORY_FOLDER, f"{file_hash}.json")

    if os.path.exists(cache_path):
        print(f"⚡ Cache hit! Loading '{filename}' from history...")
        with open(cache_path, "r", encoding="utf-8") as cf:
            cached = json.load(cf)
        # Restore session from cache
        STRUCTURED_DATA = cached["final_output"]
        CHAT_HISTORY = []
        CURRENT_SESSION_ID, CURRENT_COLLECTION = ingest_document(cached["chunks"])
        # Update access timestamp
        cached["last_accessed"] = datetime.datetime.utcnow().isoformat()
        with open(cache_path, "w", encoding="utf-8") as cf:
            json.dump(cached, cf, ensure_ascii=False, indent=2)
        return jsonify({
            "raw_text": cached["raw_text"],
            "cleaned_text": cached["cleaned_text"],
            "chunks": cached["chunks"],
            "chunks_count": len(cached["chunks"]),
            "final_output": cached["final_output"],
            "vocab": cached["vocab"],
            "from_cache": True
        })

    # =========================
    # STEP 1: EXTRACT
    # =========================
    raw_text = extract_text(filepath)

    # =========================
    # STEP 2: CLEAN
    # =========================
    cleaned_data = clean_legal_text(raw_text)
    clean_text = cleaned_data["cleaned_text"]

    # =========================
    # STEP 3: CHUNK
    # =========================
    chunks = chunk_document(clean_text)

    # =========================
    # STEP 4: CLASSIFY (Parallelized)
    # =========================
    def process_classify(chunk):
        try:
            result = classify_chunk(chunk["text"])
            return {
                "text": chunk["text"],
                "label": result["label"],
                "confidence": result["confidence"]
            }
        except Exception as e:
            print(f"⚠️ Classification failed for chunk: {e}")
            return {
                "text": chunk["text"],
                "label": "General",
                "confidence": 0.0
            }

    print(f"🚀 Classifying {len(chunks)} chunks in parallel...")
    with ThreadPoolExecutor(max_workers=8) as executor:
        classified_chunks = list(executor.map(process_classify, chunks))

    # =========================
    # STEP 5: SIMPLIFY (Parallelized)
    # =========================
    def process_simplify(chunk):
        try:
            return simplify_chunk(chunk, client, MODEL_NAME)
        except Exception as e:
            print(f"⚠️ Simplification failed for chunk: {e}")
            return "Error in simplification"

    print(f"🚀 Simplifying {len(classified_chunks)} chunks in parallel...")
    with ThreadPoolExecutor(max_workers=8) as executor:
        simplified_chunks = list(executor.map(process_simplify, classified_chunks))

    final_input = "\n\n".join(simplified_chunks)

    final_output = final_simplification(final_input, client, MODEL_NAME)

    STRUCTURED_DATA = final_output

    # =========================
    # STEP 6: VOCAB
    # =========================
    vocab = extract_legal_vocab(clean_text, client, MODEL_NAME)
    # vocab = extract_legal_vocab(clean_text)

    # =========================
    # STEP 7: RAG INGEST
    # =========================
    CURRENT_SESSION_ID, CURRENT_COLLECTION = ingest_document(classified_chunks)

    CHAT_HISTORY = []

    # =========================
    # SAVE TO HISTORY CACHE
    # =========================
    cache_entry = {
        "file_hash": file_hash,
        "filename": filename,
        "analyzed_at": datetime.datetime.utcnow().isoformat(),
        "last_accessed": datetime.datetime.utcnow().isoformat(),
        "raw_text": raw_text,
        "cleaned_text": clean_text,
        "chunks": classified_chunks,
        "final_output": final_output,
        "vocab": vocab
    }
    with open(cache_path, "w", encoding="utf-8") as cf:
        json.dump(cache_entry, cf, ensure_ascii=False, indent=2)
    print(f"✅ Saved analysis to history cache: {cache_path}")

    # =========================
    # RESPONSE
    # =========================
    return jsonify({
        "raw_text": raw_text,
        "cleaned_text": clean_text,
        "chunks": classified_chunks,
        "chunks_count": len(classified_chunks),
        "final_output": final_output,
        "vocab": vocab,
        "from_cache": False
    })


# =========================
# CHAT (RAG)
# =========================
@app.route("/chat", methods=["POST"])
def chat():

    global CHAT_HISTORY

    data = request.json
    question = data.get("question")

    # Detect if the query is in an Indic language
    detected_lang = detect_indic_language(question)
    query_for_rag = question

    if detected_lang:
        print(f"🌐 Detected Indic language '{detected_lang}' in query. Translating to English...")
        query_for_rag = translate_to_english(question, detected_lang)
        print(f"👉 Translated query: {query_for_rag}")

    answer = answer_question(
        query_for_rag,
        CURRENT_COLLECTION,
        STRUCTURED_DATA,
        client,
        MODEL_NAME,
        model,
        CHAT_HISTORY
    )

    final_answer = answer
    if detected_lang:
        print(f"🌐 Translating response back to '{detected_lang}'...")
        try:
            final_answer = translate_text_single(answer, detected_lang)
        except Exception as e:
            print(f"⚠️ Translation back failed: {str(e)}")
            final_answer = answer

    # Keep backend history in English for RAG LLM stability
    CHAT_HISTORY.append({"role": "user", "content": query_for_rag})
    CHAT_HISTORY.append({"role": "assistant", "content": answer})

    return jsonify({"answer": final_answer})


# =========================
# TRANSLATE
# =========================
@app.route("/translate", methods=["POST"])
def translate():

    data = request.json
    text = data.get("text")
    language = data.get("language")

    translated = translate_text_single(text, language)

    return jsonify({"translated_text": translated})


# =========================
# CLEANUP (OPTIONAL)
# =========================
@app.route("/cleanup", methods=["POST"])
def cleanup():

    global CURRENT_SESSION_ID

    if CURRENT_SESSION_ID:
        delete_collection(CURRENT_SESSION_ID)

    return jsonify({"status": "deleted"})


# =========================
# HISTORY: LIST
# =========================
@app.route("/history", methods=["GET"])
def list_history():
    entries = []
    for fname in os.listdir(HISTORY_FOLDER):
        if fname.endswith(".json"):
            fpath = os.path.join(HISTORY_FOLDER, fname)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                entries.append({
                    "file_hash": data.get("file_hash"),
                    "filename": data.get("filename"),
                    "analyzed_at": data.get("analyzed_at"),
                    "last_accessed": data.get("last_accessed"),
                    "chunks_count": len(data.get("chunks", []))
                })
            except Exception as e:
                print(f"⚠️ Could not read history file {fname}: {e}")
    entries.sort(key=lambda x: x.get("last_accessed", ""), reverse=True)
    return jsonify({"history": entries})


# =========================
# HISTORY: LOAD
# =========================
@app.route("/history/load", methods=["POST"])
def load_history():
    global CURRENT_COLLECTION, CURRENT_SESSION_ID, STRUCTURED_DATA, CHAT_HISTORY, CURRENT_FILE_HASH

    data = request.json
    file_hash = data.get("file_hash")
    cache_path = os.path.join(HISTORY_FOLDER, f"{file_hash}.json")

    if not os.path.exists(cache_path):
        return jsonify({"error": "History entry not found"}), 404

    with open(cache_path, "r", encoding="utf-8") as cf:
        cached = json.load(cf)

    STRUCTURED_DATA = cached["final_output"]
    CHAT_HISTORY = []
    CURRENT_FILE_HASH = file_hash
    CURRENT_SESSION_ID, CURRENT_COLLECTION = ingest_document(cached["chunks"])

    # Update access time
    cached["last_accessed"] = datetime.datetime.utcnow().isoformat()
    with open(cache_path, "w", encoding="utf-8") as cf:
        json.dump(cached, cf, ensure_ascii=False, indent=2)

    return jsonify({
        "raw_text": cached["raw_text"],
        "cleaned_text": cached["cleaned_text"],
        "chunks": cached["chunks"],
        "chunks_count": len(cached["chunks"]),
        "final_output": cached["final_output"],
        "vocab": cached["vocab"],
        "from_cache": True
    })


# =========================
# HISTORY: DELETE
# =========================
@app.route("/history/<file_hash>", methods=["DELETE"])
def delete_history(file_hash):
    cache_path = os.path.join(HISTORY_FOLDER, f"{file_hash}.json")
    if os.path.exists(cache_path):
        os.remove(cache_path)
        return jsonify({"status": "deleted"})
    return jsonify({"error": "Not found"}), 404


# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True)
    # app.run(host="0.0.0.0", port=5000, debug=True)