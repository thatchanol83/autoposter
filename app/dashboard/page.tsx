
export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 shadow-lg text-white">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, Admin!</h2>
                    <p className="text-indigo-100 max-w-xl">
                        Here's what's happening with your projects today. You have pending notifications and new activity to review.
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform origin-bottom-left"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Users', value: '12,345', trend: '+12%', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Revenue', value: '$45,231', trend: '+5.4%', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Active Sessions', value: '1,203', trend: '-2%', color: 'text-rose-500', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <div className="mt-2 flex items-baseline">
                            <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                            <span className={`ml-2 text-sm font-medium ${stat.color} ${stat.bg} px-2 py-0.5 rounded-full`}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">View all</button>
                </div>
                <ul className="divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                        <li key={i} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-xs text-gray-500">U{i}</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        User {i} made a new purchase
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        2 hours ago
                                    </p>
                                </div>
                                <div>
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        Completed
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
