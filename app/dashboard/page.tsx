import { getVideoRequests } from '../actions/video-actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const videoRequests = await getVideoRequests()

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <Link
                    href="/create-video"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    + Create New Video
                </Link>
            </div>

            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 shadow-lg text-white">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
                    <p className="text-indigo-100 max-w-xl">
                        Manage your video creation requests and check their status here.
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform origin-bottom-left"></div>
            </div>

            {/* Video Requests List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Video Requests</h3>
                </div>
                {videoRequests.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No video requests yet. Click "Create New Video" to get started.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {videoRequests.map((request) => (
                            <li key={request.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {request.keyword}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {request.style} • {new Date(request.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
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
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
