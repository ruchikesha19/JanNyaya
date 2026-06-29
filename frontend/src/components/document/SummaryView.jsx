import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { translateText } from '../../api'
import { SUPPORTED_LANGUAGES } from '../../utils'
import SpeechButton from '../common/SpeechButton'
import styles from './SummaryView.module.css'

export default function SummaryView() {
    const {
        finalOutput,
        translatedOutput,
        setTranslatedOutput,
        translateTarget,
        setTranslateTarget,
    } = useAppStore()

    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const content = translatedOutput || finalOutput

    const handleTranslate = async (lang) => {
        if (!lang) { setTranslatedOutput(null); setTranslateTarget(''); return }
        setTranslateTarget(lang)
        setLoading(true)
        try {
            const result = await translateText(finalOutput, lang)
            setTranslatedOutput(result)
        } catch {
            // fallback: show original
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <span className={styles.toolbarLabel}>Summary</span>
                    {translatedOutput && (
                        <span className={styles.translatedBadge}>
                            🌐 Translated to {translateTarget}
                        </span>
                    )}
                </div>
                <div className={styles.toolbarRight}>
                    <SpeechButton
                        text={content}
                        language={translatedOutput ? translateTarget : 'English'}
                    />

                    {/* Language selector */}
                    <div className={styles.translateWrap}>
                        <GlobeIcon />
                        <select
                            className={styles.langSelect}
                            value={translateTarget}
                            onChange={e => handleTranslate(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">English (original)</option>
                            {SUPPORTED_LANGUAGES.map(l => (
                                <option key={l.code} value={l.code}>{l.label}</option>
                            ))}
                        </select>
                        {loading && <span className={styles.translateSpinner} />}
                    </div>

                    {/* Copy button */}
                    <button className={styles.iconBtn} onClick={handleCopy} title="Copy to clipboard">
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
            </div>

            {/* Markdown content */}
            <div className={styles.markdownBody}>
                <ReactMarkdown
                    components={{
                        h2: ({ children }) => <h2 className={styles.mdH2}>{children}</h2>,
                        h3: ({ children }) => <h3 className={styles.mdH3}>{children}</h3>,
                        p: ({ children }) => <p className={styles.mdP}>{children}</p>,
                        ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
                        ol: ({ children }) => <ol className={styles.mdOl}>{children}</ol>,
                        li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
                        strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
                        blockquote: ({ children }) => <blockquote className={styles.mdBlockquote}>{children}</blockquote>,
                        hr: () => <hr className={styles.mdHr} />,
                        code: ({ inline, children }) =>
                            inline
                                ? <code className={styles.mdCodeInline}>{children}</code>
                                : <pre className={styles.mdPre}><code>{children}</code></pre>,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </motion.div>
    )
}

function GlobeIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
}

function CopyIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
}

function CheckIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
}
