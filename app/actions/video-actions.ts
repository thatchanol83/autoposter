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
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set')
    }

    try {
        // 1. Fetch the request details
        const videoRequest = await prisma.videoRequest.findUnique({
            where: { id: requestId },
        })

        if (!videoRequest) {
            throw new Error('Video request not found')
        }

        // 2. Call Gemini API
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `
            You are an expert AI video generation prompt engineer.
            Create a highly detailed and descriptive prompt for an AI video generator based on the following details:
            
            - Topic/Keyword: ${videoRequest.keyword}
            - Language: ${videoRequest.language}
            - Style: ${videoRequest.style}
            - Duration: ${videoRequest.duration}
            - Aspect Ratio: ${videoRequest.aspectRatio}

            Guidelines:
            - The prompt should describe the visual scene, camera movements, lighting, and mood.
            - It should be suitable for high-quality video generation (like Sora, Kling, Runway).
            - Do NOT mention "AI generated" or "Gemini" in the prompt itself.
            - Provide ONLY the prompt text, no headers or explanations.
            - If the language is Thai, ensure the prompt is descriptive enough, but usually video AI works best with English prompts. If the video content should contain Thai text/culture, specify that, but write the prompt instructions in English.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const generatedPrompt = response.text()

        // 3. Update database
        await prisma.videoRequest.update({
            where: { id: requestId },
            data: { generatedPrompt },
        })

        revalidatePath('/dashboard')
        return { success: true }

    } catch (e: any) {
        console.error('Failed to generate prompt', e)
        // Return the specific error message to help debugging
        // Return the specific error message to help debugging
        if (e.message.includes('GEMINI_API_KEY')) {
            return { success: false, error: 'Server Error: GEMINI_API_KEY is not configured' }
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
