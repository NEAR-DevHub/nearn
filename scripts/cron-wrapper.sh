#!/bin/bash

# Generic cron job wrapper with error checking
# Usage: ./cron-wrapper.sh <URL>
# Exit with error if the HTTP status is not 200

if [ $# -eq 0 ]; then
    echo "Error: No URL provided"
    echo "Usage: $0 <URL>"
    exit 1
fi

URL="$1"

# Make the HTTP request and capture both response and status code
response=$(curl -s -w "\n%{http_code}" -X GET "$URL" -H "Authorization: Bearer $CRON_SECRET")

# Extract the HTTP status code (last line)
http_code=$(echo "$response" | tail -n1)

# Extract the response body (all lines except the last)
body=$(echo "$response" | sed '$d')

# Log the response
echo "URL: $URL"
echo "Response body: $body"
echo "HTTP status code: $http_code"

# Check if status code is 200
if [ "$http_code" -eq 200 ]; then
    echo "Success: Request completed successfully"
    exit 0
else
    echo "Error: Request failed with HTTP status $http_code"
    exit 1
fi