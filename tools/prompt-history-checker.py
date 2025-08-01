#!/usr/bin/env python3
"""
プロンプト・作業履歴対応チェックツール v1.0
全AIチーム対応：開発チーム、マネジメントチーム（ライター、チェッカー、レビュワー）
"""

import os
import sys
import re
from pathlib import Path
from datetime import datetime
import json

class PromptHistoryChecker:
    def __init__(self, project_dir):
        self.project_dir = Path(project_dir)
        self.report = {
            "timestamp": datetime.now().isoformat(),
            "teams": {},
            "summary": {
                "total_teams": 0,
                "compliant_teams": 0,
                "non_compliant_teams": 0,
                "issues": []
            }
        }
        
    def count_entries_in_file(self, filepath, pattern):
        """ファイル内のエントリ数をカウント"""
        if not filepath.exists():
            return 0
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                matches = re.findall(pattern, content, re.MULTILINE)
                return len(matches)
        except:
            return 0
    
    def check_team_compliance(self, team_path, team_name):
        """チームの対応状況をチェック"""
        work_history_path = team_path / 'work_history.log'
        prompt_path = team_path / 'prompt.txt'
        
        # 作業履歴のエントリ数をカウント（## YYYY-MM-DD HH:MM:SS JST パターン）
        history_pattern = r'^## \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} JST'
        history_count = self.count_entries_in_file(work_history_path, history_pattern)
        
        # プロンプトのエントリ数をカウント（## YYYY-MM-DD HH:MM:SS JST パターン）
        prompt_pattern = r'^## \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} JST'
        prompt_count = self.count_entries_in_file(prompt_path, prompt_pattern)
        
        # 結果記録
        team_info = {
            "work_history_count": history_count,
            "prompt_count": prompt_count,
            "files_exist": {
                "work_history.log": work_history_path.exists(),
                "prompt.txt": prompt_path.exists()
            },
            "compliance": history_count == prompt_count and history_count > 0,
            "issues": []
        }
        
        # 問題点の特定
        if not work_history_path.exists():
            team_info["issues"].append("work_history.log が存在しません")
        if not prompt_path.exists():
            team_info["issues"].append("prompt.txt が存在しません")
        if history_count != prompt_count:
            team_info["issues"].append(f"エントリ数不一致: 作業履歴{history_count}件 vs プロンプト{prompt_count}件")
        if history_count == 0 and prompt_count == 0:
            team_info["issues"].append("両ファイルともエントリがありません")
        
        self.report["teams"][team_name] = team_info
        return team_info["compliance"]
    
    def scan_all_teams(self):
        """全チームをスキャン"""
        teams_found = 0
        compliant_teams = 0
        
        # 開発チーム
        dev_path = self.project_dir / 'development'
        if dev_path.exists():
            teams_found += 1
            if self.check_team_compliance(dev_path, "開発チーム"):
                compliant_teams += 1
        
        # マネジメントチーム
        mgmt_path = self.project_dir / 'management'
        if mgmt_path.exists():
            # ライター
            writer_path = mgmt_path / 'writer'
            if writer_path.exists():
                teams_found += 1
                if self.check_team_compliance(writer_path, "マネジメント・ライター"):
                    compliant_teams += 1
            
            # チェッカー
            checker_path = mgmt_path / 'checker'
            if checker_path.exists():
                teams_found += 1
                if self.check_team_compliance(checker_path, "マネジメント・チェッカー"):
                    compliant_teams += 1
            
            # レビュワー
            reviewer_path = mgmt_path / 'reviewer'
            if reviewer_path.exists():
                teams_found += 1
                if self.check_team_compliance(reviewer_path, "マネジメント・レビュワー"):
                    compliant_teams += 1
        
        # サマリー更新
        self.report["summary"]["total_teams"] = teams_found
        self.report["summary"]["compliant_teams"] = compliant_teams
        self.report["summary"]["non_compliant_teams"] = teams_found - compliant_teams
        
        # 全体の問題点を収集
        for team, info in self.report["teams"].items():
            if info["issues"]:
                self.report["summary"]["issues"].extend([f"{team}: {issue}" for issue in info["issues"]])
    
    def generate_html_report(self):
        """HTMLレポートを生成"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>プロンプト・作業履歴対応チェックレポート</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .summary {{ background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
        .compliant {{ color: green; font-weight: bold; }}
        .non-compliant {{ color: red; font-weight: bold; }}
        .team-section {{ margin: 20px 0; padding: 10px; border-left: 4px solid #ddd; }}
        .team-compliant {{ border-left-color: green; background: #f0fff0; }}
        .team-non-compliant {{ border-left-color: red; background: #fff0f0; }}
        .issues {{ background: #ffeeee; padding: 10px; margin: 10px 0; }}
        table {{ border-collapse: collapse; width: 100%; margin: 10px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <h1>プロンプト・作業履歴対応チェックレポート</h1>
    
    <div class="summary">
        <h2>📊 サマリー</h2>
        <p>実行時刻: {self.report['timestamp']}</p>
        <p>対象チーム: <strong>{self.report['summary']['total_teams']}</strong>チーム</p>
        <p>適合チーム: <span class="compliant">{self.report['summary']['compliant_teams']}</span></p>
        <p>非適合チーム: <span class="non-compliant">{self.report['summary']['non_compliant_teams']}</span></p>
    </div>
"""
        
        if self.report['summary']['issues']:
            html += """
    <div class="issues">
        <h2>⚠️ 検出された問題</h2>
        <ul>
"""
            for issue in self.report['summary']['issues']:
                html += f"<li>{issue}</li>"
            html += """
        </ul>
    </div>
"""
        
        html += """
    <h2>📋 チーム別詳細</h2>
"""
        
        for team_name, team_info in self.report['teams'].items():
            section_class = "team-compliant" if team_info['compliance'] else "team-non-compliant"
            status = "✅ 適合" if team_info['compliance'] else "❌ 非適合"
            
            html += f"""
    <div class="team-section {section_class}">
        <h3>{team_name} - {status}</h3>
        <table>
            <tr>
                <th>項目</th>
                <th>値</th>
            </tr>
            <tr>
                <td>work_history.log エントリ数</td>
                <td>{team_info['work_history_count']}</td>
            </tr>
            <tr>
                <td>prompt.txt エントリ数</td>
                <td>{team_info['prompt_count']}</td>
            </tr>
            <tr>
                <td>work_history.log 存在</td>
                <td>{'✅' if team_info['files_exist']['work_history.log'] else '❌'}</td>
            </tr>
            <tr>
                <td>prompt.txt 存在</td>
                <td>{'✅' if team_info['files_exist']['prompt.txt'] else '❌'}</td>
            </tr>
        </table>
"""
            
            if team_info['issues']:
                html += """
        <div class="issues">
            <strong>問題点:</strong>
            <ul>
"""
                for issue in team_info['issues']:
                    html += f"<li>{issue}</li>"
                html += """
            </ul>
        </div>
"""
            
            html += """
    </div>
"""
        
        html += """
</body>
</html>
"""
        return html
    
    def save_report(self, output_dir):
        """レポートを保存"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # JSON形式で保存
        with open(output_dir / 'prompt-history-report.json', 'w', encoding='utf-8') as f:
            json.dump(self.report, f, ensure_ascii=False, indent=2)
        
        # HTML形式で保存
        with open(output_dir / 'prompt-history-report.html', 'w', encoding='utf-8') as f:
            f.write(self.generate_html_report())
        
        # 簡易テキストレポート
        with open(output_dir / 'prompt-history-summary.txt', 'w', encoding='utf-8') as f:
            f.write(f"プロンプト・作業履歴対応チェック結果\n")
            f.write(f"========================================\n")
            f.write(f"実行時刻: {self.report['timestamp']}\n")
            f.write(f"対象チーム: {self.report['summary']['total_teams']}\n")
            f.write(f"適合チーム: {self.report['summary']['compliant_teams']}\n")
            f.write(f"非適合チーム: {self.report['summary']['non_compliant_teams']}\n")
            if self.report['summary']['issues']:
                f.write(f"\n問題:\n")
                for issue in self.report['summary']['issues']:
                    f.write(f"- {issue}\n")

def main():
    if len(sys.argv) < 2:
        print("使用方法: python prompt-history-checker.py [project_directory]")
        sys.exit(1)
    
    project_dir = sys.argv[1]
    checker = PromptHistoryChecker(project_dir)
    checker.scan_all_teams()
    
    # レポート保存
    date_str = datetime.now().strftime('%Y-%m-%d')
    time_str = datetime.now().strftime('%H%M%S')
    report_dir = Path(project_dir) / 'management' / 'checker' / 'reports' / 'tool-reports' / date_str / f"prompt-check-{time_str}"
    checker.save_report(report_dir)
    
    print(f"プロンプト・作業履歴チェック完了: {report_dir}")
    print(f"HTMLレポート: {report_dir}/prompt-history-report.html")
    print(f"適合: {checker.report['summary']['compliant_teams']}/{checker.report['summary']['total_teams']} チーム")

if __name__ == "__main__":
    main()