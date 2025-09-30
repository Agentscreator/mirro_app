# Events App

A modern, full-stack events management application built with Next.js, featuring user authentication, event creation with AI assistance, social following, and mobile-responsive design.

## ✨ Features

### 🔐 Authentication
- User registration and login
- Secure password hashing with bcrypt
- Session validation
- Profile management with avatar support

### 📅 Event Management
- Create events with rich details (title, description, date, time, location)
- AI-powered event generation from prompts
- Camera integration for event media
- Edit and delete your own events
- View all events in a beautiful feed

### 👥 Social Features
- Follow/unfollow other users
- View followers and following lists
- User profiles with event counts
- Social event discovery

### 📱 Mobile-First Design
- Responsive design optimized for mobile
- Camera integration for photos and videos
- Touch-friendly interface
- Progressive Web App capabilities

### 🤖 AI Integration
- Generate event content from simple prompts
- Multiple AI generation methods (generate, paste, import)
- Smart content suggestions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (we use Neon DB)
- Modern web browser with camera support

### Installation

1. **Clone and install**
   ```bash
   git clone <your-repo>
   cd events-app
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and API keys
   ```

3. **Complete setup**
   ```bash
   npm run setup
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

5. **Open app**
   - Visit http://localhost:3000
   - Create account or use sample users (see below)

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:setup     # Setup database schema
npm run db:seed      # Add sample data
npm run db:studio    # View database in browser
npm run db:generate  # Generate migrations
npm run db:push      # Push schema changes

# Utilities
npm run setup        # Complete app setup
npm run status       # Check integration status
npm run lint         # Run ESLint
```

## 📊 Sample Data

After running `npm run db:seed`, you can login with:

| Username | Password | Role |
|----------|----------|------|
| johndoe | password123 | Sample user with events |
| janesmith | password123 | Sample user with events |
| mikejohnson | password123 | Sample user |
| sarahwilson | password123 | Sample user |

## 🏗️ Architecture

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible components

### Backend
- **Next.js API Routes** - Serverless functions
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Primary database
- **bcryptjs** - Password hashing

### Database Schema
```sql
Users (id, name, username, password, profilePicture, timestamps)
Events (id, title, description, date, time, location, icon, gradient, createdBy, timestamps)
Follows (followerId, followingId, createdAt)
```

## 📱 Mobile Features

### Camera Integration
- Photo and video capture
- Gallery upload
- Real-time preview
- Multiple camera modes

### Responsive Design
- Mobile-first approach
- Touch gestures
- Optimized layouts
- Fast loading

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# Authentication (optional)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# AI Features (optional)
OPENAI_API_KEY=sk-...

# File Storage (optional)
R2_ENDPOINT=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

### Database Setup
The app uses PostgreSQL with Drizzle ORM. Schema is automatically generated and can be viewed with `npm run db:studio`.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm run start
```

## 🧪 Testing

### Integration Tests
```bash
# Start dev server first
npm run dev

# Run integration tests
node scripts/test-integration.js
```

### Status Check
```bash
npm run status
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── AuthPage.tsx      # Authentication
│   ├── CreateEventPage.tsx # Event creation
│   ├── ProfilePage.tsx   # User profile
│   └── ...
├── lib/                   # Utilities and config
│   ├── db/               # Database schema and connection
│   └── auth.ts           # Authentication functions
├── scripts/              # Setup and utility scripts
└── public/               # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Database Issues
- Check DATABASE_URL in .env
- Ensure database server is running
- Run `npm run db:setup` to reset schema

### Camera Issues
- Ensure HTTPS in production
- Check browser permissions
- Test on different devices

### Build Issues
- Clear .next folder
- Check Node.js version (18+)
- Verify all dependencies installed

## 📞 Support

- Check the troubleshooting section
- Review error logs in console
- Run `npm run status` for health check
- Open an issue on GitHub

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.