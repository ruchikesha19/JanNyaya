from deep_translator import GoogleTranslator

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