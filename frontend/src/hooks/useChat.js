import { useCallback } from 'react'
import { sendChatMessage } from '../api'
import { useAppStore } from '../store/useAppStore'

export function useChat() {
    const { addChatMessage, setChatLoading } = useAppStore()

    const sendMessage = useCallback(async (text) => {
        if (!text.trim()) return
        addChatMessage({ role: 'user', content: text })
        setChatLoading(true)
        try {
            const answer = await sendChatMessage(text)
            addChatMessage({ role: 'assistant', content: answer })
        } catch (err) {
            addChatMessage({
                role: 'assistant',
                content: 'I encountered an error retrieving the answer. Please try again.',
                error: true,
            })
        } finally {
            setChatLoading(false)
        }
    }, [addChatMessage, setChatLoading])

    return { sendMessage }
}
