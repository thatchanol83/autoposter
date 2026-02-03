'use client'

import { useState, useEffect } from 'react'
import { generatePromptAction, generateVideoAction, checkVideoStatusAction } from '../actions/video-actions'

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
}

export default function VideoRequestItem({ request }: { request: VideoRequest }) {
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)

    // Poll for video status if processing
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (request.videoStatus === 'processing') {
            interval = setInterval(async () => {
                await checkVideoStatusAction(request.id)
            }, 5000) // Check every 5 seconds
        }
        return () => clearInterval(interval)
    }, [request.videoStatus, request.id])

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
            }
        } catch (e: any) {
            console.error(e)
            alert('Failed to start video generation.')
        } finally {
            setIsGeneratingVideo(false)
        }
    }

    return (
        <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {request.keyword}
                        </p>
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
                                {request.videoStatus === 'processing' ? 'Generating Video...' : request.videoStatus}
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
