import React, { useEffect } from 'react'
import Header from './components/common/Header'
import GlossaryPanel from './components/common/GlossaryPanel'
import HomePage from './pages/HomePage'
import { cleanupSession } from './api'

export default function App() {
  // Cleanup on page exit
  useEffect(() => {
    const handleUnload = () => cleanupSession()
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  return (
    <>
      <Header />
      <HomePage />
      <GlossaryPanel />
    </>
  )
}
