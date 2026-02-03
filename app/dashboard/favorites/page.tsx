import { PrismaClient } from '@prisma/client'
import VideoRequestItem from '../video-request-item'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

async function getFavoriteRequests() {
    try {
        const requests = await prisma.videoRequest.findMany({
            where: {
                isFavorite: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
        return requests
    } catch (e) {
        console.error('Failed to fetch favorite requests', e)
        return []
    }
}

export default async function FavoritesPage() {
    const requests = await getFavoriteRequests()

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Favorite Prompts ⭐
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Your collection of saved prompts and settings. Re-generate new videos from these easily.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                {requests.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No favorites yet. Star your best prompts to see them here!
                    </div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-100">
                        {requests.map((request) => (
                            <VideoRequestItem key={request.id} request={request} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
