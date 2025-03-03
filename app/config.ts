export const config = {
  app: {
    name: 'Card Collector Hub',
    description: 'Track and manage your trading card collections',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  categories: [
    {
      id: 'sports',
      name: 'Sports Cards',
      subcategories: ['Baseball', 'Basketball', 'Football', 'Soccer', 'Hockey'],
    },
    {
      id: 'pokemon',
      name: 'Pokémon Cards',
      subcategories: ['Base Set', 'Expansions', 'Promos', 'Japanese'],
    },
    {
      id: 'mtg',
      name: 'Magic: The Gathering',
      subcategories: ['Standard', 'Modern', 'Commander', 'Vintage', 'Legacy'],
    },
  ],
  cardConditions: [
    { id: 'mint', name: 'Mint', description: 'Perfect condition' },
    { id: 'near-mint', name: 'Near Mint', description: 'Almost perfect with minimal wear' },
    { id: 'excellent', name: 'Excellent', description: 'Minor wear visible' },
    { id: 'good', name: 'Good', description: 'Shows wear but still presentable' },
    { id: 'fair', name: 'Fair', description: 'Significant wear visible' },
    { id: 'poor', name: 'Poor', description: 'Heavy wear and damage' },
  ],
} 