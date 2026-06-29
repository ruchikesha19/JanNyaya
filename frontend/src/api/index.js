import axios from 'axios'

const client = axios.create({
    baseURL: 'http://localhost:5000',
    // baseURL: 'http://10.221.228.94:5000',
    timeout: 600000
})

export const uploadDocument = async (file, onStageChange) => {
    const form = new FormData()
    form.append('file', file)


    const stages = [
        { label: 'Extracting text from document...', progress: 10 },
        { label: 'Cleaning and normalizing legal text...', progress: 22 },
        { label: 'Chunking into logical sections...', progress: 38 },
        { label: 'Classifying document structure...', progress: 52 },
        { label: 'Simplifying complex legal language...', progress: 68 },
        { label: 'Building master summary...', progress: 80 },
        { label: 'Extracting legal vocabulary...', progress: 90 },
        { label: 'Indexing for intelligent search...', progress: 96 },
    ]

    let stageIdx = 0
    const interval = setInterval(() => {
        if (stageIdx < stages.length) {
            onStageChange?.(stages[stageIdx])
            stageIdx++
        } else {
            clearInterval(interval)
        }
    }, 2800)

    try {
        const res = await client.post('/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        clearInterval(interval)
        return res.data
    } catch (err) {
        clearInterval(interval)
        throw err
    }

}

export const sendChatMessage = async (question) => {
    const res = await client.post('/chat', { question })
    return res.data.answer
}

export const translateText = async (text, language) => {
    const res = await client.post('/translate', { text, language })
    return res.data.translated_text
}

export const cleanupSession = async () => {
    try {
        await client.post('/cleanup')
    } catch (err) {
        console.error('Cleanup failed:', err)
    }
}