#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN_DIR="$ROOT_DIR/.local/node/bin"

if [[ ! -x "$NODE_BIN_DIR/node" ]]; then
  echo "Local Node runtime not found at $NODE_BIN_DIR/node"
  echo "Install it first, then rerun this command."
  exit 1
fi

if [[ $# -eq 0 ]]; then
  echo "Usage: scripts/run-with-local-node.sh <command> [args...]"
  exit 1
fi

export PATH="$NODE_BIN_DIR:$PATH"
exec "$@"
