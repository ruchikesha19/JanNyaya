import React, { useCallback, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useUpload } from '../../hooks/useUpload'
import { ACCEPTED_EXTENSIONS, ACCEPTED_TYPES, formatFileSize } from '../../utils'
import styles from './UploadZone.module.css'

export default function UploadZone() {
    const { startUpload } = useUpload()
    const [dragging, setDragging] = useState(false)
    const [selected, setSelected] = useState(null)
    const inputRef = useRef()

    const handleFile = useCallback((file) => {
        if (!file) return
        if (!ACCEPTED_TYPES.includes(file.type) && file.type !== '') {
            // Still allow — backend will handle validation
        }
        setSelected(file)
    }, [])

    const onDrop = useCallback((e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }, [handleFile])

    const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
    const onDragLeave = () => setDragging(false)

    const onFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }

    const onSubmit = () => {
        if (selected) startUpload(selected)
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.heroText}>
                <motion.h1
                    className={styles.headline}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    Understand any<br />
                    <em>legal document</em>
                </motion.h1>
                <motion.p
                    className={styles.sub}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    Upload a court judgment, contract, or legal notice.
                    JanNyaya reads it so you don't have to struggle alone.
                </motion.p>
            </div>

            <motion.div
                className={`${styles.dropZone} ${dragging ? styles.dragging : ''} ${selected ? styles.hasFile : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => !selected && inputRef.current?.click()}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    onChange={onFileChange}
                    className={styles.hiddenInput}
                />

                {!selected ? (
                    <div className={styles.dropContent}>
                        <div className={styles.uploadIcon}>
                            <UploadCloud />
                        </div>
                        <p className={styles.dropTitle}>Drop your document here</p>
                        <p className={styles.dropSub}>
                            or <button className={styles.browseLink} onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>browse files</button>
                        </p>
                        <div className={styles.formats}>
                            {['PDF', 'DOCX', 'PNG', 'JPG', 'TXT'].map(f => (
                                <span key={f} className={styles.formatBadge}>{f}</span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.filePreview}>
                        <div className={styles.fileIcon}>
                            <FileIcon type={selected.name.split('.').pop()} />
                        </div>
                        <div className={styles.fileInfo}>
                            <p className={styles.fileName}>{selected.name}</p>
                            <p className={styles.fileMeta}>{formatFileSize(selected.size)}</p>
                        </div>
                        <button
                            className={styles.removeFile}
                            onClick={(e) => { e.stopPropagation(); setSelected(null) }}
                            title="Remove file"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                )}
            </motion.div>

            {selected && (
                <motion.button
                    className={styles.analyzeBtn}
                    onClick={onSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span>Analyze Document</span>
                    <ArrowRight />
                </motion.button>
            )}

            <motion.div
                className={styles.features}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                {[
                    { icon: '🔒', text: 'Processed locally' },
                    { icon: '⚡', text: 'AI-powered simplification' },
                    { icon: '🌐', text: '5 Indian languages' },
                ].map(f => (
                    <div key={f.text} className={styles.featureItem}>
                        <span>{f.icon}</span>
                        <span>{f.text}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

function FileIcon({ type }) {
    const colors = { pdf: '#e53935', docx: '#1976d2', png: '#43a047', jpg: '#fb8c00', txt: '#757575' }
    const color = colors[type?.toLowerCase()] || '#757575'
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    )
}

function UploadCloud() {
    return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
    )
}

function ArrowRight() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
}

function CloseIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}
