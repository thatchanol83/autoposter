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
        return { error: 'Failed to create request' }
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
