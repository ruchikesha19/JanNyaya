import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import styles from './GlossaryPanel.module.css'

export default function GlossaryPanel() {
    const { glossaryOpen, setGlossaryOpen, vocab } = useAppStore()
    const [search, setSearch] = useState('')

    const terms = vocab?.terms || []
    const filtered = terms.filter(t =>
        t.term.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <AnimatePresence>
            {glossaryOpen && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setGlossaryOpen(false)}
                    />
                    <motion.aside
                        className={styles.panel}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    >
                        <div className={styles.panelHeader}>
                            <div>
                                <h2 className={styles.panelTitle}>Legal Glossary</h2>
                                <p className={styles.panelSub}>{terms.length} terms identified</p>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setGlossaryOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className={styles.searchWrap}>
                            <SearchIcon />
                            <input
                                className={styles.searchInput}
                                placeholder="Search terms..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className={styles.termList}>
                            {filtered.length === 0 ? (
                                <p className={styles.empty}>No terms found.</p>
                            ) : (
                                filtered.map((item, i) => (
                                    <motion.div
                                        key={item.term}
                                        className={styles.termCard}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <span className={styles.termWord}>{item.term}</span>
                                        <p className={styles.termMeaning}>{item.meaning}</p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}

function CloseIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}

function SearchIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}
