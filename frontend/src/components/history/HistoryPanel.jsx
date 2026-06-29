import React, { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { fetchHistory, loadHistoryItem, deleteHistoryItem } from '../../api'
import styles from './HistoryPanel.module.css'

export default function HistoryPanel() {
    const { historyOpen, setHistoryOpen, setDocumentData } = useAppStore()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingHash, setLoadingHash] = useState(null)
    const [deletingHash, setDeletingHash] = useState(null)

    const loadHistory = useCallback(async () => {
        setLoading(true)
        try {
            const data = await fetchHistory()
            setHistory(data)
        } catch (err) {
            console.error('Failed to fetch history:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (historyOpen) loadHistory()
    }, [historyOpen, loadHistory])

    const handleLoad = async (entry) => {
        setLoadingHash(entry.file_hash)
        try {
            const data = await loadHistoryItem(entry.file_hash)
            setDocumentData(data)
            setHistoryOpen(false)
        } catch (err) {
            console.error('Failed to load history item:', err)
        } finally {
            setLoadingHash(null)
        }
    }

    const handleDelete = async (entry, e) => {
        e.stopPropagation()
        setDeletingHash(entry.file_hash)
        try {
            await deleteHistoryItem(entry.file_hash)
            setHistory(prev => prev.filter(h => h.file_hash !== entry.file_hash))
        } catch (err) {
            console.error('Failed to delete history item:', err)
        } finally {
            setDeletingHash(null)
        }
    }

    const formatDate = (isoStr) => {
        if (!isoStr) return 'Unknown'
        const d = new Date(isoStr + 'Z')
        return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
            + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <AnimatePresence>
            {historyOpen && (
                <>
                    <motion.div
                        key="history-backdrop"
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setHistoryOpen(false)}
                    />
                    <motion.aside
                        key="history-panel"
                        className={styles.panel}
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 35 }}
                    >
                        <div className={styles.header}>
                            <div className={styles.headerLeft}>
                                <HistoryIcon />
                                <h2 className={styles.title}>Document History</h2>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setHistoryOpen(false)} title="Close">
                                <CloseIcon />
                            </button>
                        </div>

                        <p className={styles.subtitle}>
                            Previously analyzed documents are cached locally. Click <strong>Load</strong> to restore instantly — no re-processing needed.
                        </p>

                        <div className={styles.list}>
                            {loading && (
                                <div className={styles.empty}>
                                    <span className={styles.spinner} />
                                    <span>Loading history...</span>
                                </div>
                            )}
                            {!loading && history.length === 0 && (
                                <div className={styles.empty}>
                                    <EmptyIcon />
                                    <p>No documents analyzed yet.</p>
                                    <p className={styles.emptyHint}>Upload a document to get started.</p>
                                </div>
                            )}
                            {!loading && history.map(entry => (
                                <motion.div
                                    key={entry.file_hash}
                                    className={styles.card}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                >
                                    <div className={styles.cardIcon}>
                                        <FileIcon />
                                    </div>
                                    <div className={styles.cardBody}>
                                        <span className={styles.cardName} title={entry.filename}>
                                            {entry.filename}
                                        </span>
                                        <span className={styles.cardMeta}>
                                            {formatDate(entry.last_accessed)} · {entry.chunks_count} sections
                                        </span>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.loadBtn}
                                            onClick={() => handleLoad(entry)}
                                            disabled={loadingHash === entry.file_hash}
                                            title="Load this document"
                                        >
                                            {loadingHash === entry.file_hash
                                                ? <span className={styles.spinnerSm} />
                                                : <LoadIcon />}
                                            <span>Load</span>
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => handleDelete(entry, e)}
                                            disabled={deletingHash === entry.file_hash}
                                            title="Delete from history"
                                        >
                                            {deletingHash === entry.file_hash
                                                ? <span className={styles.spinnerSm} />
                                                : <TrashIcon />}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}

function HistoryIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 12a9 9 0 1 0 2.63-6.36L3 3v4h4" />
            <path d="M12 7v5l3 3" />
        </svg>
    )
}

function CloseIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    )
}

function FileIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    )
}

function LoadIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    )
}

function TrashIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
        </svg>
    )
}

function EmptyIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4">
            <path d="M3 12a9 9 0 1 0 2.63-6.36L3 3v4h4" />
            <path d="M12 7v5l3 3" />
        </svg>
    )
}
