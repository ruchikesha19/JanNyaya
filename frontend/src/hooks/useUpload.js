import { useCallback } from 'react'
import { uploadDocument, cleanupSession } from '../api'
import { useAppStore } from '../store/useAppStore'

export function useUpload() {
    const {
        setUploadState,
        setUploadError,
        setProcessingStage,
        setProcessingProgress,
        setDocumentData,
        resetAll,
    } = useAppStore()

    const startUpload = useCallback(async (file) => {
        // Cleanup previous session
        await cleanupSession()
        resetAll()
        setUploadState('processing')

        try {
            const data = await uploadDocument(file, ({ label, progress }) => {
                setProcessingStage(label)
                setProcessingProgress(progress)
            })
            setDocumentData(data)
        } catch (err) {
            setUploadState('error')
            const msg = err?.response?.data?.error
                || err?.message
                || 'Failed to process document. Please try again.'
            setUploadError(msg)
        }
    }, [setUploadState, setUploadError, setProcessingStage, setProcessingProgress, setDocumentData, resetAll])

    return { startUpload }
}
