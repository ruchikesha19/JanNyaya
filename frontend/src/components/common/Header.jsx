import React from 'react'
import { useAppStore } from '../../store/useAppStore'
import { cleanupSession } from '../../api'
import HistoryPanel from '../history/HistoryPanel'
import styles from './Header.module.css'

export default function Header() {
    const { uploadState, resetAll, vocab, setGlossaryOpen, glossaryOpen, historyOpen, setHistoryOpen } = useAppStore()
    const hasDocs = uploadState === 'done'

    const handleReset = async () => {
        await cleanupSession()
        resetAll()
    }

    return (
        <>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <div className={styles.logoMark}>
                        <ScaleIcon />
                    </div>
                    <div className={styles.brandText}>
                        <span className={styles.brandName}>JanNyaya</span>
                        <span className={styles.brandTagline}>Legal AI</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    {hasDocs && vocab?.terms?.length > 0 && (
                        <button
                            className={`${styles.actionBtn} ${glossaryOpen ? styles.active : ''}`}
                            onClick={() => setGlossaryOpen(!glossaryOpen)}
                            title="Legal Glossary"
                        >
                            <BookIcon />
                            <span>Glossary</span>
                            <span className={styles.badge}>{vocab.terms.length}</span>
                        </button>
                    )}
                    <button
                        className={`${styles.actionBtn} ${historyOpen ? styles.active : ''}`}
                        onClick={() => setHistoryOpen(!historyOpen)}
                        title="Document History"
                    >
                        <HistoryNavIcon />
                        <span>History</span>
                    </button>
                    {hasDocs && (
                        <button className={`${styles.actionBtn} ${styles.resetBtn}`} onClick={handleReset}>
                            <RefreshIcon />
                            <span>New Document</span>
                        </button>
                    )}
                </div>
            </header>
            <HistoryPanel />
        </>
    )
}

function ScaleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v18M3 9l9-6 9 6M5 20h14M8 12l-3 6h6l-3-6zM16 12l-3 6h6l-3-6z" />
        </svg>
    )
}

function BookIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}

function RefreshIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
        </svg>
    )
}

function HistoryNavIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 2.63-6.36L3 3v4h4" />
            <path d="M12 7v5l3 3" />
        </svg>
    )
}
