# SIMPLE-CHECK 使用方法

## 🚀 実行方法と実行者の識別

### 1. 人間がダブルクリックした場合
```
SIMPLE-CHECK.bat をダブルクリック
→ Executor: HUMAN としてログに記録
```

### 2. AIが実行する場合
```
AI-CHECK.bat をダブルクリック
または
SIMPLE-CHECK.bat --ai
→ Executor: AI としてログに記録
```

### 3. 自動化ツールから実行する場合
```
SIMPLE-CHECK.bat --automated
→ Executor: AUTOMATED としてログに記録
```

## 📋 ログファイル形式

`simple-check.log` に以下の形式で記録されます：

```
[2025/07/30 18:45:00.00] Executor: HUMAN, Result: SAFE
[2025/07/30 18:46:30.50] Executor: AI, Result: DANGER
[2025/07/30 18:47:15.25] Executor: HUMAN, Result: SAFE
```

## 🎯 結果の見方

- **Result: SAFE** = ✅ システムは安全（改ざんなし）
- **Result: DANGER** = 🚨 システムが改ざんされている

## 💡 AIへの指示例

AIに実行してもらう場合：
「simple-check フォルダの AI-CHECK.bat をダブルクリックして実行してください」

これにより、ログで人間とAIの実行を区別できます。