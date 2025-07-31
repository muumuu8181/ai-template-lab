# 検証チーム向け統合ガイド

## 📦 既存の調査結果をCENTRAL_HUBに移動する方法

### 1. 最新版を取得
```bash
git pull origin master
# CENTRAL_HUB構造が追加されます
```

### 2. 各AIの結果を移動
```bash
# AI-1の結果を移動
cp investigation-reports/ai-1-basic-features/* \
   CENTRAL_HUB/incoming/validation-team/val-1/

# AI-2の結果を移動
cp investigation-reports/ai-2-monitoring-tools/* \
   CENTRAL_HUB/incoming/validation-team/val-2/

# AI-3の結果を移動  
cp investigation-reports/ai-3-testing-validation/* \
   CENTRAL_HUB/incoming/validation-team/val-3/

# AI-4の結果を移動
cp investigation-reports/ai-4-integration-deploy/* \
   CENTRAL_HUB/incoming/validation-team/val-4/
```

### 3. フォーマットを統一
既存の報告をCENTRAL_HUBのテンプレートに合わせて更新

### 4. 今後の報告方法
```bash
# 作業完了時に実行
./CENTRAL_HUB/scripts/report-completion.sh validation 1 "タスク名" 所要時間
```

## 📄 報告テンプレートの使い方

CENTRAL_HUB/README.mdに記載されたテンプレートを使用してください。

### 重要な項目
- **チーム番号**: val-1～val-4 を明記
- **所要時間**: 分単位で記録
- **問題点**: 発見したら必ず記載
- **フィードバック**: テンプレート改善点を積極的に記載