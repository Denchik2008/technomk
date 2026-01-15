#!/bin/bash

# Stop any running node processes
echo -e "\033[1;33mStopping existing Node processes...\033[0m"
pkill -9 node 2>/dev/null
sleep 2

# Clear PORT environment variable that might interfere
echo -e "\033[1;33mClearing PORT environment variable...\033[0m"
unset PORT

echo -e "\033[1;32mStarting development servers...\033[0m"
echo -e "\033[1;36mServer will run on: http://localhost:5000\033[0m"
echo -e "\033[1;36mClient will run on: http://localhost:3000\033[0m"

# Start the servers
npm run dev
