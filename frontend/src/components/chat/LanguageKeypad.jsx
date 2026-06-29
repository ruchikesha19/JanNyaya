import React, { useState } from 'react'
import { KEYPAD_CHARACTERS } from '../../utils/transliteration'
import styles from './LanguageKeypad.module.css'

export default function LanguageKeypad({
  currentLanguage,
  setCurrentLanguage,
  inputMode,
  setInputMode,
  onKeyPress,
  onBackspace,
  onClear,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('vowels') // vowels | consonants | matras

  const languages = ['Hindi', 'Tamil', 'Telugu']
  const chars = KEYPAD_CHARACTERS[currentLanguage] || KEYPAD_CHARACTERS.Hindi

  const renderTranslitGuide = () => {
    const guides = {
      Hindi: [
        { en: 'namaste', native: 'नमस्ते' },
        { en: 'court', native: 'कोर्ट' },
        { en: 'faisla', native: 'फैसला' }
      ],
      Tamil: [
        { en: 'vanakkam', native: 'வணக்கம்' },
        { en: 'neethi', native: 'நீதி' },
        { en: 'vinnappam', native: 'விண்ணப்பம்' }
      ],
      Telugu: [
        { en: 'namaskaram', native: 'నమస్కారం' },
        { en: 'theerpu', native: 'తీర్పు' },
        { en: 'nyayam', native: 'న్యాయం' }
      ]
    }

    const langGuide = guides[currentLanguage] || guides.Hindi

    return (
      <div className={styles.translitGuide}>
        <div className={styles.guideTitle}>Phonetic Typing Mode Enabled</div>
        <p className={styles.guideDesc}>
          Type query using English letters and they will instantly convert into {currentLanguage} characters.
        </p>
        <div className={styles.guideExamples}>
          <span className={styles.exampleLabel}>Examples:</span>
          {langGuide.map((ex, idx) => (
            <div key={idx} className={styles.exampleCard}>
              <span className={styles.exEn}>{ex.en}</span>
              <span className={styles.exArrow}>→</span>
              <span className={styles.exNative}>{ex.native}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.keypadContainer}>
      {/* Top Bar: Language Select & Mode Toggle */}
      <div className={styles.header}>
        <div className={styles.languages}>
          {languages.map(lang => (
            <button
              key={lang}
              className={`${styles.langBtn} ${currentLanguage === lang ? styles.activeLang : ''}`}
              onClick={() => setCurrentLanguage(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className={styles.modeControls}>
          <button
            className={`${styles.modeBtn} ${inputMode === 'translit' ? styles.activeMode : ''}`}
            onClick={() => setInputMode('translit')}
            title="Type phonetically in English"
          >
            Phonetic (English Input)
          </button>
          <button
            className={`${styles.modeBtn} ${inputMode === 'keypad' ? styles.activeMode : ''}`}
            onClick={() => setInputMode('keypad')}
            title="Click characters on screen"
          >
            Keypad
          </button>
        </div>

        <button className={styles.closeBtn} onClick={onClose} title="Hide Keyboard" aria-label="Close keyboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {inputMode === 'translit' ? (
        renderTranslitGuide()
      ) : (
        <div className={styles.keypadBody}>
          {/* Sub-tabs for keypad (Vowels, Consonants, Matras) */}
          <div className={styles.subTabs}>
            <button
              className={`${styles.subTabBtn} ${activeTab === 'vowels' ? styles.activeSubTab : ''}`}
              onClick={() => setActiveTab('vowels')}
            >
              Vowels (स्वर)
            </button>
            <button
              className={`${styles.subTabBtn} ${activeTab === 'consonants' ? styles.activeSubTab : ''}`}
              onClick={() => setActiveTab('consonants')}
            >
              Consonants (व्यंजन)
            </button>
            <button
              className={`${styles.subTabBtn} ${activeTab === 'matras' ? styles.activeSubTab : ''}`}
              onClick={() => setActiveTab('matras')}
            >
              Modifiers (मात्रा)
            </button>
          </div>

          {/* Key Grid */}
          <div className={styles.keyGrid}>
            {chars[activeTab].map((char, index) => (
              <button
                key={index}
                className={styles.keyBtn}
                onClick={() => onKeyPress(char)}
              >
                {char}
              </button>
            ))}
          </div>

          {/* Action Keys */}
          <div className={styles.actionRow}>
            <button className={`${styles.actionBtn} ${styles.spaceBtn}`} onClick={() => onKeyPress(' ')}>
              Space
            </button>
            <button className={`${styles.actionBtn} ${styles.backspaceBtn}`} onClick={onBackspace}>
              Backspace
            </button>
            <button className={`${styles.actionBtn} ${styles.clearBtn}`} onClick={onClear}>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
