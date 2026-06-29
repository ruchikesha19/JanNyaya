import React, { useEffect, useMemo, useState } from 'react'
import styles from './SpeechButton.module.css'

const LANGUAGE_CODE_MAP = {
    English: 'en-US',
    'en-US': 'en-US',
    Hindi: 'hi-IN',
    'hi-IN': 'hi-IN',
    Tamil: 'ta-IN',
    'ta-IN': 'ta-IN',
    Kannada: 'kn-IN',
    'kn-IN': 'kn-IN',
    Telugu: 'te-IN',
    'te-IN': 'te-IN',
    Malayalam: 'ml-IN',
    'ml-IN': 'ml-IN',
}

function resolveSpeechLanguage(language) {
    return LANGUAGE_CODE_MAP[language] || 'en-US'
}

function getMatchingVoice(lang) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null

    return window.speechSynthesis
        .getVoices()
        .find(voice => voice.lang?.toLowerCase() === lang.toLowerCase()) || null
}

export default function SpeechButton({ text, language = 'en-US' }) {
    const [speaking, setSpeaking] = useState(false)
    const speechLanguage = useMemo(() => resolveSpeechLanguage(language), [language])
    const supported = typeof window !== 'undefined'
        && 'speechSynthesis' in window
        && 'SpeechSynthesisUtterance' in window

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel()
            }
            setSpeaking(false)
        }
    }, [text, speechLanguage])

    useEffect(() => {
        const stopOnHidden = () => {
            if (document.hidden && window.speechSynthesis) {
                window.speechSynthesis.cancel()
                setSpeaking(false)
            }
        }

        document.addEventListener('visibilitychange', stopOnHidden)
        return () => document.removeEventListener('visibilitychange', stopOnHidden)
    }, [])

    const handleSpeak = () => {
        if (!text?.trim() || !supported) return

        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const voice = getMatchingVoice(speechLanguage)

        utterance.lang = speechLanguage
        if (voice) utterance.voice = voice
        utterance.rate = 1
        utterance.pitch = 1

        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)

        window.speechSynthesis.speak(utterance)
    }

    const handleStop = () => {
        if (!supported) return

        window.speechSynthesis.cancel()
        setSpeaking(false)
    }

    return (
        <div className={styles.speechControls}>
            <button
                type="button"
                className={styles.speakButton}
                onClick={handleSpeak}
                disabled={!text?.trim() || !supported}
                title={supported ? `Read aloud in ${speechLanguage}` : 'Speech synthesis is not supported'}
            >
                <SpeakerIcon />
                {speaking ? 'Speaking...' : 'Speak'}
            </button>
            <button
                type="button"
                className={styles.stopButton}
                onClick={handleStop}
                disabled={!speaking}
                title="Stop reading"
            >
                <StopIcon />
                Stop
            </button>
        </div>
    )
}

function SpeakerIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
    )
}

function StopIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
    )
}
