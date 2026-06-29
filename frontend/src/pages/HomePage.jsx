import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import UploadZone from '../components/upload/UploadZone'
import ProcessingLoader from '../components/upload/ProcessingLoader'
import TabBar from '../components/common/TabBar'
import SummaryView from '../components/document/SummaryView'
import ChunkExplorer from '../components/document/ChunkExplorer'
import ChatInterface from '../components/chat/ChatInterface'
import ErrorState from '../components/common/ErrorState'
import styles from './HomePage.module.css'

export default function HomePage() {
    const { uploadState, activeTab } = useAppStore()

    return (
        <main className={styles.main}>
            <AnimatePresence mode="wait">
                {uploadState === 'idle' && (
                    <motion.div
                        key="upload"
                        className={styles.uploadScreen}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                    >
                        <UploadZone />
                    </motion.div>
                )}

                {uploadState === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ProcessingLoader />
                    </motion.div>
                )}

                {uploadState === 'error' && (
                    <motion.div
                        key="error"
                        className={styles.uploadScreen}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ErrorState />
                    </motion.div>
                )}

                {uploadState === 'done' && (
                    <motion.div
                        key="done"
                        className={styles.docScreen}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className={styles.tabBarRow}>
                            <TabBar />
                        </div>

                        <div className={styles.contentArea}>
                            <AnimatePresence mode="wait">
                                {activeTab === 'summary' && (
                                    <motion.div
                                        key="summary"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <SummaryView />
                                    </motion.div>
                                )}
                                {activeTab === 'chunks' && (
                                    <motion.div
                                        key="chunks"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <ChunkExplorer />
                                    </motion.div>
                                )}
                                {activeTab === 'chat' && (
                                    <motion.div
                                        key="chat"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <ChatInterface />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
