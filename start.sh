#!/bin/bash

# MediTrack AI - Monorepo Start Script
# This script builds and runs both backend and frontend

set -e  # Exit on error

echo "🚀 Starting MediTrack AI Application..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -e .
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
# or if using pnpm
# pnpm install
cd ..

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Start backend (FastAPI will be the main service)
echo "🎯 Starting FastAPI backend on port 8000..."
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
