# フィードバック統合パイプライン

## 機能
4人の調査AIからのフィードバックを自動的に統合し、テンプレート改善提案を生成する

## ファイル構成
```
integration-pipeline/
├── collect-reports.js    # 調査結果収集スクリプト
├── analyze-feedback.js  # フィードバック分析スクリプト
├── generate-proposals.js # 改善提案生成スクリプト
└── merge-to-template.js # テンプレート反映スクリプト
```

## 使用手順
1. `collect-reports.js` - 調査結果を収集
2. `analyze-feedback.js` - フィードバックを分析
3. `generate-proposals.js` - 改善提案を作成
4. `merge-to-template.js` - テンプレートに反映

## AI開発者対応機能
- **記憶問題対策**: 自動要約機能
- **虚偽報告検証**: 交差確認機能
- **一貫性保持**: テンプレート整合性チェック