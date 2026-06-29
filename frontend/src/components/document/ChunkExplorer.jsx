import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { getLabelConfig, truncate } from '../../utils'
import styles from './ChunkExplorer.module.css'

const ALL = 'All'

export default function ChunkExplorer() {
    const { chunks } = useAppStore()
    const [filter, setFilter] = useState(ALL)
    const [expanded, setExpanded] = useState(new Set())
    const [search, setSearch] = useState('')

    const labels = useMemo(() => {
        const s = new Set(chunks.map(c => c.label))
        return [ALL, ...Array.from(s)]
    }, [chunks])

    const filtered = useMemo(() => {
        return chunks.filter(c => {
            const matchLabel = filter === ALL || c.label === filter
            const matchSearch = !search || c.text.toLowerCase().includes(search.toLowerCase())
            return matchLabel && matchSearch
        })
    }, [chunks, filter, search])

    const toggleExpand = (i) => {
        setExpanded(prev => {
            const next = new Set(prev)
            next.has(i) ? next.delete(i) : next.add(i)
            return next
        })
    }

    const expandAll = () => setExpanded(new Set(filtered.map((_, i) => i)))
    const collapseAll = () => setExpanded(new Set())

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div>
                        <h2 className={styles.title}>Document Sections</h2>
                        <p className={styles.subtitle}>
                            {chunks.length} classified segments — explore the logic of your document
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.textBtn} onClick={expandAll}>Expand all</button>
                        <span className={styles.divider} />
                        <button className={styles.textBtn} onClick={collapseAll}>Collapse all</button>
                    </div>
                </div>

                {/* Filter bar */}
                <div className={styles.filters}>
                    {labels.map(l => {
                        const cfg = l === ALL ? null : getLabelConfig(l)
                        const count = l === ALL ? chunks.length : chunks.filter(c => c.label === l).length
                        return (
                            <button
                                key={l}
                                className={`${styles.filterBtn} ${filter === l ? styles.filterActive : ''}`}
                                style={filter === l && cfg ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                                onClick={() => setFilter(l)}
                            >
                                {cfg && <span>{cfg.icon}</span>}
                                <span>{l}</span>
                                <span className={styles.filterCount}>{count}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Search */}
                <div className={styles.searchRow}>
                    <SearchIcon />
                    <input
                        className={styles.searchInput}
                        placeholder="Search within sections..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className={styles.clearSearch} onClick={() => setSearch('')}>
                            <CloseIcon />
                        </button>
                    )}
                </div>
            </div>

            {/* Chunk list */}
            <div className={styles.chunkList}>
                {filtered.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No sections match your filters.</p>
                    </div>
                ) : (
                    filtered.map((chunk, i) => {
                        const cfg = getLabelConfig(chunk.label)
                        const isOpen = expanded.has(i)
                        const preview = truncate(chunk.text, 180)
                        const needsExpand = chunk.text.length > 180

                        return (
                            <motion.div
                                key={i}
                                className={styles.chunkCard}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.025, duration: 0.3 }}
                            >
                                {/* Card header */}
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardMeta}>
                                        <span
                                            className={styles.labelBadge}
                                            style={{ background: cfg.bg, color: cfg.color }}
                                        >
                                            <span>{cfg.icon}</span>
                                            <span>{chunk.label}</span>
                                        </span>
                                        {chunk.confidence > 0 && (
                                            <ConfidencePill confidence={chunk.confidence} />
                                        )}
                                        <span className={styles.chunkIndex}>#{i + 1}</span>
                                    </div>
                                    {needsExpand && (
                                        <button
                                            className={styles.expandBtn}
                                            onClick={() => toggleExpand(i)}
                                        >
                                            <span>{isOpen ? 'Show less' : 'Read more'}</span>
                                            <ChevronIcon open={isOpen} />
                                        </button>
                                    )}
                                </div>

                                {/* Card text */}
                                <div className={styles.cardText}>
                                    <AnimatePresence initial={false}>
                                        {isOpen ? (
                                            <motion.p
                                                key="full"
                                                className={styles.textFull}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {chunk.text}
                                            </motion.p>
                                        ) : (
                                            <motion.p
                                                key="preview"
                                                className={styles.textPreview}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {preview}
                                                {needsExpand && <span className={styles.ellipsisCta} onClick={() => toggleExpand(i)}>Read more</span>}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Left accent line */}
                                <div
                                    className={styles.accentLine}
                                    style={{ background: cfg.color }}
                                />
                            </motion.div>
                        )
                    })
                )}
            </div>
        </motion.div>
    )
}

function ConfidencePill({ confidence }) {
    const pct = Math.round(confidence * 100)
    const color = pct >= 80 ? '#2d6a4f' : pct >= 50 ? '#c9963a' : '#9b2335'
    return (
        <span className={styles.confidencePill} style={{ color, borderColor: `${color}33`, background: `${color}0f` }}>
            {pct}% confidence
        </span>
    )
}

function ChevronIcon({ open }) {
    return (
        <svg
            width="12" height="12"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    )
}

function SearchIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}

function CloseIcon() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}
