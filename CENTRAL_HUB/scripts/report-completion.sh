#!/bin/bash
# report-completion.sh - 作業完了自動報告スクリプト

# 使用法: ./report-completion.sh [team-type] [team-number] [task-name] [duration]
# 例: ./report-completion.sh validation 2 "監視システム検証" 55

# パラメータ取得
TEAM_TYPE=$1      # dev/validation/management
TEAM_NUMBER=$2    # 1-4
TASK_NAME=$3      # タスク名
DURATION=$4       # 所要時間（分）

# タイムスタンプ
TIMESTAMP=$(date +"%Y-%m-%d_%H%M")
DATE=$(date +"%Y-%m-%d")
TIME=$(date +"%H:%M")

# チームフォルダの決定
if [ "$TEAM_TYPE" = "dev" ]; then
    TEAM_FOLDER="dev-team/dev-$TEAM_NUMBER"
elif [ "$TEAM_TYPE" = "validation" ]; then
    TEAM_FOLDER="validation-team/val-$TEAM_NUMBER"
elif [ "$TEAM_TYPE" = "management" ]; then
    TEAM_FOLDER="management-team/mgmt-$TEAM_NUMBER"
else
    echo "Error: Invalid team type. Use dev/validation/management"
    exit 1
fi

# 報告ファイルパス
REPORT_DIR="$(dirname $0)/../incoming/$TEAM_FOLDER"
REPORT_FILE="$REPORT_DIR/${TIMESTAMP}_completion.md"

# ディレクトリ作成
mkdir -p "$REPORT_DIR"

# 報告内容を生成
cat > "$REPORT_FILE" << EOF
# 作業報告 - $TIMESTAMP

## 基本情報
- **チーム**: $TEAM_TYPE-team
- **番号**: $TEAM_NUMBER
- **報告タイプ**: 定期 (作業完了)

## 作業内容
- **タスク名**: $TASK_NAME
- **終了時刻**: $DATE $TIME
- **所要時間**: $DURATION 分
- **進捗状況**: 完了

## 結果・成果
- **主な成果**: 
  1. タスクが正常に完了
  2. 期待された結果を出力

## 次のアクション
- [ ] 結果のレビュー待ち
- [ ] フィードバックの反映

---
*自動生成: $(date)*
EOF

echo "✅ 報告を送信しました: $REPORT_FILE"