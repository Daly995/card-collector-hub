import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Welcome to Card Collector Hub
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Collection Overview Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">My Collections</h2>
          <p className="text-gray-600 mb-4">
            Manage and track your card collections across different categories.
          </p>
          <Link 
            href="/collections" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View Collections
          </Link>
        </div>

        {/* Add New Card Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Card</h2>
          <p className="text-gray-600 mb-4">
            Add a new card to your collection with details and condition.
          </p>
          <Link 
            href="/cards/add" 
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Card
          </Link>
        </div>

        {/* Analytics Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Collection Analytics</h2>
          <p className="text-gray-600 mb-4">
            View insights and statistics about your card collection.
          </p>
          <Link 
            href="/analytics" 
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  )
} 