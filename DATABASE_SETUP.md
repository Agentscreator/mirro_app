# Database Setup Guide

This guide will help you set up the database for the Events App.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL Database** (we're using Neon DB)
3. **Environment Variables** configured in `.env`

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Generate and push database schema
npm run db:setup

# Seed the database with sample data
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```

## Manual Setup (if needed)

### 1. Generate Database Schema
```bash
npm run db:generate
```

### 2. Push Schema to Database
```bash
npm run db:push
```

### 3. Seed Database
```bash
npm run db:seed
```

## Database Schema

The app uses the following tables:

### Users
- `id` (UUID, Primary Key)
- `name` (Text, Not Null)
- `username` (Text, Unique, Not Null)
- `password` (Text, Not Null, Hashed)
- `profilePicture` (Text, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Events
- `id` (UUID, Primary Key)
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `date` (Text, Not Null)
- `time` (Text, Not Null)
- `location` (Text, Not Null)
- `icon` (Text, Optional)
- `gradient` (Text, Optional)
- `createdBy` (UUID, Foreign Key to Users)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Follows
- `followerId` (UUID, Foreign Key to Users)
- `followingId` (UUID, Foreign Key to Users)
- `createdAt` (Timestamp)
- Primary Key: (followerId, followingId)

## Sample Data

The seed script creates:
- 4 sample users (password: `password123`)
- 4 sample events
- Follow relationships between users

## Database Management

### View Database
```bash
npm run db:studio
```

### Reset Database (if needed)
1. Drop all tables in your database
2. Run `npm run db:setup`
3. Run `npm run db:seed`

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` in `.env` file
- Ensure database server is running
- Check network connectivity

### Schema Issues
- Run `npm run db:generate` to regenerate schema
- Run `npm run db:push` to apply changes

### Seed Issues
- Ensure database is empty before seeding
- Check for unique constraint violations