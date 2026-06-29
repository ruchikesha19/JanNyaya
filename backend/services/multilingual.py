from deep_translator import GoogleTranslator
import re

# =========================
# SUPPORTED LANGUAGES
# =========================
LANGUAGES = {
    "Hindi": "hi",
    "Tamil": "ta",
    "Telugu": "te",
    "Kannada": "kn",
    "Malayalam": "ml"
}


# =========================
# TRANSLATE TO ALL LANGUAGES
# =========================
def translate_to_all_languages(text):
    translations = {}

    safe_text = text[:4900] if text else ""

    for lang_name, lang_code in LANGUAGES.items():
        try:
            translated = GoogleTranslator(
                source='en',
                target=lang_code
            ).translate(safe_text)

            translations[lang_name] = translated

        except Exception as e:
            translations[lang_name] = f"Error: {str(e)}"

    return translations


# =========================
# TRANSLATE SINGLE LANGUAGE (Needed for app.py)
# =========================
def translate_text_single(text, language_name):
    lang_code = LANGUAGES.get(language_name)

    if not lang_code:
        raise ValueError(f"Unsupported language: {language_name}")

    try:
        safe_text = text[:4900] if text else ""

        translated = GoogleTranslator(
            source='en',
            target=lang_code
        ).translate(safe_text)

        return translated

    except Exception as e:
        raise Exception(f"Translation failed: {str(e)}")


# =========================
# INDIC DETECT & TRANSLATE TO ENGLISH
# =========================
def detect_indic_language(text):
    if not text:
        return None
    # Devanagari (Hindi)
    if re.search(r'[\u0900-\u097F]', text):
        return "Hindi"
    # Tamil
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "Tamil"
    # Telugu
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "Telugu"
    # Kannada
    if re.search(r'[\u0C80-\u0CFF]', text):
        return "Kannada"
    # Malayalam
    if re.search(r'[\u0D00-\u0D7F]', text):
        return "Malayalam"
    return None


def translate_to_english(text, source_language_name):
    lang_code = LANGUAGES.get(source_language_name)
    if not lang_code:
        return text
    try:
        safe_text = text[:4900] if text else ""
        translated = GoogleTranslator(
            source=lang_code,
            target='en'
        ).translate(safe_text)
        return translated
    except Exception as e:
        print(f"⚠️ Translation to English failed: {str(e)}")
        return text