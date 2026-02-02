'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export async function createVideoRequest(formData: FormData) {
    const keyword = formData.get('keyword') as string
    const language = formData.get('language') as string
    const style = formData.get('style') as string
    const duration = formData.get('duration') as string
    const aspectRatio = formData.get('aspectRatio') as string

    if (!keyword || !language || !style || !duration || !aspectRatio) {
        throw new Error('Missing required fields')
    }

    try {
        await prisma.videoRequest.create({
            data: {
                keyword,
                language,
                style,
                duration,
                aspectRatio,
                status: 'draft',
            },
        })
    } catch (e) {
        console.error('Failed to create video request', e)
        throw new Error('Failed to create request')
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function getVideoRequests() {
    try {
        const requests = await prisma.videoRequest.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        })
        return requests
    } catch (e) {
        console.error('Failed to fetch video requests', e)
        return []
    }
}

import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generatePromptAction(requestId: string) {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set')
    }

    console.log('Generating prompt for ID:', requestId)
    // Log masked API key for debugging (safe to expose in server logs)
    if (apiKey) {
        console.log('Using Gemini API Key starting with:', apiKey.substring(0, 5) + '...')
    }

    try {
        // 1. Fetch the request details
        const videoRequest = await prisma.videoRequest.findUnique({
            where: { id: requestId },
        })

        if (!videoRequest) {
            return { success: false, error: 'Video request not found' }
        }

        // 2. Call Gemini API
        const genAI = new GoogleGenerativeAI(apiKey)

        let generatedPrompt = ''

        try {
            // Try standard 1.5-flash first
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
            const result = await model.generateContent(prompt)
            const response = await result.response
            generatedPrompt = response.text()
        } catch (originalError: any) {
            console.warn('gemini-1.5-flash failed, trying fallback to gemini-pro', originalError.message)
            // Fallback to older gemini-pro
            if (originalError.message.includes('404') || originalError.message.includes('not found')) {
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
                const result = await model.generateContent(prompt)
                const response = await result.response
                generatedPrompt = response.text()
            } else {
                throw originalError
            }
        }

        // 3. Update database
        await prisma.videoRequest.update({
            where: { id: requestId },
            data: { generatedPrompt },
        })

        revalidatePath('/dashboard')
        return { success: true }

    } catch (e: any) {
        console.error('Failed to generate prompt', e)

        // Return specific error messages
        if (e.message.includes('GEMINI_API_KEY') || e.message.includes('API key not valid')) {
            return { success: false, error: 'Server Error: Invalid GEMINI_API_KEY' }
        }
        if (e.message.includes('404') || e.message.includes('Not Found')) {
            return { success: false, error: 'Gemini Model Not Found (404). Please ensure your API Key is valid and from Google AI Studio.' }
        }
        if (e.code === 'P2025') {
            return { success: false, error: 'Video request not found' }
        }
        if (e.code === 'P2022' || e.message.includes('Column')) {
            return { success: false, error: 'Database Error: Migration not applied (Missing generatedPrompt column)' }
        }
        return { success: false, error: e.message || 'Failed to generate prompt' }
    }
}
