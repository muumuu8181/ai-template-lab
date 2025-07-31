#!/bin/bash
# pre-commitフック - AIによる誤削除を防ぐ

echo "🔍 コミット前チェックを実行中..."

# 削除されたファイルをチェック
deleted_files=$(git diff --cached --name-status | grep "^D" | cut -f2)

if [ ! -z "$deleted_files" ]; then
    echo "❌ エラー: ファイルの削除が検出されました！"
    echo "削除予定のファイル:"
    echo "$deleted_files" | while read file; do
        echo "  - $file"
    done
    echo ""
    echo "ファイルを削除する場合は、以下を実行してください:"
    echo "1. 削除理由をコミットメッセージに明記"
    echo "2. ユーザーの承認を得る"
    echo ""
    echo "強制的にコミットする場合: git commit --no-verify"
    exit 1
fi

# 大量の変更をチェック
change_count=$(git diff --cached --numstat | wc -l)
if [ $change_count -gt 50 ]; then
    echo "⚠️  警告: 大量の変更（${change_count}ファイル）が検出されました"
    echo "意図的な変更であることを確認してください"
    sleep 3
fi

# 変更レポートを生成
echo "📊 変更統計:"
git diff --cached --stat

echo "✅ チェック完了"