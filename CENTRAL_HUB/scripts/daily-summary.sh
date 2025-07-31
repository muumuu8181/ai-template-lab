#!/bin/bash
# daily-summary.sh - 日次サマリー生成スクリプト

# 現在の日付
TODAY=$(date +"%Y-%m-%d")
SUMMARY_FILE="$(dirname $0)/../analysis/daily-summary-$TODAY.md"

# analysisディレクトリ作成
mkdir -p "$(dirname $0)/../analysis"

# サマリー開始
echo "# 日次サマリー - $TODAY" > "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "生成時刻: $(date +"%Y-%m-%d %H:%M:%S")" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 各チームの報告を集計
for team in dev-team validation-team management-team; do
    echo "## $team の報告" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
    
    # チームフォルダをスキャン
    team_dir="$(dirname $0)/../incoming/$team"
    
    if [ -d "$team_dir" ]; then
        for member_dir in "$team_dir"/*; do
            if [ -d "$member_dir" ]; then
                member=$(basename "$member_dir")
                echo "### $member" >> "$SUMMARY_FILE"
                
                # 本日の報告数をカウント
                report_count=$(find "$member_dir" -name "*$TODAY*" -type f | wc -l)
                echo "報告数: $report_count 件" >> "$SUMMARY_FILE"
                
                # 最新の報告を表示
                latest_report=$(ls -t "$member_dir"/*$TODAY* 2>/dev/null | head -1)
                if [ -n "$latest_report" ]; then
                    echo "最新報告: $(basename "$latest_report")" >> "$SUMMARY_FILE"
                    
                    # タスク名を抽出
                    task_name=$(grep "タスク名" "$latest_report" | cut -d':' -f2 | sed 's/^ *//g')
                    if [ -n "$task_name" ]; then
                        echo "最新タスク: $task_name" >> "$SUMMARY_FILE"
                    fi
                fi
                echo "" >> "$SUMMARY_FILE"
            fi
        done
    fi
    echo "" >> "$SUMMARY_FILE"
done

# 統計情報
echo "## 統計情報" >> "$SUMMARY_FILE"
total_reports=$(find "$(dirname $0)/../incoming" -name "*$TODAY*" -type f | wc -l)
echo "総報告数: $total_reports 件" >> "$SUMMARY_FILE"

echo "✅ 日次サマリーを生成しました: $SUMMARY_FILE"