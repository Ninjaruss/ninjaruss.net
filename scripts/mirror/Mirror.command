#!/bin/zsh
# Mirror launcher — starts the ninjaruss.net dev server if needed, opens /status.
cd "/Users/ninjaruss/Documents/GitHub/ninjaruss.net"
if ! curl -s -o /dev/null --max-time 1 http://localhost:4321/status; then
  echo "Starting dev server…"
  nohup npm run dev > /tmp/ninjaruss-dev.log 2>&1 &
  for i in {1..60}; do
    sleep 1
    curl -s -o /dev/null --max-time 1 http://localhost:4321/status && break
  done
fi
open "http://localhost:4321/status"
