import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
    // Upload & processing state
    uploadState: 'idle', // idle | uploading | processing | done | error
    uploadError: null,
    processingStage: null,
    processingProgress: 0,

    // Document data
    rawText: '',
    cleanedText: '',
    chunks: [],
    finalOutput: '',
    vocab: { terms: [] },

    // UI state
    activeTab: 'summary', // summary | chunks | chat
    sidebarOpen: false,
    glossaryOpen: false,

    // Chat
    chatHistory: [],
    chatLoading: false,

    // Translation
    translatedOutput: null,
    translateTarget: '',
    translateLoading: false,

    // Actions
    setUploadState: (state) => set({ uploadState: state }),
    setUploadError: (err) => set({ uploadError: err }),
    setProcessingStage: (stage) => set({ processingStage: stage }),
    setProcessingProgress: (p) => set({ processingProgress: p }),

    setDocumentData: (data) => set({
        rawText: data.raw_text || '',
        cleanedText: data.cleaned_text || '',
        chunks: data.chunks || [],
        finalOutput: data.final_output || '',
        vocab: data.vocab || { terms: [] },
        uploadState: 'done',
        processingStage: null,
        processingProgress: 100,
        translatedOutput: null,
        chatHistory: [],
    }),

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSidebarOpen: (v) => set({ sidebarOpen: v }),
    setGlossaryOpen: (v) => set({ glossaryOpen: v }),

    addChatMessage: (msg) => set(state => ({
        chatHistory: [...state.chatHistory, msg]
    })),
    setChatLoading: (v) => set({ chatLoading: v }),

    setTranslatedOutput: (text) => set({ translatedOutput: text }),
    setTranslateTarget: (lang) => set({ translateTarget: lang }),
    setTranslateLoading: (v) => set({ translateLoading: v }),

    resetAll: () => set({
        uploadState: 'idle',
        uploadError: null,
        processingStage: null,
        processingProgress: 0,
        rawText: '',
        cleanedText: '',
        chunks: [],
        finalOutput: '',
        vocab: { terms: [] },
        activeTab: 'summary',
        chatHistory: [],
        translatedOutput: null,
        translateTarget: '',
    }),
}))
