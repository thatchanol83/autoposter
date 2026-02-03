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
        // 2. Call Gemini API
        const genAI = new GoogleGenerativeAI(apiKey)

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

        let generatedPrompt = ''

        try {
            // Use gemini-2.0-flash as confirmed by user's key access
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
            const result = await model.generateContent(prompt)
            const response = await result.response
            generatedPrompt = response.text()
        } catch (originalError: any) {
            console.warn('gemini-2.0-flash failed', originalError.message)
            throw originalError
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

        // Debug: Try to list models
        let modelListInfo = 'Could not list models.'
        try {
            if (apiKey) {
                const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
                if (listResponse.ok) {
                    const data = await listResponse.json()
                    const modelNames = data.models?.map((m: any) => m.name) || []
                    modelListInfo = `Available Models for this Key: ${modelNames.join(', ')}`
                } else {
                    const errorText = await listResponse.text()
                    modelListInfo = `List Models Failed: ${listResponse.status} - ${errorText}`
                }
            }
        } catch (listErr) {
            console.error('List models error', listErr)
        }

        // Return specific error messages
        if (e.message.includes('GEMINI_API_KEY') || e.message.includes('API key not valid')) {
            return { success: false, error: 'Server Error: Invalid GEMINI_API_KEY' }
        }
        if (e.message.includes('404') || e.message.includes('Not Found')) {
            return { success: false, error: `Gemini Model Not Found (404). \n\n${modelListInfo} \n\nRaw Error: ${e.message}` }
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

export async function generateVideoAction(requestId: string) {
    const apiKey = process.env.KIE_API_KEY
    if (!apiKey) {
        return { success: false, error: 'KIE_API_KEY is not set' }
    }

    try {
        const videoRequest = await prisma.videoRequest.findUnique({
            where: { id: requestId },
        })

        if (!videoRequest || !videoRequest.generatedPrompt) {
            return { success: false, error: 'Request or prompt not found' }
        }

        // Call Kie.ai API
        // Endpoint: https://api.kie.ai/api/v1/jobs/createTask
        const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'sora-2-text-to-video',
                input: {
                    prompt: videoRequest.generatedPrompt,
                    aspect_ratio: videoRequest.aspectRatio === '9:16' ? 'portrait' : 'landscape',
                    remove_watermark: true,
                    // Default to 10 seconds if not parsable, assuming "10s" format
                    // Note: Kie.ai example uses "n_frames" or "duration" depending on model? 
                    // User example showed "n_frames": "10". Let's assume it determines duration.
                    // n_frames: 10 might mean 10 seconds? Sora usually does 5-10s.
                    // Let's pass "duration" if supported, or map to n_frames based on user input.
                    // For now, trusting the user provided example key "n_frames" with value "10".
                }
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Kie.ai API Error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        // Kie.ai typically returns { code: 0, msg: "success", data: { id: "..." } } based on common patterns
        // But user didn't show response. Assuming standard data structure or just data.id
        // Let's inspect the data structure in logs if needed.
        // Assuming data.data.id or data.id. 
        const soraTaskId = data.data?.id || data.id || data.task_id || data.data?.taskId || data.data?.task_id

        if (!soraTaskId) {
            console.error('Kie.ai Response:', data)
            throw new Error(`No task ID returned from Kie.ai. Response: ${JSON.stringify(data)}`)
        }

        await prisma.videoRequest.update({
            where: { id: requestId },
            data: {
                soraTaskId: soraTaskId,
                videoStatus: 'processing',
            },
        })

        revalidatePath('/dashboard')
        return { success: true }

    } catch (e: any) {
        console.error('Failed to start video generation', e)
        return { success: false, error: e.message || 'Failed to start generation' }
    }
}

export async function checkVideoStatusAction(requestId: string) {
    const apiKey = process.env.KIE_API_KEY
    if (!apiKey) return { success: false, error: 'KIE_API_KEY is not set' }

    try {
        const videoRequest = await prisma.videoRequest.findUnique({
            where: { id: requestId },
        })

        if (!videoRequest || !videoRequest.soraTaskId) {
            return { success: false, error: 'Task ID not found' }
        }

        // Call Kie.ai Status API
        // Endpoint: https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...
        const response = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${videoRequest.soraTaskId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Status check failed: ${response.status}`)
        }

        const data = await response.json()
        const jobData = data.data || {}

        // Status mapping: waiting, queuing, generating, success, fail
        const status = jobData.status
        let newStatus = videoRequest.videoStatus
        let videoUrl = videoRequest.videoUrl

        if (status === 'success') {
            newStatus = 'completed'
            // Check potential result fields
            videoUrl = jobData.resultJson?.url || jobData.result?.video_url || jobData.video_url || jobData.url
        } else if (status === 'fail') {
            newStatus = 'failed'
            console.error('Video Generation Failed:', jobData.failMsg || 'Unknown error')
        }

        if (newStatus !== videoRequest.videoStatus) {
            await prisma.videoRequest.update({
                where: { id: requestId },
                data: {
                    videoStatus: newStatus,
                    videoUrl: videoUrl,
                },
            })
            revalidatePath('/dashboard')
        }

        return {
            success: true,
            status: newStatus,
            videoUrl: videoUrl
        }



    } catch (e: any) {
        console.error('Failed to check status', e)
        return { success: false, error: e.message }
    }
}
