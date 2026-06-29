import React from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { cleanupSession } from '../../api'
import styles from './ErrorState.module.css'

export default function ErrorState() {
  const { uploadError, resetAll } = useAppStore()

  const handleRetry = async () => {
    await cleanupSession()
    resetAll()
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className={styles.iconWrap}>
        <AlertIcon />
      </div>
      <h2 className={styles.title}>Processing failed</h2>
      <p className={styles.message}>
        {uploadError || 'An unexpected error occurred while processing your document.'}
      </p>
      <div className={styles.tips}>
        <p className={styles.tipsTitle}>Possible fixes:</p>
        <ul>
          <li>Ensure the file is not corrupted or password-protected</li>
          <li>Try a different file format (e.g. PDF instead of image)</li>
          <li>Check that the backend server is running on port 5000</li>
          <li>Large files may take longer — try again</li>
        </ul>
      </div>
      <button className={styles.retryBtn} onClick={handleRetry}>
        Try again with a new document
      </button>
    </motion.div>
  )
}

function AlertIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}
