#!/bin/bash

# LinkedIn Clone Development Startup Script

echo "🚀 Starting LinkedIn Clone Development Environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Create uploads directory if it doesn't exist
mkdir -p backend/uploads

echo "🔧 Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🎨 Starting frontend development server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for both processes
wait