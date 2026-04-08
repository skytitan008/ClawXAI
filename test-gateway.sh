#!/bin/bash
# Test ClawXAI Gateway

echo "🦎 ClawXAI Gateway Test Script"
echo "================================"
echo ""

# Check if gateway is running
echo "1. Checking running processes..."
ps aux | grep openclaw | grep -v grep
echo ""

# Try to access dashboard
echo "2. Testing Dashboard access..."
echo "   Trying port 19000..."
curl -s -o /dev/null -w "   Port 19000: %{http_code}\n" http://localhost:19000 || echo "   Port 19000: Not responding"

echo "   Trying port 19001..."
curl -s -o /dev/null -w "   Port 19001: %{http_code}\n" http://localhost:19001 || echo "   Port 19001: Not responding"
echo ""

# Check logs
echo "3. Recent logs:"
if [ -f ~/.openclaw/logs/gateway.log ]; then
    tail -20 ~/.openclaw/logs/gateway.log
elif [ -f ~/.openclaw-dev/logs/gateway.log ]; then
    tail -20 ~/.openclaw-dev/logs/gateway.log
else
    echo "   No log files found"
fi
echo ""

# Test API
echo "4. Testing API endpoints..."
curl -s http://localhost:19000/api/stats 2>&1 | head -5 || echo "   Port 19000 API not responding"
curl -s http://localhost:19001/api/stats 2>&1 | head -5 || echo "   Port 19001 API not responding"
echo ""

echo "✅ Test complete!"
