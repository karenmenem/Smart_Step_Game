#!/bin/bash

# SmartStep - Safe Startup Script for Presentation
# This starts the backend WITHOUT Arduino to prevent crashes

echo "🚀 Starting SmartStep Backend..."
echo ""

# Kill any existing backend process
echo "🔍 Checking for existing backend process..."
lsof -ti:5001 | xargs kill -9 2>/dev/null && echo "✅ Cleared port 5001" || echo "✅ Port 5001 is available"

echo ""
echo "🔧 Starting backend server (Arduino DISABLED)..."
cd "$(dirname "$0")"
npm start

echo ""
echo "✅ Backend is running!"
echo "🌐 Access at: http://localhost:5001"
echo "🎯 Arduino is DISABLED for stability"
echo ""
echo "Press Ctrl+C to stop"
