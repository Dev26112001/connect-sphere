# Connect Sphere - Modern Social Connection Platform

A beautiful, modern web application for finding platonic connections and shared activities. Built with React, TypeScript, Express, and PostgreSQL.

## 🌟 Features

### Core Functionality
- **Intentions System**: Post and discover activities people want to do
- **Connection Requests**: Send and receive connection requests with messages
- **Smart Filtering**: Search and filter intentions by category and keywords
- **User Dashboard**: Manage your intentions and connection requests

### Modern UI/UX
- **Animated Components**: Smooth transitions and micro-interactions using Framer Motion
- **Responsive Design**: Works beautifully on all screen sizes
- **Modern Styling**: Clean, professional design with Tailwind CSS
- **Glass Morphism Effects**: Modern visual effects and backdrop blur
- **Gradient Accents**: Beautiful color gradients throughout

### Technical Features
- **TypeScript**: Full type safety across the application
- **React Query**: Efficient data fetching and caching
- **Drizzle ORM**: Modern database toolkit with type safety
- **Authentication**: Secure user authentication system
- **Real-time Updates**: Optimistic updates and real-time UI sync

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd connect-sphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL=postgresql://localhost:5432/connect-sphere
   SESSION_SECRET=your-secret-key-change-this-in-production
   ISSUER_URL=https://replit.com/oidc
   REPL_ID=your-repl-id
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Pages**: Landing, Home, Dashboard, 404
- **Components**: Reusable UI components with shadcn/ui
- **Hooks**: Custom hooks for data fetching and state management
- **Routing**: Wouter for lightweight routing
- **Styling**: Tailwind CSS with custom animations

### Backend (Express + TypeScript)
- **API Routes**: RESTful API with proper validation
- **Authentication**: Passport.js with session management
- **Database**: PostgreSQL with Drizzle ORM
- **Middleware**: Error handling, logging, and security

### Database Schema
- **Users**: User profiles and authentication
- **Intentions**: Activity posts with categories and tags
- **Connections**: Connection requests and status tracking

## 🎨 Design System

### Color Palette
- **Primary**: Warm terracotta (#E67E50)
- **Secondary**: Sage green (#5A7A5C)
- **Background**: Soft cream (#FDFBF8)
- **Foreground**: Soft charcoal (#2C3E50)

### Typography
- **Serif**: Playfair Display (headings)
- **Sans-serif**: Lato (body text)

### Animations
- **Fade In Up**: Smooth entrance animations
- **Hover Lift**: Interactive hover effects
- **Shimmer**: Loading animations
- **Scale**: Button and card interactions

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile**: Optimized for phones with touch-friendly interfaces
- **Tablet**: Adaptive layouts for medium screens
- **Desktop**: Full-featured experience on large screens

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── db.ts            # Database connection
├── shared/               # Shared types and schemas
└── script/              # Build scripts
```

## 🛡️ Security

- **Authentication**: Secure session-based authentication
- **Input Validation**: Zod schema validation
- **SQL Injection**: Protected by Drizzle ORM
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Built-in Express middleware

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Ensure all environment variables are set in production:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure session secret
- `NODE_ENV=production` - Production mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Framer Motion** - Beautiful animations
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Drizzle ORM** - Modern database toolkit
- **React Query** - Data fetching and state management

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ for creating meaningful connections
