import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import styles from './ProcessingLoader.module.css'

const PIPELINE_STEPS = [
    { label: 'Extracting text', desc: 'Reading document content via OCR & text parsing', icon: '📄' },
    { label: 'Cleaning text', desc: 'Normalizing legal language, removing artifacts', icon: '🧹' },
    { label: 'Chunking sections', desc: 'Splitting into logical legal segments', icon: '✂️' },
    { label: 'Classifying', desc: 'Identifying Facts, Arguments, Judgment, Evidence...', icon: '🏷️' },
    { label: 'Simplifying', desc: 'Rewriting complex legal language in plain English', icon: '💡' },
    { label: 'Building summary', desc: 'Synthesizing all sections into master output', icon: '📋' },
    { label: 'Extracting vocabulary', desc: 'Identifying legal terms and their meanings', icon: '📖' },
    { label: 'Indexing for AI', desc: 'Building vector database for intelligent Q&A', icon: '🔍' },
]

const LIVE_INSIGHTS = [
    'Identifying parties and case number...',
    'Breaking document into facts & arguments...',
    'Simplifying complex legal provisions...',
    'Recognizing procedural history...',
    'Mapping court reasoning to key facts...',
    'Flagging critical legal terms...',
    'Structuring judgment timeline...',
    'Preparing your reading summary...',
]

export default function ProcessingLoader() {
    const { processingStage, processingProgress } = useAppStore()
    const [activeStepIdx, setActiveStepIdx] = useState(0)
    const [insightIdx, setInsightIdx] = useState(0)
    const [dots, setDots] = useState('.')

    // Advance step indicator
    useEffect(() => {
        const stepCount = PIPELINE_STEPS.length
        const idx = Math.min(
            Math.floor((processingProgress / 100) * stepCount),
            stepCount - 1
        )
        setActiveStepIdx(idx)
    }, [processingProgress])

    // Rotate live insights
    useEffect(() => {
        const t = setInterval(() => {
            setInsightIdx(i => (i + 1) % LIVE_INSIGHTS.length)
        }, 2400)
        return () => clearInterval(t)
    }, [])

    // Animate dots
    useEffect(() => {
        const t = setInterval(() => {
            setDots(d => d.length >= 3 ? '.' : d + '.')
        }, 500)
        return () => clearInterval(t)
    }, [])

    return (
        <div className={styles.container}>
            {/* Background ambient animation */}
            <div className={styles.ambientBg}>
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={styles.orb}
                        style={{ '--i': i }}
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.15, 0.25, 0.15],
                        }}
                        transition={{
                            duration: 4 + i * 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 1.2,
                        }}
                    />
                ))}
            </div>

            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <motion.div
                        className={styles.spinner}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <ScaleSpinner />
                    </motion.div>
                    <div>
                        <h2 className={styles.title}>Analyzing your document</h2>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={insightIdx}
                                className={styles.liveInsight}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.35 }}
                            >
                                {LIVE_INSIGHTS[insightIdx]}{dots}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Progress bar */}
                <div className={styles.progressWrap}>
                    <div className={styles.progressTrack}>
                        <motion.div
                            className={styles.progressFill}
                            animate={{ width: `${processingProgress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                        <motion.div
                            className={styles.progressGlow}
                            animate={{ left: `${processingProgress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                    <span className={styles.progressPct}>{Math.round(processingProgress)}%</span>
                </div>

                {/* Step pipeline */}
                <div className={styles.pipeline}>
                    {PIPELINE_STEPS.map((step, i) => {
                        const status = i < activeStepIdx ? 'done' : i === activeStepIdx ? 'active' : 'pending'
                        return (
                            <motion.div
                                key={step.label}
                                className={`${styles.step} ${styles[status]}`}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06, duration: 0.35 }}
                            >
                                <div className={styles.stepIconWrap}>
                                    {status === 'done' ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', damping: 15 }}
                                        >
                                            <CheckIcon />
                                        </motion.div>
                                    ) : status === 'active' ? (
                                        <motion.span
                                            className={styles.stepEmoji}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            {step.icon}
                                        </motion.span>
                                    ) : (
                                        <span className={styles.stepDot} />
                                    )}
                                </div>
                                <div className={styles.stepText}>
                                    <span className={styles.stepLabel}>{step.label}</span>
                                    {status === 'active' && (
                                        <motion.span
                                            className={styles.stepDesc}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                        >
                                            {step.desc}
                                        </motion.span>
                                    )}
                                </div>
                                {status === 'active' && (
                                    <motion.div
                                        className={styles.activePulse}
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                {/* Current stage text */}
                <AnimatePresence mode="wait">
                    {processingStage && (
                        <motion.p
                            key={processingStage}
                            className={styles.currentStage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {processingStage}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function CheckIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

function ScaleSpinner() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v18M3 9l9-6 9 6M5 20h14M8 12l-3 6h6l-3-6zM16 12l-3 6h6l-3-6z" />
        </svg>
    )
}
