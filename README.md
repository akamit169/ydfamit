# Youth Dreamers Foundation - Production Ready

A comprehensive scholarship management platform built with React, TypeScript, and Supabase. This application enables students to apply for scholarships, donors to fund education, reviewers to evaluate applications, and administrators to manage the entire ecosystem.

## 🚀 Features

- **Multi-role Authentication**: Students, Donors, Reviewers, and Administrators
- **Scholarship Management**: Create, browse, and apply for scholarships
- **Application Tracking**: Real-time progress tracking for applications
- **Document Management**: Secure file uploads and verification
- **Multi-language Support**: English, Hindi, Bengali, Tamil, Telugu
- **Real-time Notifications**: Instant updates on application status
- **Responsive Design**: Mobile-first design with modern UI/UX
- **Production Ready**: Optimized for deployment with Supabase backend

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Router 6** for navigation
- **React Query** for data fetching
- **Radix UI** for accessible components
- **i18next** for internationalization

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Real-time subscriptions** for live updates
- **File storage** for document management
- **Edge functions** for custom logic

## 🏗 Project Structure

```
├── client/                 # React frontend application
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route components
│   ├── services/         # API and service layers
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── i18n/             # Internationalization
│   └── lib/              # Utility libraries
├── supabase/              # Supabase configuration
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
├── shared/               # Shared types and utilities
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd youth-dreamers-foundation
npm install
```

### 2. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your credentials
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup
The database schema will be automatically created when you connect to Supabase. The migration files are included in the `supabase/migrations/` directory.

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🌐 Production Deployment

### Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build:client`
3. Set publish directory: `dist/spa`
4. Add environment variables in Netlify dashboard

### Deploy to Vercel
1. Connect your repository to Vercel
2. Environment variables will be automatically detected
3. Deploy with zero configuration

### Deploy to Other Platforms
The application builds to static files and can be deployed to any static hosting service:
- GitHub Pages
- AWS S3 + CloudFront
- Google Cloud Storage
- Firebase Hosting

## 🔐 Authentication & Security

- **Supabase Auth**: Built-in authentication with email/password
- **Row Level Security**: Database-level security policies
- **JWT Tokens**: Secure session management
- **Role-based Access**: Different permissions for each user type
- **Data Encryption**: All sensitive data is encrypted

## 👥 User Roles

### Students
- Browse and apply for scholarships
- Track application progress
- Upload required documents
- Receive notifications and updates

### Donors
- Create and fund scholarship programs
- Track impact and student progress
- View contribution reports
- Manage funding preferences

### Reviewers
- Evaluate scholarship applications
- Score and provide feedback
- Collaborate with other reviewers
- Generate evaluation reports

### Administrators
- Manage all scholarship programs
- Oversee user accounts and permissions
- Generate analytics and reports
- Configure system settings

## 🌍 Internationalization

The application supports multiple languages:
- English (en)
- Hindi (hi) 
- Bengali (bn)
- Tamil (ta)
- Telugu (te)

Language files are located in `client/i18n/locales/`.

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run typecheck    # TypeScript type checking
npm run format.fix   # Format code with Prettier
```

### Environment Variables
```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional
VITE_APP_NAME="Youth Dreamers Foundation"
VITE_APP_VERSION="1.0.0"
VITE_ANALYTICS_ID=""
VITE_SENTRY_DSN=""
```

## 📊 Database Schema

### Core Tables
- **users**: User accounts and profiles
- **scholarships**: Scholarship programs
- **applications**: Student applications
- **reviews**: Application evaluations
- **notifications**: System notifications
- **documents**: File uploads
- **announcements**: System announcements
- **contributions**: Donor contributions
- **settings**: Application configuration

### Key Features
- UUID primary keys for security
- Row Level Security (RLS) policies
- Real-time subscriptions
- Automatic timestamps
- JSON fields for flexible data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: tech@youthdreamers.org
- Documentation: [Project Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com) for backend infrastructure
- UI components from [Radix UI](https://radix-ui.com)
- Icons from [Lucide React](https://lucide.dev)
- Animations with [Framer Motion](https://framer.com/motion)

---

**Youth Dreamers Foundation** - Empowering Dreams Through Education 🎓✨