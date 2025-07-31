#!/bin/bash
# team-summary.sh - 特定チームのサマリー生成

# 使用法: ./team-summary.sh [team-name]
# 例: ./team-summary.sh validation-team

TEAM_NAME=$1

if [ -z "$TEAM_NAME" ]; then
    echo "Error: チーム名を指定してください"
    echo "Usage: $0 [dev-team|validation-team|management-team]"
    exit 1
fi

# チームディレクトリ
TEAM_DIR="$(dirname $0)/../incoming/$TEAM_NAME"

if [ ! -d "$TEAM_DIR" ]; then
    echo "Error: チームディレクトリが見つかりません: $TEAM_DIR"
    exit 1
fi

echo "# $TEAM_NAME サマリー"
echo "生成時刻: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

# 各メンバーの報告を表示
for member_dir in "$TEAM_DIR"/*; do
    if [ -d "$member_dir" ]; then
        member=$(basename "$member_dir")
        echo "## $member"
        
        # 報告数
        total_reports=$(find "$member_dir" -type f -name "*.md" | wc -l)
        echo "総報告数: $total_reports 件"
        
        # 最新の報告
        latest_reports=$(ls -t "$member_dir"/*.md 2>/dev/null | head -5)
        if [ -n "$latest_reports" ]; then
            echo "
### 最近の報告 (最新5件):"
            for report in $latest_reports; do
                report_name=$(basename "$report")
                # タスク名を抽出
                task_name=$(grep "タスク名" "$report" | cut -d':' -f2 | sed 's/^ *//g')
                if [ -n "$task_name" ]; then
                    echo "- $report_name: $task_name"
                else
                    echo "- $report_name"
                fi
            done
        fi
        echo ""
    fi
done