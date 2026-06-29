import pdfplumber
from pdf2image import convert_from_path
from docx import Document
import pytesseract
from PIL import Image
import cv2
import numpy as np
from pathlib import Path

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH = r"C:\poppler-25.12.0\Library\bin"


def preprocess_image(image):
    img = np.array(image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)[1]
    return thresh


def extract_pdf_text(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text and page_text.strip():
                text += page_text + "\n"
            else:
                image = page.to_image(resolution=300).original
                processed = preprocess_image(image)
                ocr_text = pytesseract.image_to_string(processed)
                text += ocr_text + "\n"
    return text


def extract_scanned_pdf(file_path):
    images = convert_from_path(file_path, poppler_path=POPPLER_PATH)
    extracted_text = ""
    for i, img in enumerate(images):
        processed = preprocess_image(img)
        text = pytesseract.image_to_string(processed)
        extracted_text += f"\n\n----- PAGE {i+1} -----\n"
        extracted_text += text
    return extracted_text


def extract_docx(file_path):
    doc = Document(file_path)
    text = []
    for para in doc.paragraphs:
        text.append(para.text)
    return "\n".join(text)


def extract_image_text(file_path):
    img = Image.open(file_path)
    processed = preprocess_image(img)
    text = pytesseract.image_to_string(processed)
    return text


def extract_txt(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def extract_text(file_path):
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext == ".pdf":
        try:
            return extract_pdf_text(file_path)
        except:
            return extract_scanned_pdf(file_path)

    elif ext == ".docx":
        return extract_docx(file_path)

    elif ext in [".png", ".jpg", ".jpeg", ".webp", ".tiff"]:
        return extract_image_text(file_path)

    elif ext == ".txt":
        return extract_txt(file_path)

    else:
        raise ValueError("Unsupported file type")