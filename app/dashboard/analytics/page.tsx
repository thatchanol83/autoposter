export default function AnalyticsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>

            {/* Performance Overview Chart Mockup */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Performance Over Time</h3>
                    <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last year</option>
                    </select>
                </div>
                <div className="h-64 flex items-end space-x-2 justify-between px-4">
                    {[35, 45, 30, 60, 75, 50, 65, 80, 70, 90, 85, 95].map((h, i) => (
                        <div key={i} className="w-full bg-indigo-50 rounded-t-sm relative group">
                            <div
                                style={{ height: `${h}%` }}
                                className="absolute bottom-0 w-full bg-indigo-600 rounded-t-sm transition-all duration-500 hover:bg-indigo-500"
                            ></div>
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                                {h}%
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-500">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Direct', val: 40, color: 'bg-indigo-600' },
                            { label: 'Social', val: 35, color: 'bg-purple-500' },
                            { label: 'Referral', val: 15, color: 'bg-pink-500' },
                            { label: 'Organic', val: 10, color: 'bg-emerald-500' },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                    <span>{item.label}</span>
                                    <span>{item.val}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Demographics */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Demographics</h3>
                    <div className="flex items-center justify-center h-48">
                        <div className="relative w-32 h-32 rounded-full border-8 border-indigo-100 flex items-center justify-center">
                            <span className="text-xl font-bold text-indigo-600">Global</span>
                        </div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Most users are located in North America and Europe.
                    </p>
                </div>
            </div>
        </div>
    )
}
