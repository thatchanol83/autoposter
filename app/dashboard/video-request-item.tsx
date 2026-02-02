'use client'

import { useState } from 'react'
import { generatePromptAction } from '../actions/video-actions'

interface VideoRequest {
    id: string
    keyword: string
    language: string
    style: string
    duration: string
    aspectRatio: string
    status: string
    generatedPrompt: string | null
    createdAt: Date
}

export default function VideoRequestItem({ request }: { request: VideoRequest }) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGeneratePrompt = async () => {
        setIsGenerating(true)
        try {
            await generatePromptAction(request.id)
        } catch (e) {
            alert('Failed to generate prompt. Please try again.')
        } finally {
            setIsGenerating(false)
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
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${request.status === 'completed'
                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                    : request.status === 'failed'
                                        ? 'bg-red-50 text-red-700 ring-red-600/20'
                                        : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                }`}
                        >
                            {request.status}
                        </span>

                        <button
                            onClick={handleGeneratePrompt}
                            disabled={isGenerating}
                            className={`text-xs px-3 py-1.5 rounded-md text-white font-medium transition-colors ${isGenerating
                                    ? 'bg-purple-300 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                        >
                            {isGenerating ? 'Generating...' : request.generatedPrompt ? 'Regenerate Prompt' : 'Generate Prompt'}
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
