import chromadb
from sentence_transformers import SentenceTransformer
import uuid

# =========================
# MODEL
# =========================
model = SentenceTransformer("all-MiniLM-L6-v2")

chroma_client = chromadb.Client()

def create_collection(session_id):
    return chroma_client.get_or_create_collection(
        name=f"user_{session_id}"
    )

def delete_collection(session_id):
    try:
        chroma_client.delete_collection(name=f"user_{session_id}")
        print(f"🗑️ Deleted collection: user_{session_id}")
    except:
        pass

# =========================

def ingest_document(chunks):

    session_id = uuid.uuid4().hex

    collection = create_collection(session_id)

    print("💾 Storing embeddings...")

    texts = [chunk["text"] for chunk in chunks]

    metadatas = [
        {
            "label": chunk.get("label", "Unknown"),
            "confidence": chunk.get("confidence", 0.0)
        }
        for chunk in chunks
    ]

    embeddings = model.encode(texts).tolist()
    ids = [str(uuid.uuid4()) for _ in texts]

    collection.add(
        documents=texts,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas
    )

    print(f"✅ Stored {len(texts)} chunks")
    print(f"🧠 Session ID: {session_id}")

    return session_id, collection