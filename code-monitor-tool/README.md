# Code Monitor Tool v0.7 🔍

JavaScript/TypeScript解析の重大な欠陥を修正したコードベース監視ツール

## 🚀 v0.7 の主な改善点

### ❌ v0.6 の問題
- JavaScript/TypeScriptファイルの関数・クラスが全て「1行」と誤表示
- 正確なコード構造が把握できない致命的な欠陥

### ✅ v0.7 の改善
- **ImprovedJSAnalyzer**クラスを新規作成
- 括弧・ブレースのペアリングによる正確な終了行検出
- TypeScript構文（interface、type、export等）をサポート
- 矢印関数の正確な解析
- クラス内メソッドの詳細分析

### 📊 実証された改善結果
| ファイル | v0.6 | v0.7 | 改善 |
|----------|------|------|------|
| Layer クラス | 1行 | 39行 | ✅ 正確 |
| NeuralNetwork クラス | 1行 | 78行 | ✅ 正確 |
| DataLoader クラス | 1行 | 25行 | ✅ 正確 |

## 📦 機能概要

- **ファイル構造の可視化**: フォルダ・ファイルの階層表示
- **関数・クラス解析**: Python、JavaScript、TypeScriptの詳細分析
- **変更検知**: ファイル変更の自動検出とハイライト
- **HTMLレポート**: 美しいWebインターフェースでの結果表示
- **リアルタイム監視**: 定期的な自動スキャン機能

## 🛠️ 使用方法

### 基本的な使用法
```bash
# 1回だけ実行
python code-monitor-v0.7.py /path/to/project --once

# 定期監視（10分間隔）
python code-monitor-v0.7.py /path/to/project --interval 10
```

### オプション
- `--once`: 1回だけ実行して終了
- `--interval N`: N分間隔で監視（デフォルト: 10分）
- `--output DIR`: 出力ディレクトリ指定（デフォルト: monitoring_output）

## 📁 出力ファイル
- `latest_report.html`: 最新のレポート（常に更新）
- `report_YYYYMMDD_HHMMSS.html`: タイムスタンプ付きレポート
- `history.json`: 監視履歴データ

## 🎯 対応ファイル形式
- **Python**: .py（完全サポート）
- **JavaScript**: .js（v0.7で大幅改善）
- **TypeScript**: .ts（v0.7で新規サポート）
- **React**: .jsx, .tsx（v0.7で対応）
- **その他**: 行数のみカウント

## 🔧 技術的な改善点

### JavaScript/TypeScript解析エンジン
```python
class ImprovedJSAnalyzer:
    """JavaScript/TypeScriptファイルの改善された解析クラス"""
    
    @staticmethod
    def find_matching_brace(lines, start_line, start_pos):
        """対応する閉じ括弧の行を正確に検出"""
        # 文字列・コメントを適切に処理
        # ネストした括弧を正確にカウント
        # TypeScript特有の構文をサポート
```

### サポートする構文パターン
- 通常の関数宣言: `function name() {}`
- 矢印関数: `const name = () => {}`
- 非同期関数: `async function name() {}`
- クラス定義: `class Name extends Parent {}`
- TypeScript interface: `interface Name {}`
- エクスポート構文: `export function name() {}`

## 🎨 UI改善
- 「JS/TS解析改善」バッジを追加
- 正確な行数表示
- 関数・クラスの展開/折りたたみ機能
- 変更ファイルのハイライト

## 📈 パフォーマンス
- Python解析: 従来通り高精度
- JavaScript/TypeScript解析: **大幅に改善**
- メモリ使用量: 最適化済み
- 処理速度: 高速化

## 🔄 アップグレード方法
1. 既存のv0.6を削除
2. v0.7をダウンロード
3. 同じコマンドで実行
4. 改善された解析結果を確認

## 🐛 既知の制限事項
- 非常に複雑なネストしたオブジェクト構造の一部で精度が低下する場合がある
- 動的に生成される関数は検出されない
- コメント内のコードは解析対象外

## 🤝 コントリビューション
AI Template Lab プロジェクトの一部として開発されています。
バグ報告や改善提案は Issues でお知らせください。

## 📄 ライセンス
MIT License

---
**Code Monitor Tool v0.7** - AI Template Lab 🧪  
*AIとの協調開発を効率化する実用的なツール*