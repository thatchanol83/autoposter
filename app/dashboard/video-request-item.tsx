'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generatePromptAction, generateVideoAction, checkVideoStatusAction, toggleFavoriteAction, regenerateVideoRequestAction } from '../actions/video-actions'

interface VideoRequest {
    id: string
    keyword: string
    language: string
    style: string
    duration: string
    aspectRatio: string
    status: string
    generatedPrompt: string | null
    soraTaskId: string | null
    videoStatus: string | null
    videoUrl: string | null
    createdAt: Date
    isFavorite: boolean
}

export default function VideoRequestItem({ request }: { request: VideoRequest }) {
    const router = useRouter()
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

    // Poll for video status if active
    useEffect(() => {
        let interval: NodeJS.Timeout
        const activeStatuses = ['processing', 'waiting', 'queuing', 'generating']

        if (activeStatuses.includes(request.videoStatus || '')) {
            interval = setInterval(async () => {
                const result = await checkVideoStatusAction(request.id)
                // If status changed, refresh the UI
                if (result.success && result.status && result.status !== request.videoStatus) {
                    router.refresh()
                }
            }, 5000) // Check every 5 seconds
        }
        return () => clearInterval(interval)
    }, [request.videoStatus, request.id, router])

    const handleGeneratePrompt = async () => {
        setIsGeneratingPrompt(true)
        try {
            const result = await generatePromptAction(request.id)
            if (!result.success && result.error) {
                alert(result.error)
            }
        } catch (e: any) {
            console.error(e)
            alert('An unexpected error occurred.')
        } finally {
            setIsGeneratingPrompt(false)
        }
    }

    const handleGenerateVideo = async () => {
        setIsGeneratingVideo(true)
        try {
            const result = await generateVideoAction(request.id)
            if (!result.success && result.error) {
                alert(result.error)
            } else {
                router.refresh()
            }
        } catch (e: any) {
            console.error(e)
            alert('Failed to start video generation.')
        } finally {
            setIsGeneratingVideo(false)
        }
    }

    const handleToggleFavorite = async () => {
        setIsTogglingFavorite(true)
        try {
            await toggleFavoriteAction(request.id)
            router.refresh()
        } catch (e) {
            console.error(e)
        } finally {
            setIsTogglingFavorite(false)
        }
    }

    const handleRegenerate = async () => {
        const newKeyword = window.prompt("Enter new keyword for re-generation:", request.keyword)
        if (!newKeyword || newKeyword === request.keyword) return

        try {
            const formData = new FormData()
            formData.append('sourceRequestId', request.id)
            formData.append('newKeyword', newKeyword)

            const result = await regenerateVideoRequestAction(formData)
            if (result.success) {
                router.refresh()
                // Optionally scroll to top or show success toast
            } else {
                alert(result.error || 'Failed to regenerate')
            }
        } catch (e) {
            console.error(e)
            alert('Error regenerating request')
        }
    }

    return (
        <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                {request.keyword}
                            </h3>
                            <button
                                onClick={handleToggleFavorite}
                                disabled={isTogglingFavorite}
                                className={`focus:outline-none transition-colors ${request.isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
                                title={request.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            {request.style} • {request.language} • {request.duration} • {request.aspectRatio}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(request.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Prompt Status Badge */}
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${request.generatedPrompt ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                            }`}>
                            {request.generatedPrompt ? 'Prompt Ready' : 'No Prompt'}
                        </span>

                        {/* Video Status Badge */}
                        {request.videoStatus && request.videoStatus !== 'idle' && (
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${request.videoStatus === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                request.videoStatus === 'failed' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                    'bg-blue-50 text-blue-700 ring-blue-600/20'
                                }`}>
                                {request.videoStatus === 'processing' ? 'Processing...' :
                                    request.videoStatus === 'waiting' ? 'Waiting...' :
                                        request.videoStatus === 'queuing' ? 'Queuing...' :
                                            request.videoStatus === 'generating' ? 'Generating...' :
                                                request.videoStatus}
                            </span>
                        )}

                        {/* Prompt Button */}
                        <button
                            onClick={handleGeneratePrompt}
                            disabled={isGeneratingPrompt}
                            className={`text-xs px-3 py-1.5 rounded-md text-white font-medium transition-colors ${isGeneratingPrompt
                                ? 'bg-purple-300 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                        >
                            {isGeneratingPrompt ? 'Generating...' : request.generatedPrompt ? 'Regenerate Prompt' : 'Generate Prompt'}
                        </button>

                        {/* Video Button */}
                        {request.generatedPrompt && (request.videoStatus === 'idle' || request.videoStatus === 'failed') && (
                            <button
                                onClick={handleGenerateVideo}
                                disabled={isGeneratingVideo}
                                className={`text-xs px-3 py-1.5 rounded-md text-white font-medium transition-colors ${isGeneratingVideo
                                    ? 'bg-indigo-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                            >
                                {isGeneratingVideo ? 'Starting...' : request.videoStatus === 'failed' ? 'Retry Video' : 'Generate Video'}
                            </button>
                        )}

                        {/* View Video Button */}
                        {request.videoStatus === 'completed' && request.videoUrl && (
                            <a
                                href={request.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                            >
                                View Video
                            </a>
                        )}

                        {/* Re-generate Button */}
                        <button
                            onClick={handleRegenerate}
                            className="text-xs px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
                            title="Create new video with same style but new keyword"
                        >
                            Re-generate
                        </button>

                    </div>
                </div>

                {/* Display Generated Prompt */}
                {request.generatedPrompt && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
                        <p className="font-semibold text-xs text-slate-500 uppercase mb-1">Generated Prompt:</p>
                        <p className="whitespace-pre-wrap">{request.generatedPrompt}</p>
                    </div>
                )}
            </div>
        </li>
    )
}
