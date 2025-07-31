# 🔍 機能別調査手順ガイド

## 1. 権限管理システムの調査

### 調査手順
```bash
# 1. 権限マーカーの確認
ls -la core/.readonly base/.conditional custom/.editable

# 2. 書き込みテスト（失敗すべき）
echo "test" > core/test.txt  # エラーになるべき

# 3. 開発AIシミュレーション
cd AI_WORKSPACES/dev-ai/
cat README.md  # 役割確認
```

### 期待される結果
- ✅ core/への書き込みが拒否される
- ✅ custom/への書き込みが成功する
- ✅ 権限違反が記録される

### 調査時間: 15分

---

## 2. GitHub安全機能の調査

### 調査手順
```bash
# 1. pre-commitフックの設定
cp tools/git-safety/pre-commit-check.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 2. ファイル削除テスト
touch test-file.txt
git add test-file.txt
rm test-file.txt
git add .
git commit -m "test"  # 削除検出でブロックされるべき

# 3. 強制プッシュ防止確認
git push -f  # エラーになるべき
```

### 期待される結果
- ✅ ファイル削除時にコミットがブロックされる
- ✅ 削除理由の記載を要求される
- ✅ force pushが拒否される

### 調査時間: 20分

---

## 3. 自動監視システムの調査

### 調査手順
```bash
# 1. cronジョブの確認
cat monitoring/schedules/auto-check.cron

# 2. 手動実行テスト（スクリプトが存在しない場合はモック作成）
echo '#!/bin/bash
echo "Quick check running at $(date)"
# ファイル数カウント
find custom/ -type f | wc -l
' > monitoring/scripts/quick-check.js
chmod +x monitoring/scripts/quick-check.js

# 3. 実行
./monitoring/scripts/quick-check.js
```

### 期待される結果
- ✅ スケジュールが正しく設定されている
- ✅ チェックスクリプトが実行可能
- ✅ ログが適切に記録される

### 調査時間: 25分

---

## 4. ツール間連携の調査

### 調査手順
```bash
# 1. 共通インターフェース確認
cat core/interfaces/common-api.js

# 2. UIツールとテストツールの連携
cd tools/ui-generator/
# output-spec.json があるか確認
ls -la output-spec.json

cd ../test-runner/
# input-spec.json があるか確認
ls -la input-spec.json

# 3. 互換性確認
# 出力形式と入力形式が一致するか確認
```

### 期待される結果
- ✅ 共通インターフェースが定義されている
- ✅ 入出力仕様が明文化されている
- ✅ ツール間でデータ交換が可能

### 調査時間: 30分

---

## 5. AI役割分担の調査

### 調査手順
```bash
# 1. 開発AI環境テスト
cd AI_WORKSPACES/dev-ai/
# プロジェクト作成シミュレーション
mkdir -p ../../custom/projects/test-project
echo "# Test Project" > ../../custom/projects/test-project/README.md

# 2. チェックAI環境テスト
cd ../check-ai/
# 検証レポート作成
mkdir -p ../../monitoring/logs/check-reports/
echo "# 検証レポート $(date)" > ../../monitoring/logs/check-reports/test-report.md

# 3. 権限違反テスト
echo "violation" > ../../core/test.txt  # 失敗すべき
```

### 期待される結果
- ✅ 開発AIがcustom/で作業できる
- ✅ チェックAIがレポートを作成できる
- ✅ 権限違反が適切に防止される

### 調査時間: 20分

---

## 6. テンプレート開発ログの調査

### 調査手順
```bash
# 1. ログ構造確認
ls -la TEMPLATE_DEV_LOGS/

# 2. プロンプト記録確認
cat TEMPLATE_DEV_LOGS/prompts/2025-07-31.md

# 3. 新規ログ追加テスト
echo "## $(date +%Y-%m-%d)
- テスト記録
" >> TEMPLATE_DEV_LOGS/prompts/$(date +%Y-%m-%d).md
```

### 期待される結果
- ✅ ログが日付別に整理されている
- ✅ ユーザー指示が正確に記録されている
- ✅ 新規ログが追加できる

### 調査時間: 15分

---

## 🎯 総合調査チェックリスト

### Phase 1: 基本機能（1時間）
- [ ] 権限管理システム
- [ ] GitHub安全機能
- [ ] フォルダ構造の理解

### Phase 2: 高度な機能（1時間）
- [ ] 自動監視システム
- [ ] ツール間連携
- [ ] AI役割分担

### Phase 3: 統合テスト（30分）
- [ ] 実際のワークフロー実行
- [ ] エラー時の挙動確認
- [ ] パフォーマンス測定

## 📊 調査結果レポートテンプレート

```markdown
# 調査結果レポート - [デバイス名]

## 環境
- OS: 
- Git version: 
- Node.js version: 

## 調査項目と結果

### 1. 権限管理
- 結果: [成功/失敗]
- 詳細: 

### 2. GitHub安全機能
- 結果: [成功/失敗]
- 詳細: 

## 発見した問題
1. 
2. 

## 改善提案
1. 
2. 
```

---
*調査完了後は、結果をGitHubのIssueで報告してください*