#!/usr/bin/env python3
"""
コードベース監視ツール v0.7
指定されたフォルダを定期的に監視し、ファイル構造、関数定義、変更履歴を可視化します。

v0.7 改善点:
- JavaScript/TypeScript解析を大幅に改善
- 関数・クラスの正確な行数計算
- TypeScript特有の構文をサポート
"""

import os
import json
import ast
import time
import hashlib
import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import schedule
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PythonAnalyzer:
    """Pythonファイルの解析クラス"""
    
    @staticmethod
    def extract_functions_and_classes(file_path: str) -> Dict[str, Any]:
        """Pythonファイルから関数とクラス定義を抽出"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            tree = ast.parse(content)
            functions = []
            classes = []
            
            for node in tree.body:  # トップレベルのみを解析
                if isinstance(node, ast.FunctionDef):
                    functions.append({
                        'name': node.name,
                        'line_start': node.lineno,
                        'line_end': node.end_lineno or node.lineno,
                        'args': [arg.arg for arg in node.args.args],
                        'docstring': ast.get_docstring(node)
                    })
                elif isinstance(node, ast.ClassDef):
                    class_methods = []
                    for item in node.body:
                        if isinstance(item, ast.FunctionDef):
                            class_methods.append({
                                'name': item.name,
                                'line_start': item.lineno,
                                'line_end': item.end_lineno or item.lineno,
                                'args': [arg.arg for arg in item.args.args]
                            })
                    
                    classes.append({
                        'name': node.name,
                        'line_start': node.lineno,
                        'line_end': node.end_lineno or node.lineno,
                        'methods': class_methods,
                        'docstring': ast.get_docstring(node)
                    })
            
            return {
                'functions': functions,
                'classes': classes,
                'total_lines': len(content.splitlines())
            }
        except Exception as e:
            logger.warning(f"Python解析エラー {file_path}: {e}")
            return {'functions': [], 'classes': [], 'total_lines': 0}

class ImprovedJSAnalyzer:
    """JavaScript/TypeScriptファイルの改善された解析クラス"""
    
    @staticmethod
    def find_matching_brace(lines: List[str], start_line: int, start_pos: int) -> int:
        """対応する閉じ括弧の行を見つける"""
        brace_count = 1
        
        for line_idx in range(start_line, len(lines)):
            line = lines[line_idx]
            
            # 開始行の場合は開始位置以降から検索
            start_from = start_pos + 1 if line_idx == start_line else 0
            
            in_string = False
            in_comment = False
            escape_next = False
            i = start_from
            
            while i < len(line):
                char = line[i]
                
                # エスケープシーケンス処理
                if escape_next:
                    escape_next = False
                    i += 1
                    continue
                
                if char == '\\':
                    escape_next = True
                    i += 1
                    continue
                
                # コメント処理
                if not in_string:
                    if i < len(line) - 1 and line[i:i+2] == '//':
                        break
                    if i < len(line) - 1 and line[i:i+2] == '/*':
                        in_comment = True
                        i += 2
                        continue
                
                if in_comment:
                    if i < len(line) - 1 and line[i:i+2] == '*/':
                        in_comment = False
                        i += 2
                        continue
                    i += 1
                    continue
                
                # 文字列処理
                if char in ['"', "'", '`']:
                    in_string = not in_string
                elif not in_string:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            return line_idx + 1  # 1-indexed
                
                i += 1
        
        return start_line + 1  # 見つからない場合は開始行を返す
    
    @staticmethod
    def find_function_end(lines: List[str], start_line: int) -> int:
        """関数定義の終了行を見つける（矢印関数対応）"""
        line = lines[start_line - 1].strip()
        
        # 矢印関数の場合
        if '=>' in line:
            if '{' in line:
                # ブロック形式の矢印関数
                brace_pos = line.find('{')
                return ImprovedJSAnalyzer.find_matching_brace(lines, start_line - 1, brace_pos)
            else:
                # 単行の矢印関数
                if line.endswith(';') or line.endswith(','):
                    return start_line
                # 次の行まで確認
                for i in range(start_line, min(start_line + 3, len(lines))):
                    if lines[i].strip().endswith(';') or lines[i].strip().endswith(','):
                        return i + 1
                return start_line
        
        # 通常の関数の場合
        brace_pos = line.find('{')
        if brace_pos != -1:
            return ImprovedJSAnalyzer.find_matching_brace(lines, start_line - 1, brace_pos)
        
        # 括弧が見つからない場合、次の行を探す
        for i in range(start_line, min(start_line + 5, len(lines))):
            if '{' in lines[i]:
                brace_pos = lines[i].find('{')
                return ImprovedJSAnalyzer.find_matching_brace(lines, i, brace_pos)
        
        return start_line
    
    @staticmethod
    def extract_functions_and_classes(file_path: str) -> Dict[str, Any]:
        """JS/TSファイルから関数とクラス定義を抽出（改善版）"""
        import re
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            lines = content.splitlines()
            
            # 改善された関数パターン
            function_patterns = [
                # 通常の関数宣言
                (r'^\s*function\s+(\w+)\s*\(([^)]*)\)', 'function'),
                # const/let/var での関数定義
                (r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*function\s*\(([^)]*)\)', 'function'),
                # const/let/var での矢印関数
                (r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>', 'arrow_function'),
                (r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*([^=]*?)\s*=>', 'arrow_function'),
                # オブジェクトメソッド
                (r'^\s*(\w+)\s*:\s*function\s*\(([^)]*)\)', 'method'),
                (r'^\s*(\w+)\s*\(([^)]*)\)\s*\{', 'method'),
                # 非同期関数
                (r'^\s*async\s+function\s+(\w+)\s*\(([^)]*)\)', 'async_function'),
                (r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*async\s*\(([^)]*)\)\s*=>', 'async_arrow'),
                # エクスポート関数
                (r'^\s*export\s+function\s+(\w+)\s*\(([^)]*)\)', 'export_function'),
                (r'^\s*export\s+const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>', 'export_arrow'),
            ]
            
            # クラスとTypeScriptパターン
            class_patterns = [
                (r'^\s*class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{', 'class'),
                (r'^\s*export\s+class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{', 'export_class'),
                (r'^\s*interface\s+(\w+)', 'interface'),
                (r'^\s*export\s+interface\s+(\w+)', 'export_interface'),
                (r'^\s*type\s+(\w+)', 'type'),
                (r'^\s*export\s+type\s+(\w+)', 'export_type'),
            ]
            
            functions = []
            classes = []
            
            for i, line in enumerate(lines, 1):
                # 関数検出
                for pattern, func_type in function_patterns:
                    match = re.search(pattern, line)
                    if match:
                        func_name = match.group(1)
                        args = match.group(2) if len(match.groups()) > 1 else ''
                        
                        # 引数をパース
                        arg_list = []
                        if args.strip():
                            # 簡易的な引数解析（複雑な型は除外）
                            for arg in args.split(','):
                                arg_clean = arg.strip().split(':')[0].strip()
                                if arg_clean and not arg_clean.startswith('{'):
                                    arg_list.append(arg_clean)
                        
                        end_line = ImprovedJSAnalyzer.find_function_end(lines, i)
                        
                        functions.append({
                            'name': func_name,
                            'line_start': i,
                            'line_end': end_line,
                            'args': arg_list,
                            'type': func_type
                        })
                        break
                
                # クラス・インターフェース検出
                for pattern, class_type in class_patterns:
                    match = re.search(pattern, line)
                    if match:
                        class_name = match.group(1)
                        
                        if class_type in ['interface', 'export_interface', 'type', 'export_type']:
                            # インターフェース・型の終了は次の} or セミコロンまで
                            end_line = i
                            for j in range(i, min(i + 50, len(lines))):
                                if '}' in lines[j] or lines[j].strip().endswith(';'):
                                    end_line = j + 1
                                    break
                        else:
                            # クラスの場合
                            brace_pos = line.find('{')
                            if brace_pos != -1:
                                end_line = ImprovedJSAnalyzer.find_matching_brace(lines, i - 1, brace_pos)
                            else:
                                end_line = i
                        
                        # クラス内のメソッドを検索（クラスの場合のみ）
                        methods = []
                        if class_type in ['class', 'export_class']:
                            for method_line in range(i, min(end_line, len(lines))):
                                method_patterns = [
                                    r'^\s*(\w+)\s*\(([^)]*)\)\s*\{',
                                    r'^\s*async\s+(\w+)\s*\(([^)]*)\)\s*\{',
                                    r'^\s*static\s+(\w+)\s*\(([^)]*)\)\s*\{',
                                    r'^\s*private\s+(\w+)\s*\(([^)]*)\)\s*\{',
                                    r'^\s*public\s+(\w+)\s*\(([^)]*)\)\s*\{',
                                    r'^\s*protected\s+(\w+)\s*\(([^)]*)\)\s*\{',
                                ]
                                
                                method_line_content = lines[method_line]
                                for method_pattern in method_patterns:
                                    method_match = re.search(method_pattern, method_line_content)
                                    if method_match:
                                        method_name = method_match.group(1)
                                        method_args = method_match.group(2) if len(method_match.groups()) > 1 else ''
                                        
                                        # メソッドの引数解析
                                        method_arg_list = []
                                        if method_args.strip():
                                            for arg in method_args.split(','):
                                                arg_clean = arg.strip().split(':')[0].strip()
                                                if arg_clean and not arg_clean.startswith('{'):
                                                    method_arg_list.append(arg_clean)
                                        
                                        method_end = ImprovedJSAnalyzer.find_function_end(lines, method_line + 1)
                                        
                                        methods.append({
                                            'name': method_name,
                                            'line_start': method_line + 1,
                                            'line_end': method_end,
                                            'args': method_arg_list
                                        })
                                        break
                        
                        classes.append({
                            'name': class_name,
                            'line_start': i,
                            'line_end': end_line,
                            'methods': methods,
                            'type': class_type
                        })
                        break
            
            return {
                'functions': functions,
                'classes': classes,
                'total_lines': len(lines)
            }
        except Exception as e:
            logger.warning(f"JS/TS解析エラー {file_path}: {e}")
            return {'functions': [], 'classes': [], 'total_lines': 0}

class CodeMonitor:
    """コードベース監視メインクラス"""
    
    def __init__(self, target_folder: str, output_dir: str = "monitoring_output"):
        self.target_folder = Path(target_folder)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.python_analyzer = PythonAnalyzer()
        self.js_analyzer = ImprovedJSAnalyzer()
        
        self.history_file = self.output_dir / "history.json"
        self.history = self._load_history()
    
    def _format_file_size(self, size_bytes: int) -> str:
        """ファイルサイズを人間が読みやすい形式に変換"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024**2:
            return f"{size_bytes/1024:.1f} KB"
        elif size_bytes < 1024**3:
            return f"{size_bytes/(1024**2):.1f} MB"
        else:
            return f"{size_bytes/(1024**3):.1f} GB"
    
    def _load_history(self) -> List[Dict]:
        """履歴データを読み込み"""
        if self.history_file.exists():
            try:
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"履歴読み込みエラー: {e}")
        return []
    
    def _save_history(self):
        """履歴データを保存"""
        with open(self.history_file, 'w', encoding='utf-8') as f:
            json.dump(self.history, f, ensure_ascii=False, indent=2)
    
    def _get_file_hash(self, file_path: Path) -> str:
        """ファイルのハッシュ値を計算"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return ""
    
    def _analyze_file(self, file_path: Path) -> Dict[str, Any]:
        """ファイルを解析"""
        suffix = file_path.suffix.lower()
        
        if suffix == '.py':
            analysis = self.python_analyzer.extract_functions_and_classes(str(file_path))
        elif suffix in ['.js', '.ts', '.jsx', '.tsx']:
            analysis = self.js_analyzer.extract_functions_and_classes(str(file_path))
        else:
            # その他のファイルは行数のみ
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = len(f.readlines())
                analysis = {'functions': [], 'classes': [], 'total_lines': lines}
            except:
                analysis = {'functions': [], 'classes': [], 'total_lines': 0}
        
        return {
            'file_path': str(file_path.relative_to(self.target_folder)),
            'file_name': file_path.name,
            'file_size': file_path.stat().st_size if file_path.exists() else 0,
            'modified_time': file_path.stat().st_mtime if file_path.exists() else 0,
            'file_hash': self._get_file_hash(file_path),
            'analysis': analysis
        }
    
    def scan_folder(self) -> Dict[str, Any]:
        """フォルダをスキャンして現在の状態を取得"""
        current_scan = {
            'timestamp': datetime.datetime.now().isoformat(),
            'target_folder': str(self.target_folder),
            'files': [],
            'folders': [],
            'summary': {
                'total_files': 0,
                'total_folders': 0,
                'total_lines': 0,
                'python_files': 0,
                'js_files': 0,
                'other_files': 0
            }
        }
        
        # ファイルとフォルダを走査
        for root, dirs, files in os.walk(self.target_folder):
            root_path = Path(root)
            
            # フォルダ情報を記録
            for dir_name in dirs:
                dir_path = root_path / dir_name
                current_scan['folders'].append({
                    'folder_path': str(dir_path.relative_to(self.target_folder)),
                    'folder_name': dir_name
                })
            
            # ファイル情報を記録
            for file_name in files:
                file_path = root_path / file_name
                file_info = self._analyze_file(file_path)
                current_scan['files'].append(file_info)
                
                # サマリー更新
                current_scan['summary']['total_lines'] += file_info['analysis']['total_lines']
                if file_path.suffix.lower() == '.py':
                    current_scan['summary']['python_files'] += 1
                elif file_path.suffix.lower() in ['.js', '.ts', '.jsx', '.tsx']:
                    current_scan['summary']['js_files'] += 1
                else:
                    current_scan['summary']['other_files'] += 1
        
        current_scan['summary']['total_files'] = len(current_scan['files'])
        current_scan['summary']['total_folders'] = len(current_scan['folders'])
        
        return current_scan
    
    def _get_function_signature(self, func_or_class: Dict) -> str:
        """関数・クラスのシグネチャを生成（変更検出用）"""
        if 'methods' in func_or_class:  # クラスの場合
            methods_sig = '|'.join([f"{m['name']}:{m.get('line_end', m['line_start']) - m['line_start'] + 1}" 
                                   for m in func_or_class.get('methods', [])])
            return f"class:{func_or_class['name']}:{func_or_class.get('line_end', func_or_class['line_start']) - func_or_class['line_start'] + 1}:{methods_sig}"
        else:  # 関数の場合
            return f"func:{func_or_class['name']}:{func_or_class.get('line_end', func_or_class['line_start']) - func_or_class['line_start'] + 1}"
    
    def _detect_function_changes(self, current_file: Dict, previous_file: Dict) -> Dict[str, Any]:
        """関数・クラスレベルの変更を検出"""
        current_analysis = current_file['analysis']
        previous_analysis = previous_file['analysis']
        
        # 現在と前回の関数・クラスシグネチャを作成
        current_sigs = set()
        previous_sigs = set()
        
        for func in current_analysis['functions']:
            current_sigs.add(self._get_function_signature(func))
        for cls in current_analysis['classes']:
            current_sigs.add(self._get_function_signature(cls))
            
        for func in previous_analysis['functions']:
            previous_sigs.add(self._get_function_signature(func))
        for cls in previous_analysis['classes']:
            previous_sigs.add(self._get_function_signature(cls))
        
        # 変更を検出
        added_functions = current_sigs - previous_sigs
        removed_functions = previous_sigs - current_sigs
        unchanged_functions = current_sigs & previous_sigs
        
        return {
            'has_function_changes': bool(added_functions or removed_functions),
            'added_functions': list(added_functions),
            'removed_functions': list(removed_functions),
            'unchanged_functions': list(unchanged_functions)
        }

    def detect_changes(self, current_scan: Dict[str, Any]) -> Dict[str, Any]:
        """前回からの変更を検出（関数レベル含む）"""
        if not self.history:
            return {
                'has_changes': True,
                'new_files': [f['file_path'] for f in current_scan['files']],
                'deleted_files': [],
                'modified_files': [],
                'function_changed_files': [],
                'unchanged_files': []
            }
        
        previous_scan = self.history[-1]
        previous_files = {f['file_path']: f for f in previous_scan['files']}
        current_files = {f['file_path']: f for f in current_scan['files']}
        
        new_files = []
        deleted_files = []
        modified_files = []
        function_changed_files = []
        unchanged_files = []
        
        # 新規ファイルと変更ファイルを検出
        for file_path, current_file in current_files.items():
            if file_path not in previous_files:
                new_files.append(file_path)
            else:
                previous_file = previous_files[file_path]
                
                # ファイルハッシュ変更チェック
                if current_file['file_hash'] != previous_file['file_hash']:
                    modified_files.append({
                        'file_path': file_path,
                        'previous_lines': previous_file['analysis']['total_lines'],
                        'current_lines': current_file['analysis']['total_lines'],
                        'line_diff': current_file['analysis']['total_lines'] - previous_file['analysis']['total_lines']
                    })
                else:
                    # ファイル内容は同じだが、関数レベルの変更をチェック
                    func_changes = self._detect_function_changes(current_file, previous_file)
                    if func_changes['has_function_changes']:
                        function_changed_files.append({
                            'file_path': file_path,
                            'function_changes': func_changes
                        })
                    else:
                        unchanged_files.append(file_path)
        
        # 削除されたファイルを検出
        for file_path in previous_files:
            if file_path not in current_files:
                deleted_files.append(file_path)
        
        return {
            'has_changes': bool(new_files or deleted_files or modified_files or function_changed_files),
            'new_files': new_files,
            'deleted_files': deleted_files,
            'modified_files': modified_files,
            'function_changed_files': function_changed_files,
            'unchanged_files': unchanged_files
        }
    
    def generate_html_report(self, current_scan: Dict[str, Any], changes: Dict[str, Any]):
        """HTMLレポートを生成"""
        html_content = f"""
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>コードベース監視レポート v0.7</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 15px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 15px;
        }}
        .header-left {{
            display: flex;
            align-items: center;
            gap: 20px;
        }}
        .header-right {{
            display: flex;
            align-items: center;
            gap: 15px;
        }}
        .refresh-btn {{
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }}
        .refresh-btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }}
        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }}
        .summary-card {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }}
        .summary-card h3 {{
            margin: 0 0 5px 0;
            font-size: 1.8em;
        }}
        .summary-card p {{
            margin: 0;
            font-size: 0.9em;
        }}
        .changes {{
            margin-bottom: 20px;
        }}
        .changes h2 {{
            margin: 0 0 10px 0;
            font-size: 1.3em;
            display: inline-block;
        }}
        .changes-inline {{
            display: inline-block;
            margin-left: 20px;
            font-size: 0.95em;
            color: #666;
        }}
        .change-summary {{
            background-color: #f8f9fa;
            padding: 10px 15px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
            font-size: 0.9em;
        }}
        .file-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 0.9em;
        }}
        .file-table th, .file-table td {{
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        .file-table th {{
            background-color: #3498db;
            color: white;
            font-size: 0.9em;
        }}
        .file-table tr:hover {{
            background-color: #f5f5f5;
        }}
        .details-cell {{
            font-size: 0.8em;
            color: #555;
            max-width: 300px;
            word-wrap: break-word;
        }}
        .folder-structure {{
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #28a745;
        }}
        .folder-list {{
            list-style: none;
            padding-left: 0;
            margin: 0;
        }}
        .folder-list li {{
            margin: 8px 0;
            position: relative;
            padding-left: 25px;
        }}
        .folder-list li::before {{
            content: "📁";
            position: absolute;
            left: 0;
            top: 0;
        }}
        .folder-list li.file::before {{
            content: "📄";
        }}
        .folder-list li.py-file::before {{
            content: "🐍";
        }}
        .folder-list li.js-file::before {{
            content: "💛";
        }}
        .folder-list li.ts-file::before {{
            content: "🔷";
        }}
        .folder-list ul {{
            list-style: none;
            padding-left: 20px;
            margin: 5px 0;
            border-left: 2px solid #e0e0e0;
        }}
        .file-details {{
            font-size: 12px;
            color: #666;
            margin-left: 10px;
        }}
        .function-list, .class-list {{
            margin: 5px 0 5px 20px;
            font-size: 11px;
        }}
        .function-item {{
            color: #333;
            margin: 2px 0;
        }}
        .class-item {{
            color: #333;
            margin: 2px 0;
            font-weight: bold;
        }}
        .method-item {{
            color: #333;
            margin-left: 15px;
            font-size: 10px;
        }}
        .collapsible-content {{
            display: none;
        }}
        .file-toggle {{
            cursor: pointer;
            user-select: none;
            color: #007acc;
            font-weight: bold;
        }}
        .file-toggle:hover {{
            background-color: #e6f3ff;
            padding: 2px 5px;
            border-radius: 3px;
        }}
        .toggle-icon {{
            display: inline-block;
            width: 12px;
            margin-right: 5px;
        }}
        .filter-controls {{
            margin: 15px 0;
            text-align: center;
        }}
        .filter-btn {{
            background: #007acc;
            color: white;
            border: none;
            padding: 8px 15px;
            margin: 0 5px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        }}
        .filter-btn:hover {{
            background: #005a99;
        }}
        .filter-btn.active {{
            background: #28a745;
        }}
        .file-item {{
            margin: 5px 0;
        }}
        .file-item.changed {{
            background-color: #ffebee;
            padding: 5px;
            border-radius: 3px;
            border-left: 3px solid #e57373;
        }}
        .file-item.function-changed {{
            background-color: #fff3e0;
            padding: 5px;
            border-radius: 3px;
            border-left: 3px solid #ffb74d;
        }}
        .file-item.new {{
            background-color: #e8f5e8;
            padding: 5px;
            border-radius: 3px;
            border-left: 3px solid #81c784;
        }}
        .file-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-family: monospace;
        }}
        .file-table th {{
            background-color: #f5f5f5;
            color: #333;
            padding: 8px 12px;
            text-align: left;
            border-bottom: 2px solid #ddd;
            font-weight: bold;
        }}
        .file-table td {{
            padding: 6px 12px;
            border-bottom: 1px solid #eee;
            vertical-align: middle;
        }}
        .file-table tr:hover {{
            background-color: #f9f9f9;
        }}
        .file-name-cell {{
            font-weight: bold;
        }}
        .file-lines-cell {{
            text-align: right;
            color: #666;
        }}
        .file-size-cell {{
            text-align: right;
            color: #666;
        }}
        .file-toggle-cell {{
            text-align: center;
            width: 40px;
        }}
        .timestamp {{
            color: #666;
            font-size: 0.85em;
        }}
        .target-folder {{
            font-family: monospace;
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 0.9em;
        }}
        .improvement-badge {{
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7em;
            margin-left: 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-left">
                <h1 style="margin: 0; font-size: 1.5em;">🔍 コードベース監視レポート</h1>
                <span class="improvement-badge">JS/TS解析改善</span>
                <span class="target-folder">{current_scan['target_folder']}</span>
            </div>
            <div class="header-right">
                <span class="timestamp">v0.7 | 更新: {current_scan['timestamp'][:19].replace('T', ' ')}</span>
                <button class="refresh-btn" onclick="location.reload()">🔄 更新</button>
            </div>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>{current_scan['summary']['total_files']}</h3>
                <p>総ファイル数</p>
            </div>
            <div class="summary-card">
                <h3>{current_scan['summary']['total_folders']}</h3>
                <p>総フォルダ数</p>
            </div>
            <div class="summary-card">
                <h3>{current_scan['summary']['total_lines']:,}</h3>
                <p>総行数</p>
            </div>
            <div class="summary-card">
                <h3>{current_scan['summary']['python_files']}</h3>
                <p>Pythonファイル</p>
            </div>
            <div class="summary-card">
                <h3>{current_scan['summary']['js_files']}</h3>
                <p>JS/TSファイル</p>
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>🤖 自動生成レポート - Code Monitor Tool v0.7 - JS/TS解析改善版</p>
        </div>
    </div>
</body>
</html>
        """
        
        # 最新レポートは常に更新
        latest_file = self.output_dir / "latest_report.html"
        with open(latest_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return latest_file
    
    def run_scan(self):
        """1回のスキャンを実行"""
        logger.info("📊 コードベーススキャンを開始...")
        
        current_scan = self.scan_folder()
        changes = self.detect_changes(current_scan)
        
        # 履歴に追加
        self.history.append(current_scan)
        
        # 履歴は最新20件まで保持
        if len(self.history) > 20:
            self.history = self.history[-20:]
        
        self._save_history()
        
        # HTMLレポート生成
        report_file = self.generate_html_report(current_scan, changes)
        
        logger.info(f"✅ スキャン完了 - 変更あり: {changes['has_changes']}")
        logger.info(f"📄 レポート: {report_file}")
        
        return report_file

def main():
    """メイン実行関数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='コードベース監視ツール v0.7')
    parser.add_argument('target_folder', help='監視対象フォルダのパス')
    parser.add_argument('--output', '-o', default='monitoring_output', 
                      help='出力ディレクトリ (デフォルト: monitoring_output)')
    parser.add_argument('--interval', '-i', type=int, default=10,
                      help='スキャン間隔（分） (デフォルト: 10)')
    parser.add_argument('--once', action='store_true',
                      help='1回だけ実行して終了')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.target_folder):
        print(f"エラー: フォルダが存在しません: {args.target_folder}")
        return
    
    monitor = CodeMonitor(args.target_folder, args.output)
    
    if args.once:
        # 1回だけ実行
        report_file = monitor.run_scan()
        print(f"レポートが生成されました: {report_file}")
    else:
        # 定期実行
        print(f"📊 コードベース監視を開始します...")
        print(f"監視対象: {args.target_folder}")
        print(f"スキャン間隔: {args.interval}分")
        print(f"出力先: {args.output}")
        print("Ctrl+C で終了します")
        
        # 最初に1回実行
        monitor.run_scan()
        
        # スケジュール設定
        schedule.every(args.interval).minutes.do(monitor.run_scan)
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n📋 監視を終了します")

if __name__ == "__main__":
    main()