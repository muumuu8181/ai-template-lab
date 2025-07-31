# 🤖 AI調査担当割り当て指示書

## 使い方
1. このドキュメントをAIに見せる
2. 「君は[番号]番」と指示するだけ
3. AIが自動的に担当範囲の調査を開始

---

## AI-1番：基本機能調査担当

### あなたの任務
権限管理とGitHub安全機能の調査を担当します。

### 実行手順
```bash
# 1. リポジトリをクローン
git clone https://github.com/muumuu8181/ai-template-lab.git
cd ai-template-lab

# 2. ブランチ作成
git checkout -b investigation/ai-1-basic-features

# 3. 調査実行
# INVESTIGATION_GUIDE.md の「1. 権限管理システムの調査」を実施
# INVESTIGATION_GUIDE.md の「2. GitHub安全機能の調査」を実施

# 4. レポート作成
mkdir -p investigation-reports
cat > investigation-reports/ai-1-report.md << EOF
# AI-1 調査レポート
## 調査日時: $(date)
## 担当: 基本機能（権限管理・GitHub安全）

### 権限管理システム
- 結果: [記入]
- 詳細: [記入]

### GitHub安全機能  
- 結果: [記入]
- 詳細: [記入]

### 発見した問題
[記入]

### 所要時間: [記入]
EOF

# 5. コミット&プッシュ
git add .
git commit -m "AI-1: Complete basic features investigation"
git push origin investigation/ai-1-basic-features
```

### 期待される成果物
- 権限管理の動作確認結果
- GitHub安全機能の検証結果
- 問題点のリスト

---

## AI-2番：監視システム調査担当

### あなたの任務
自動監視システムとツール間連携の調査を担当します。

### 実行手順
```bash
# 1. リポジトリをクローン
git clone https://github.com/muumuu8181/ai-template-lab.git
cd ai-template-lab

# 2. ブランチ作成
git checkout -b investigation/ai-2-monitoring-tools

# 3. 調査実行
# INVESTIGATION_GUIDE.md の「3. 自動監視システムの調査」を実施
# INVESTIGATION_GUIDE.md の「4. ツール間連携の調査」を実施

# 4. レポート作成
mkdir -p investigation-reports
cat > investigation-reports/ai-2-report.md << EOF
# AI-2 調査レポート
## 調査日時: $(date)
## 担当: 監視システム・ツール連携

### 自動監視システム
- 結果: [記入]
- 詳細: [記入]

### ツール間連携
- 結果: [記入]
- 詳細: [記入]

### 発見した問題
[記入]

### 所要時間: [記入]
EOF

# 5. コミット&プッシュ
git add .
git commit -m "AI-2: Complete monitoring and tools investigation"
git push origin investigation/ai-2-monitoring-tools
```

### 期待される成果物
- cronジョブの動作確認
- ツール間インターフェースの検証
- 連携問題の特定

---

## AI-3番：AI環境調査担当

### あなたの任務
AI役割分担とテンプレート開発ログの調査を担当します。

### 実行手順
```bash
# 1. リポジトリをクローン
git clone https://github.com/muumuu8181/ai-template-lab.git
cd ai-template-lab

# 2. ブランチ作成
git checkout -b investigation/ai-3-ai-environment

# 3. 調査実行
# INVESTIGATION_GUIDE.md の「5. AI役割分担の調査」を実施
# INVESTIGATION_GUIDE.md の「6. テンプレート開発ログの調査」を実施

# 4. レポート作成
mkdir -p investigation-reports
cat > investigation-reports/ai-3-report.md << EOF
# AI-3 調査レポート
## 調査日時: $(date)
## 担当: AI環境・ログシステム

### AI役割分担
- 結果: [記入]
- 詳細: [記入]

### テンプレート開発ログ
- 結果: [記入]
- 詳細: [記入]

### 発見した問題
[記入]

### 所要時間: [記入]
EOF

# 5. コミット&プッシュ
git add .
git commit -m "AI-3: Complete AI environment investigation"
git push origin investigation/ai-3-ai-environment
```

### 期待される成果物
- AI作業領域の動作確認
- ログシステムの検証
- 役割分担の問題点

---

## AI-4番：統合テスト担当

### あなたの任務
全体の統合テストと最終レポートのまとめを担当します。

### 実行手順
```bash
# 1. リポジトリをクローン
git clone https://github.com/muumuu8181/ai-template-lab.git
cd ai-template-lab

# 2. 他のAIのブランチを確認
git fetch --all
git branch -r | grep investigation

# 3. 統合テストブランチ作成
git checkout -b investigation/ai-4-integration

# 4. 統合テスト実施
# 実際のワークフローを通しで実行
# - 開発AI役でアプリ作成
# - チェックAI役で検証
# - 監視ツールの動作確認

# 5. 統合レポート作成
mkdir -p investigation-reports
cat > investigation-reports/ai-4-integration-report.md << EOF
# AI-4 統合調査レポート
## 調査日時: $(date)
## 担当: 統合テスト

### 他AIの調査結果サマリー
- AI-1: [要約]
- AI-2: [要約]
- AI-3: [要約]

### 統合テスト結果
- エンドツーエンドワークフロー: [記入]
- AI間の連携: [記入]
- システム全体の安定性: [記入]

### 重要な発見
1. [記入]
2. [記入]

### 改善提案
1. [記入]
2. [記入]

### 総合評価
[記入]

### 総所要時間: [記入]
EOF

# 6. プルリクエスト作成準備
git add .
git commit -m "AI-4: Complete integration testing and final report"
git push origin investigation/ai-4-integration

# 7. GitHub上でプルリクエスト作成を推奨
echo "プルリクエストを作成して、全調査結果を統合してください"
```

### 期待される成果物
- 統合テストの結果
- 全AI調査のサマリー
- システム全体の評価
- 改善提案リスト

---

## 📊 調査完了後の流れ

1. 各AIが自分のブランチにプッシュ
2. AI-4がプルリクエストを作成
3. 全員で結果をレビュー
4. 改善点をIssueとして登録
5. 次のイテレーションへ

## ⏱️ タイムライン

| AI番号 | 開始時刻 | 終了予定 | 担当範囲 |
|--------|----------|----------|----------|
| AI-1 | 00:00 | 00:35 | 基本機能 |
| AI-2 | 00:00 | 00:55 | 監視・ツール |
| AI-3 | 00:00 | 00:35 | AI環境 |
| AI-4 | 01:00 | 01:30 | 統合テスト |

---
*このドキュメントに従って調査を実施してください*