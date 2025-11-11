# LinkedIn Clone - Full Stack Application

A full-stack LinkedIn clone built with React (frontend) and Node.js/Express (backend).

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm
- MongoDB Atlas account (or local MongoDB)

### Environment Setup

1. **Backend Environment Variables**
   Create a `.env` file in the `backend` directory with:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```

2. **Start Development Environment**
   ```bash
   # Make sure you're in the project root directory
   ./start-dev.sh
   ```

   Or manually:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm install
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm install
   npm run dev
   ```

## 📱 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 🔧 Features

### Authentication
- User registration and login
- JWT token-based authentication
- Protected routes

### Posts
- Create posts with text and images
- View all posts in feed
- Like/unlike posts
- Edit and delete own posts
- Image upload support

### User Interface
- Responsive design
- Modern LinkedIn-like UI
- Real-time updates

## 🛠 Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios for API calls
- Vite for development server
- CSS3 for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing

## 📁 Project Structure

```
LinkedIn/
├── backend/
│   ├── config/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── users.js
│   ├── uploads/
│   ├── .env
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   └── vite.config.js
├── start-dev.sh
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Posts
- `GET /api/posts` - Get all posts (protected)
- `POST /api/posts` - Create new post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)
- `POST /api/posts/:id/like` - Like/unlike post (protected)

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure both frontend and backend are running
   - Check that proxy is configured in `vite.config.js`

2. **Authentication Issues**
   - Verify JWT_SECRET is set in backend `.env`
   - Check that token is being sent in Authorization header

3. **Database Connection**
   - Verify MongoDB URI in `.env` file
   - Ensure MongoDB Atlas allows connections from your IP

4. **File Upload Issues**
   - Check that `uploads` directory exists in backend
   - Verify file permissions

### Development Tips

- Use browser dev tools to check network requests
- Check backend console for error logs
- Verify environment variables are loaded correctly

## 📝 License

This project is for educational purposes.