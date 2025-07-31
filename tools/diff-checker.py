#!/usr/bin/env python3
"""
AI作業監視用差分チェックツール
WinMergeの代替として、ファイルの変更を視覚的に確認
"""

import os
import sys
import shutil
import hashlib
import json
from datetime import datetime
from pathlib import Path
import difflib
import filecmp

class DiffChecker:
    def __init__(self, original_dir, modified_dir):
        self.original_dir = Path(original_dir)
        self.modified_dir = Path(modified_dir)
        self.report = {
            "timestamp": datetime.now().isoformat(),
            "added_files": [],
            "deleted_files": [],
            "modified_files": [],
            "unchanged_files": [],
            "suspicious_changes": []
        }
        
    def create_snapshot(self, source_dir, snapshot_name=None):
        """作業前のスナップショットを作成"""
        if snapshot_name is None:
            snapshot_name = f"snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        snapshot_path = Path(source_dir).parent / snapshot_name
        if snapshot_path.exists():
            shutil.rmtree(snapshot_path)
        
        shutil.copytree(source_dir, snapshot_path, ignore=shutil.ignore_patterns('.git', '__pycache__', 'diff_reports', 'snapshots'))
        return snapshot_path
    
    def get_file_hash(self, filepath):
        """ファイルのハッシュ値を計算"""
        with open(filepath, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
    
    def compare_directories(self):
        """ディレクトリ間の差分を検出"""
        # 全ファイルのリストを取得
        original_files = set()
        modified_files = set()
        
        # .gitとレポート関連ディレクトリを除外
        ignore_dirs = {'.git', '__pycache__', 'diff_reports', 'snapshots'}
        
        for root, dirs, files in os.walk(self.original_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if not file.startswith('.'):
                    rel_path = Path(root).relative_to(self.original_dir) / file
                    original_files.add(str(rel_path))
        
        for root, dirs, files in os.walk(self.modified_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if not file.startswith('.'):
                    rel_path = Path(root).relative_to(self.modified_dir) / file
                    modified_files.add(str(rel_path))
        
        # 追加されたファイル
        self.report["added_files"] = list(modified_files - original_files)
        
        # 削除されたファイル
        self.report["deleted_files"] = list(original_files - modified_files)
        
        # 共通ファイルの変更チェック
        common_files = original_files & modified_files
        for file in common_files:
            orig_path = self.original_dir / file
            mod_path = self.modified_dir / file
            
            if self.get_file_hash(orig_path) != self.get_file_hash(mod_path):
                self.report["modified_files"].append(file)
                
                # 保護されたファイルの変更を検出
                protected_files = ['MASTER_RULES.md', 'CLAUDE.md', 'README.md']
                if any(protected in file for protected in protected_files):
                    self.report["suspicious_changes"].append({
                        "file": file,
                        "reason": "保護されたファイルが変更されています"
                    })
            else:
                self.report["unchanged_files"].append(file)
    
    def show_file_diff(self, filepath):
        """特定ファイルの差分を表示"""
        orig_path = self.original_dir / filepath
        mod_path = self.modified_dir / filepath
        
        with open(orig_path, 'r', encoding='utf-8') as f:
            orig_lines = f.readlines()
        
        with open(mod_path, 'r', encoding='utf-8') as f:
            mod_lines = f.readlines()
        
        diff = difflib.unified_diff(
            orig_lines, mod_lines,
            fromfile=f'original/{filepath}',
            tofile=f'modified/{filepath}',
            lineterm=''
        )
        
        return '\n'.join(diff)
    
    def generate_html_report(self):
        """視覚的なHTMLレポートを生成"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>AI作業監視レポート</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .summary {{ background: #f0f0f0; padding: 15px; border-radius: 5px; }}
        .added {{ color: green; }}
        .deleted {{ color: red; }}
        .modified {{ color: orange; }}
        .suspicious {{ background: #ffcccc; padding: 10px; margin: 10px 0; }}
        pre {{ background: #f5f5f5; padding: 10px; overflow-x: auto; }}
        .diff-add {{ background: #ccffcc; }}
        .diff-del {{ background: #ffcccc; }}
    </style>
</head>
<body>
    <h1>AI作業監視レポート</h1>
    <div class="summary">
        <p>実行時刻: {self.report['timestamp']}</p>
        <p>追加ファイル: <span class="added">{len(self.report['added_files'])}</span></p>
        <p>削除ファイル: <span class="deleted">{len(self.report['deleted_files'])}</span></p>
        <p>変更ファイル: <span class="modified">{len(self.report['modified_files'])}</span></p>
        <p>未変更ファイル: {len(self.report['unchanged_files'])}</p>
    </div>
"""
        
        if self.report['suspicious_changes']:
            html += "<h2>⚠️ 要確認事項</h2>"
            for change in self.report['suspicious_changes']:
                html += f'<div class="suspicious">{change["file"]}: {change["reason"]}</div>'
        
        if self.report['added_files']:
            html += "<h2>追加されたファイル</h2><ul>"
            for file in self.report['added_files']:
                html += f'<li class="added">{file}</li>'
            html += "</ul>"
        
        if self.report['deleted_files']:
            html += "<h2>削除されたファイル</h2><ul>"
            for file in self.report['deleted_files']:
                html += f'<li class="deleted">{file}</li>'
            html += "</ul>"
        
        if self.report['modified_files']:
            html += "<h2>変更されたファイル</h2>"
            for file in self.report['modified_files']:
                html += f'<h3>{file}</h3>'
                try:
                    diff = self.show_file_diff(file)
                    html += f'<pre>{diff}</pre>'
                except:
                    html += '<p>差分を表示できません</p>'
        
        html += "</body></html>"
        return html
    
    def save_report(self, output_dir):
        """レポートを保存"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # JSON形式で保存
        with open(output_dir / 'report.json', 'w', encoding='utf-8') as f:
            json.dump(self.report, f, ensure_ascii=False, indent=2)
        
        # HTML形式で保存
        with open(output_dir / 'report.html', 'w', encoding='utf-8') as f:
            f.write(self.generate_html_report())
        
        # 簡易テキストレポート
        with open(output_dir / 'summary.txt', 'w', encoding='utf-8') as f:
            f.write(f"AI作業監視サマリー\n")
            f.write(f"================\n")
            f.write(f"実行時刻: {self.report['timestamp']}\n")
            f.write(f"追加: {len(self.report['added_files'])} files\n")
            f.write(f"削除: {len(self.report['deleted_files'])} files\n")
            f.write(f"変更: {len(self.report['modified_files'])} files\n")
            f.write(f"要確認: {len(self.report['suspicious_changes'])} items\n")

def main():
    if len(sys.argv) < 3:
        print("使用方法: python diff-checker.py [original_dir] [modified_dir]")
        print("または: python diff-checker.py snapshot [source_dir]")
        sys.exit(1)
    
    if sys.argv[1] == "snapshot":
        # スナップショット作成モード
        checker = DiffChecker("", "")
        snapshot_path = checker.create_snapshot(sys.argv[2])
        print(f"スナップショット作成完了: {snapshot_path}")
    else:
        # 比較モード
        checker = DiffChecker(sys.argv[1], sys.argv[2])
        checker.compare_directories()
        
        # レポート保存（絶対パスで指定）
        base_dir = Path(__file__).parent.parent  # ai-template-labディレクトリ
        report_dir = base_dir / "diff_reports" / datetime.now().strftime('%Y%m%d_%H%M%S')
        checker.save_report(report_dir)
        
        print(f"レポート生成完了: {report_dir}")
        print(f"HTMLレポート: {report_dir}/report.html")
        print(f"要確認事項: {len(checker.report['suspicious_changes'])} 件")

if __name__ == "__main__":
    main()