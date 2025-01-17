# Card Collector Hub

A modern web application for managing and tracking your trading card collections, including sports cards and TCGs (Trading Card Games).

## Features

- Track your card collection across multiple categories (Sports, Pokémon, Magic: The Gathering, etc.)
- Manage card conditions, values, and purchase history
- View collection analytics and insights
- Responsive design for mobile and desktop use
- Database-driven card management system

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS (for styling)
- TypeScript

### Backend
- Python
- FastAPI/Django (TBD)
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (3.8 or higher)
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/card-collector-hub.git
cd card-collector-hub
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables (create .env files in both frontend and backend directories)

5. Start the development servers
```bash
# Frontend
npm run dev

# Backend
python main.py
```

## Project Structure

```
card-collector-hub/
├── frontend/                # Next.js frontend application
├── backend/                 # Python backend API
└── database/               # Database migrations and schemas
```

## Development Roadmap

- [x] Initial project setup
- [ ] Basic database schema implementation
- [ ] User authentication
- [ ] Card management CRUD operations
- [ ] Collection analytics
- [ ] Mobile responsive design
- [ ] PWA implementation
- [ ] Future native mobile apps

## Contributing

This project is currently in development. Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
