import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { useChat } from '../../hooks/useChat'
import { transliterate } from '../../utils/transliteration'
import LanguageKeypad from './LanguageKeypad'
import styles from './ChatInterface.module.css'

const SUGGESTED_QUESTIONS = [
  'What is the final decision of the court?',
  'Who are the main parties involved?',
  'What are the key legal issues?',
  'What evidence was presented?',
]

export default function ChatInterface() {
  const { chatHistory, chatLoading } = useAppStore()
  const { sendMessage } = useChat()
  const [input, setInput] = useState('')
  const [keypadOpen, setKeypadOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('Hindi')
  const [inputMode, setInputMode] = useState('translit')

  const bottomRef = useRef()
  const textareaRef = useRef()

  const handleKeyPress = (char) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = ta.value
    const before = text.substring(0, start)
    const after = text.substring(end)
    const newVal = before + char + after
    setInput(newVal)
    
    setTimeout(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + char.length
    }, 0)
  }

  const handleBackspace = () => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = ta.value
    if (start === 0 && end === 0) return
    
    let before = ''
    let after = ''
    let newCursor = 0
    
    if (start !== end) {
      before = text.substring(0, start)
      after = text.substring(end)
      newCursor = start
    } else {
      before = text.substring(0, start - 1)
      after = text.substring(start)
      newCursor = start - 1
    }
    
    const newVal = before + after
    setInput(newVal)
    
    setTimeout(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = newCursor
    }, 0)
  }

  const handleClear = () => {
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    
    if (keypadOpen && inputMode === 'translit') {
      const cursorPosition = e.target.selectionStart
      const textBeforeCursor = val.slice(0, cursorPosition)
      const textAfterCursor = val.slice(cursorPosition)
      
      const words = textBeforeCursor.split(/(\s+)/)
      const transliteratedWords = words.map((w, idx) => {
        // Only transliterate if it contains Latin characters and is followed by whitespace (i.e. not the last word)
        if (/[a-zA-Z]/.test(w) && idx < words.length - 1) {
          return transliterate(w, currentLanguage)
        }
        return w
      })
      
      const newTextBeforeCursor = transliteratedWords.join('')
      const newVal = newTextBeforeCursor + textAfterCursor
      setInput(newVal)
      
      setTimeout(() => {
        if (textareaRef.current) {
          const diff = newVal.length - val.length
          textareaRef.current.selectionStart = cursorPosition + diff
          textareaRef.current.selectionEnd = cursorPosition + diff
        }
      }, 0)
    } else {
      setInput(val)
    }
  }

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, chatLoading])

  // Auto resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [input])

  const handleSend = () => {
    let q = input.trim()
    if (!q || chatLoading) return
    
    if (keypadOpen && inputMode === 'translit') {
      // Force translit the entire input one last time
      const words = q.split(/(\s+)/)
      const finalWords = words.map(w => {
        if (/[a-zA-Z]/.test(w)) {
          return transliterate(w, currentLanguage)
        }
        return w
      })
      q = finalWords.join('').trim()
    }
    
    setInput('')
    sendMessage(q)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggest = (q) => {
    if (chatLoading) return
    sendMessage(q)
  }

  const isEmpty = chatHistory.length === 0

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
    >
      {/* Messages area */}
      <div className={styles.messages}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <AiIcon />
            </div>
            <h3 className={styles.emptyTitle}>Ask anything about this document</h3>
            <p className={styles.emptySub}>
              The AI has read and understood your document. Ask about facts, decisions, parties, or any legal detail.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  className={styles.suggestionBtn}
                  onClick={() => handleSuggest(q)}
                >
                  <span>{q}</span>
                  <ArrowIcon />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                className={`${styles.msgRow} ${styles[msg.role]}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
              >
                {msg.role === 'assistant' && (
                  <div className={styles.avatar}>
                    <AiIcon small />
                  </div>
                )}
                <div className={`${styles.bubble} ${msg.error ? styles.errorBubble : ''}`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className={styles.mdP}>{children}</p>,
                        ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
                        li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
                        strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
                        code: ({ inline, children }) =>
                          inline
                            ? <code className={styles.mdCode}>{children}</code>
                            : <pre className={styles.mdPre}><code>{children}</code></pre>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className={styles.userText}>{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Thinking indicator */}
            <AnimatePresence>
              {chatLoading && (
                <motion.div
                  className={`${styles.msgRow} ${styles.assistant}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className={styles.avatar}>
                    <AiIcon small />
                  </div>
                  <div className={`${styles.bubble} ${styles.thinkingBubble}`}>
                    <ThinkingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        <div className={`${styles.inputWrap} ${chatLoading ? styles.inputDisabled : ''}`}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder={keypadOpen && inputMode === 'translit' ? `Type phonetically in ${currentLanguage}...` : "Ask a question about the document..."}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={chatLoading}
            rows={1}
          />
          <button
            type="button"
            className={`${styles.keyboardToggle} ${keypadOpen ? styles.keyboardToggleActive : ''}`}
            onClick={() => setKeypadOpen(!keypadOpen)}
            title="Toggle Regional Language Keyboard"
          >
            <KeyboardIcon />
          </button>
          <button
            className={`${styles.sendBtn} ${(!input.trim() || chatLoading) ? styles.sendDisabled : ''}`}
            onClick={handleSend}
            disabled={!input.trim() || chatLoading}
            title="Send (Enter)"
          >
            {chatLoading ? <SpinIcon /> : <SendIcon />}
          </button>
        </div>
        <p className={styles.hint}>Press Enter to send · Shift+Enter for newline</p>
      </div>

      {keypadOpen && (
        <LanguageKeypad
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          inputMode={inputMode}
          setInputMode={setInputMode}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onClose={() => setKeypadOpen(false)}
        />
      )}
    </motion.div>
  )
}

function ThinkingDots() {
  return (
    <div className={styles.thinkingDots}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className={styles.dot}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

function AiIcon({ small }) {
  const size = small ? 14 : 22
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v18M3 9l9-6 9 6M5 20h14M8 12l-3 6h6l-3-6zM16 12l-3 6h6l-3-6z" />
    </svg>
  )
}

function SendIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
}

function ArrowIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
}

function SpinIcon() {
  return (
    <motion.svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
    >
      <path d="M21 12a9 9 0 1 1-9-9"/>
    </motion.svg>
  )
}

function KeyboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <line x1="6" y1="8" x2="6" y2="8" />
      <line x1="10" y1="8" x2="10" y2="8" />
      <line x1="14" y1="8" x2="14" y2="8" />
      <line x1="18" y1="8" x2="18" y2="8" />
      <line x1="6" y1="12" x2="6" y2="12" />
      <line x1="10" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="14" y2="12" />
      <line x1="18" y1="12" x2="18" y2="12" />
      <line x1="7" y1="16" x2="17" y2="16" />
    </svg>
  )
}
