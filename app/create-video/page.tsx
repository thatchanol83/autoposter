'use server'

import { createVideoRequest } from '../actions/video-actions'

export default async function CreateVideoPage() {
    return (
        <div className="min-h-screen bg-neutral-900 text-white p-8 font-sans">
            <div className="max-w-2xl mx-auto bg-neutral-800 rounded-xl p-8 border border-neutral-700 shadow-2xl">
                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Create New Video
                </h1>

                <form action={createVideoRequest} className="space-y-6">
                    {/* Keyword */}
                    <div className="space-y-2">
                        <label htmlFor="keyword" className="block text-sm font-medium text-neutral-300">
                            Keyword / Topic
                        </label>
                        <input
                            type="text"
                            id="keyword"
                            name="keyword"
                            required
                            placeholder="e.g., A day in the life of a cat"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Language */}
                        <div className="space-y-2">
                            <label htmlFor="language" className="block text-sm font-medium text-neutral-300">
                                Language
                            </label>
                            <select
                                id="language"
                                name="language"
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Thai">Thai</option>
                                <option value="English">English</option>
                            </select>
                        </div>

                        {/* Style */}
                        <div className="space-y-2">
                            <label htmlFor="style" className="block text-sm font-medium text-neutral-300">
                                Style
                            </label>
                            <select
                                id="style"
                                name="style"
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Pixar-style cartoon">Pixar-style cartoon</option>
                                <option value="Realistic">Realistic</option>
                                <option value="Viral comedy">Viral comedy</option>
                                <option value="Thai countryside">Thai countryside (Isan)</option>
                                <option value="Angry object">Angry object / body part</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Duration */}
                        <div className="space-y-2">
                            <label htmlFor="duration" className="block text-sm font-medium text-neutral-300">
                                Duration
                            </label>
                            <select
                                id="duration"
                                name="duration"
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="10s">10 seconds</option>
                                <option value="15s">15 seconds</option>
                            </select>
                        </div>

                        {/* Aspect Ratio */}
                        <div className="space-y-2">
                            <label htmlFor="aspectRatio" className="block text-sm font-medium text-neutral-300">
                                Aspect Ratio
                            </label>
                            <select
                                id="aspectRatio"
                                name="aspectRatio"
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="9:16">Vertical (9:16)</option>
                                <option value="16:9">Horizontal (16:9)</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Create Video
                        </button>
                    </div>

                    <div className="text-center">
                        <a href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
                            Back to Dashboard
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}
