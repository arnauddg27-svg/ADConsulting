#!/bin/bash
export PATH="/Users/arnauddurand/.local/node/bin:$PATH"
cd "$(dirname "$0")"
exec node node_modules/.bin/next dev -H 0.0.0.0 -p 3456
