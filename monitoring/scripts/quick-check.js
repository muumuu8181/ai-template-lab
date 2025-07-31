#!/bin/bash
echo "Quick check running at $(date)"
# ファイル数カウント
find custom/ -type f | wc -l