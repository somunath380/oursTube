# oursTube

A free video streaming platform without ads, built with modern web technologies.

## 🚀 Features

- **Video Streaming**: Upload and stream videos with DASH support
- **User Authentication**: Firebase-based authentication system
- **Video Processing**: Automatic video transcoding and thumbnail generation
- **Search & Discovery**: Elasticsearch-powered video search with tags
- **Real-time Notifications**: RabbitMQ-based notification system
- **Responsive UI**: Modern React-based frontend with Bootstrap styling
- **Scalable Architecture**: Microservices-based backend with containerization

## 🏗️ Architecture

### Backend (Server)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: MinIO (S3-compatible object storage)
- **Message Queue**: RabbitMQ for async processing
- **Search Engine**: Elasticsearch for video search
- **Cache**: Redis for session management
- **Video Processing**: FFmpeg for video transcoding
- **Authentication**: Firebase Admin SDK

### Frontend (Client)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Bootstrap 5 with Bootstrap Icons
- **Routing**: React Router DOM
- **Video Player**: Dash.js for adaptive streaming
- **HTTP Client**: Axios for API communication
- **Authentication**: Firebase Client SDK

## 📁 Project Structure

```
oursTube/
├── server/                 # Backend API server
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Request handlers
│   │   ├── db/           # Database utilities
│   │   ├── interfaces/   # TypeScript interfaces
│   │   ├── jobs/         # Background job processors
│   │   ├── middlewares/  # Express middlewares
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic services
│   │   ├── shared/       # Shared utilities
│   │   └── utils/        # Helper functions
│   ├── prisma/           # Database schema and migrations
│   ├── uploads/          # Video uploads directory
│   ├── thumbnails/       # Generated thumbnails
│   └── transcodes/       # Transcoding output
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API service functions
│   │   ├── interfaces/   # TypeScript interfaces
│   │   └── assets/       # Static assets
│   └── public/           # Public assets
├── auths/                # Firebase authentication files
└── docker-compose.yml    # Multi-container setup
```

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **FFmpeg** (for video processing)
- **PostgreSQL** (or use Docker)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd oursTube
```

### 2. Set Up Environment Variables

Create environment files for both server and client:

**Server (.env.dev)**
```env
# Server Configuration
PORT=3000
JWT_SECRET=your-jwt-secret

# Database
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB=onepiece
PG_PORT=5432
PG_HOST=postgres

# MinIO Configuration
MINIO_USER=admin
MINIO_PASSWORD=admin123
MINIO_HOST=minio
MINIO_PORT=9000
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_VIDEO_UPLOAD_BUCKET_NAME=video-uploads
MINIO_MPD_UPLOAD_BUCKET_NAME=mpd-files

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672
QUEUE_NAME=video-processing
DLQ_NAME=video-processing-dlq
NOTIFY_QUEUE_NAME=notifications
DLQ_NOTIFY_NAME=notifications-dlq

# Elasticsearch
ELASTICSEARCH_CLIENT_URL=http://elasticsearch:9200
ELASTICSEARCH_INDEX=videos

# Redis
REDIS_HOST=redis-img
REDIS_PORT=6379
REDIS_PASSWORD=
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Set Up Database

```bash
cd server

# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 5. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# Or start specific services
docker-compose up server client postgres minio rabbitmq elasticsearch redis-img
```

### 6. Manual Development Setup

If you prefer to run services locally:

**Start PostgreSQL:**
```bash
docker run -d \
--name onepiece \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_USER=postgres \
-e POSTGRES_DB=onepiece \
-p 5433:5432 \
postgres:17
```

**Start Server:**
```bash
cd server
npm run build
npm start
```

**Start Client:**
```bash
cd client
npm run dev
```

## 🔧 Available Scripts

### Server
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run task` - Start background job processor
- `npm run migrate` - Deploy database migrations

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| Client | 5173 | React development server |
| Server | 3000 | Express API server |
| PostgreSQL | 6432 | Database |
| MinIO | 9000 | Object storage API |
| MinIO Console | 9001 | Object storage UI |
| RabbitMQ | 5672 | Message queue |
| RabbitMQ Management | 15672 | Message queue UI |
| Elasticsearch | 9200 | Search engine |
| Kibana | 5601 | Elasticsearch UI |
| Redis | 6378 | Cache |

## 📊 Database Schema

The application uses PostgreSQL with the following main table:

**Video Table:**
- `id` - Unique identifier (UUID)
- `title` - Video title
- `description` - Video description (optional)
- `tags` - Array of video tags
- `filepath` - Path to video file
- `thumbnail` - Path to thumbnail (optional)
- `status` - Processing status (inprogress, completed, failed)
- `duration` - Video duration in seconds (optional)
- `resolution` - Video resolution (optional)
- `created_at` - Creation timestamp

## 🔐 Authentication

The application uses Firebase Authentication for user management:
- Email/password authentication
- JWT tokens for API access
- Firebase Admin SDK for server-side verification

## 📹 Video Processing Pipeline

1. **Upload**: Videos are uploaded to MinIO storage
2. **Transcoding**: FFmpeg processes videos into DASH format
3. **Thumbnail Generation**: Automatic thumbnail creation
4. **Metadata Extraction**: Video duration and resolution detection
5. **Search Indexing**: Videos are indexed in Elasticsearch
6. **Notification**: Users are notified when processing is complete

## 🐳 Docker Support

The application is fully containerized with Docker Compose:

- **Multi-stage builds** for optimized images
- **Health checks** for service monitoring
- **Volume persistence** for data storage
- **Network isolation** between services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


## 🆘 Support

For support and questions, please open an issue in the repository.
