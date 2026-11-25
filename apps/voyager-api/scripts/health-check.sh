#!/usr/bin/env  bash

url="${1:-http://127.0.0.1:8080/}"

if curl -fsS --max-time 3 -o /dev/null "$url"; then
	echo "healthy"
	exit 0
else
	echo "unhealthy"
	exit 1
fi
