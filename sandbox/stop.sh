#!/bin/bash
#
# Stop the Canton sandbox started by setup-binary.sh
#

if [ -f sandbox/.canton.pid ]; then
  PID=$(cat sandbox/.canton.pid)
  echo "Stopping Canton sandbox (PID: $PID)..."
  kill "$PID" 2>/dev/null
  rm sandbox/.canton.pid
  echo "Stopped."
else
  echo "No Canton sandbox PID file found."
  echo "Trying to kill any process on port 7575..."
  lsof -ti:7575 | xargs kill 2>/dev/null || true
  echo "Done."
fi
