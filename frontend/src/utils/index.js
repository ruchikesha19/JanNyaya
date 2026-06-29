export const LABEL_CONFIG = {
    'Facts': { color: '#1a4a8a', bg: '#e8f0f9', icon: '📋' },
    'Arguments': { color: '#6b4c0a', bg: '#fef3e2', icon: '⚖️' },
    'Evidence': { color: '#2d6a4f', bg: '#e8f5ee', icon: '🔍' },
    'Judgment': { color: '#9b2335', bg: '#fce8ea', icon: '🏛️' },
    'Court Reasoning': { color: '#5c2d8a', bg: '#f0e8f9', icon: '🧠' },
    'Legal Issues': { color: '#7a4a00', bg: '#fff3e0', icon: '📜' },
    'Case Details': { color: '#0d5c63', bg: '#e0f4f6', icon: '📁' },
    'Parties': { color: '#1a5276', bg: '#d6eaf8', icon: '👥' },
    'General': { color: '#4a4845', bg: '#f0ede8', icon: '📄' },
}

export function getLabelConfig(label) {
    return LABEL_CONFIG[label] || LABEL_CONFIG['General']
}

export function truncate(text, maxLen = 200) {
    if (!text || text.length <= maxLen) return text
    return text.slice(0, maxLen).trimEnd() + '…'
}

export const SUPPORTED_LANGUAGES = [
    { code: 'Hindi', label: 'हिन्दी — Hindi' },
    { code: 'Tamil', label: 'தமிழ் — Tamil' },
    { code: 'Telugu', label: 'తెలుగు — Telugu' },
    { code: 'Kannada', label: 'ಕನ್ನಡ — Kannada' },
    { code: 'Malayalam', label: 'മലയാളം — Malayalam' },
]

export const ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
]

export const ACCEPTED_EXTENSIONS = '.pdf,.docx,.png,.jpg,.jpeg,.webp,.txt'

export function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
