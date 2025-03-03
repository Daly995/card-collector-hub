import { config } from '../config'
import Link from 'next/link'

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Collections</h1>
        <Link
          href="/cards/add"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Card
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.categories.map((category) => (
          <div key={category.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
            <div className="space-y-2 mb-4">
              {category.subcategories.map((subcategory) => (
                <div
                  key={subcategory}
                  className="flex items-center justify-between text-gray-600"
                >
                  <span>{subcategory}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                    0 cards
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={`/collections/${category.id}`}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Collection
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
} 