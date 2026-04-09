#!/bin/sh
export PATH="/usr/local/bin:$PATH"
cd "$(dirname "$0")"
exec npm run dev -- --port 5173
