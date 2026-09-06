# eve Chat Template - Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL (via Neon)
- Vercel Account (optional)

### Installation

```bash
# Install dependencies
pnpm install

# Add bcrypt for password hashing
pnpm add @node-rs/bcrypt

# Setup environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

## 📚 Features

### User Management
- User registration with email verification
- Secure password hashing with bcrypt
- User profiles with bio and avatar
- Role-based access (user, moderator, admin)
- User status management (active, inactive, banned)

### Media Support
- Image upload (JPG, PNG, WebP, GIF)
- Video upload (MP4, WebM, MOV)
- File size limits (100MB max)
- Automatic metadata extraction
- Thumbnail generation

### Activity Logging
- User activity tracking
- System event logging
- Activity filtering and search
- Admin audit logs
- Exportable reports

### Admin Dashboard
- User management interface
- Activity log viewer
- System statistics
- Real-time monitoring

## 🔐 Security

### Best Practices
- Passwords hashed with bcrypt (cost: 12)
- Secure session management
- CORS protection
- Rate limiting ready
- Input validation with Zod
- SQL injection prevention via ORM

## 📁 Project Structure

```
.
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── users/          # User management
│   │   ├── media/          # Media upload/management
│   │   └── activities/     # Activity logging
│   ├── admin/              # Admin dashboard pages
│   ├── auth/               # Auth pages (register, login)
│   └── profile/            # User profile page
├── components/
│   ├── auth/               # Auth components
│   ├── profile/            # Profile components
│   ├── media/              # Media components
│   ├── admin/              # Admin components
│   └── layouts/            # Layout wrappers
├── lib/
│   ├── db/                 # Database schema and queries
│   ├── user-utils.ts       # Password and validation utilities
│   └── ...
└── middleware.ts           # Authentication middleware
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile
- `DELETE /api/users/:userId` - Delete user (admin only)

### Media
- `POST /api/media/upload` - Upload file
- `GET /api/media/:mediaId` - Get file info
- `DELETE /api/media/:mediaId` - Delete file
- `GET /api/media` - List user files

### Activities
- `GET /api/activities` - Get activity logs
- `GET /api/activities/user/:userId` - Get user activities
- `GET /api/activities/filter` - Filter activities
- `POST /api/activities/export` - Export logs

## 🧪 Testing

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### Upload Media
```bash
curl -X POST http://localhost:3000/api/media/upload \
  -F "file=@image.jpg" \
  -F "chatId=chat-123" \
  -F "userId=user-456"
```

## 📊 Database Schema

### Tables
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts
- `chat` - Chat conversations
- `chat_event` - Chat messages/events
- `media_file` - Uploaded files
- `activity_log` - User activities
- `audit_log` - Admin actions

## 🎯 Next Steps

1. **Email Verification**
   - Integrate email service (SendGrid, Resend)
   - Implement email templates

2. **File Storage**
   - Configure Vercel Blob or S3
   - Implement CDN caching

3. **Real-time Features**
   - WebSocket integration
   - Live notifications

4. **Advanced Features**
   - Video transcoding
   - Image optimization
   - Machine learning for content moderation

## 📝 Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=your-secret
NEXT_PUBLIC_VERCEL_APP_CLIENT_ID=...
VERCEL_APP_CLIENT_SECRET=...

# Storage
VERCEL_BLOB_READ_WRITE_TOKEN=...

# Email (optional)
SENDGRID_API_KEY=...
RESEND_API_KEY=...
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
pnpm db:migrate
pnpm db:push
```

### Password Validation Fails
Ensure password has:
- Minimum 8 characters
- Uppercase letter
- Lowercase letter
- Number
- Special character

## 📄 License

MIT
