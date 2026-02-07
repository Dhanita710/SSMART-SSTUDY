# Study Planner - AI-Powered Student Platform

A comprehensive full-stack web application that provides AI-driven study tools including buddy matching, voice note summarization, ambient study environments, location tracking, and personalized playlist generation.

## 🌟 Features

### 1. **AI Study Buddy Matching**
- Analyzes subjects, strengths, weaknesses, and study patterns
- Uses sentence embeddings for compatibility scoring
- GPT-4 powered match explanations
- Accept/decline match functionality

### 2. **Voice Note Summarizer**
- Upload or record study/lecture audio
- OpenAI Whisper for speech-to-text transcription
- GPT-4 generates summaries and key bullet points
- Searchable personal library

### 3. **Ambient Study Environments**
- Virtual study rooms (Library, Café, Rain, Nature)
- Anonymous ghost avatars showing active users
- Focus timer and streak tracking
- Session duration analytics

### 4. **Study Location Tracker**
- Log study sessions with location, subject, and productivity
- Analytics dashboard with insights
- AI-powered location recommendations by subject
- Track productivity trends

### 5. **AI Study Playlist Generator**
- Generate playlists based on subject, time, and mood
- GPT-4 music recommendations
- Spotify Web API integration
- Save and manage favorites

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt
- **AI Services**: 
  - OpenAI GPT-4 for text generation
  - OpenAI Whisper for speech-to-text
  - Sentence Transformers for embeddings
- **Music**: Spotify Web API (Spotipy)

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors
- **Styling**: Custom CSS with dark mode, glassmorphism
- **Icons**: React Icons

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- OpenAI API Key
- Spotify Developer Account (optional)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/study_planner
SECRET_KEY=your-secret-key-change-this
OPENAI_API_KEY=your-openai-api-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

5. **Create database**
```bash
# PostgreSQL
createdb study_planner
```

6. **Run the backend**
```bash
python -m app.main
# Or with uvicorn
uvicorn app.main:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000
```

4. **Run the frontend**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🚀 Usage

1. **Sign Up**: Create a new account at `/signup`
2. **Login**: Access your account at `/login`
3. **Dashboard**: View your study stats and access features
4. **Explore Features**:
   - Find study buddies
   - Upload voice notes
   - Start ambient study sessions
   - Track study locations
   - Generate AI playlists

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

#### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update study profile

#### Study Buddy
- `POST /api/buddy/find-matches` - Find compatible matches
- `GET /api/buddy/matches` - Get all matches
- `PUT /api/buddy/matches/{id}/accept` - Accept match
- `PUT /api/buddy/matches/{id}/decline` - Decline match

#### Voice Notes
- `POST /api/voice/upload` - Upload audio file
- `GET /api/voice/library` - Get all voice notes
- `GET /api/voice/{id}` - Get specific note

#### Ambient Study
- `POST /api/ambient/start` - Start study session
- `POST /api/ambient/end/{id}` - End session
- `GET /api/ambient/streak` - Get user streak
- `GET /api/ambient/rooms/{type}/users` - Get active users

#### Location Tracker
- `POST /api/location/log` - Log study location
- `GET /api/location/analytics` - Get analytics
- `GET /api/location/recommendations` - Get recommendations

#### Playlists
- `POST /api/playlist/generate` - Generate new playlist
- `GET /api/playlist/my-playlists` - Get user playlists
- `PUT /api/playlist/{id}/favorite` - Toggle favorite

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt
- **JWT Authentication**: Access + Refresh tokens
- **Token Expiration**: 30 minutes (access), 7 days (refresh)
- **CORS Protection**: Configured for frontend origin
- **SQL Injection Prevention**: SQLAlchemy ORM
- **Input Validation**: Pydantic schemas

## 🎨 Design Features

- **Dark Mode**: Built-in with CSS variables
- **Glassmorphism**: Modern frosted glass effects
- **Vibrant Colors**: Curated gradient palette
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Fade-in, slide-in effects
- **Loading States**: Spinners and disabled buttons
- **Error Handling**: User-friendly error messages

## 📁 Project Structure

```
study-planner/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Settings
│   │   ├── database.py          # DB setup
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   ├── routers/             # API routes
│   │   └── utils/               # Utilities
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── contexts/            # React contexts
│   │   ├── services/            # API client
│   │   ├── App.jsx              # Main app
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables
2. Configure PostgreSQL database
3. Deploy with `Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Set `VITE_API_URL` environment variable
3. Deploy `dist/` folder

## 🔧 Environment Variables

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SECRET_KEY` | JWT secret key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `SPOTIFY_CLIENT_ID` | Spotify app client ID | No |
| `SPOTIFY_CLIENT_SECRET` | Spotify app secret | No |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

## 🎯 Future Enhancements

- Real-time WebSocket for ambient study rooms
- Mobile app (React Native)
- Study group chat functionality
- Calendar integration
- Pomodoro timer with notifications
- Study analytics dashboard
- Gamification with achievements
- Social sharing features

---

Built with ❤️ for students who want to study smarter, not harder.
