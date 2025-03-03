'use client'

import { config } from '../config'

export default function AnalyticsPage() {
  // Placeholder data - this would come from your API
  const totalCards = 150
  const totalValue = 2500
  const categoryDistribution = config.categories.map(cat => ({
    ...cat,
    count: Math.floor(Math.random() * 50), // Placeholder random count
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Collection Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Cards</h2>
          <p className="text-3xl font-bold text-blue-600">{totalCards}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Value</h2>
          <p className="text-3xl font-bold text-green-600">
            ${totalValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Average Card Value</h2>
          <p className="text-3xl font-bold text-purple-600">
            ${(totalValue / totalCards).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
        <div className="space-y-4">
          {categoryDistribution.map((category) => (
            <div key={category.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">{category.name}</span>
                <span className="text-gray-600">{category.count} cards</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${(category.count / totalCards) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Condition Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Condition Distribution</h2>
        <div className="space-y-4">
          {config.cardConditions.map((condition) => {
            const count = Math.floor(Math.random() * 30) // Placeholder random count
            return (
              <div key={condition.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">{condition.name}</span>
                  <span className="text-gray-600">{count} cards</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{
                      width: `${(count / totalCards) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* Placeholder activity items */}
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Added Charizard Card</p>
              <p className="text-sm text-gray-500">Pokémon - Base Set</p>
            </div>
            <span className="text-sm text-gray-500">2 days ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Updated Card Value</p>
              <p className="text-sm text-gray-500">Black Lotus - MTG</p>
            </div>
            <span className="text-sm text-gray-500">5 days ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Added Basketball Card</p>
              <p className="text-sm text-gray-500">Sports - Basketball</p>
            </div>
            <span className="text-sm text-gray-500">1 week ago</span>
          </div>
        </div>
      </div>
    </div>
  )
} 