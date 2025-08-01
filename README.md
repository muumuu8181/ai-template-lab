# AI Template Lab v0.8

## チーム
- **マネジメントチーム**: ルールを設定する
- **開発チーム**: 開発を行い、現在のルールに対するフィードバックをマネジメントチームに返す

両チームのフィードバックを反映する仕組みによって、このテンプレートシステムが育っていく。

## 作業記録フォーマット

すべてのAIは以下のフォーマットで作業記録を記載すること：

```
## YYYY-MM-DD HH:MM:SS JST - 作業タイトル
- 実施内容1
- 実施内容2
- 実施内容3
```

記録場所：
- 開発チーム: development/work_history.log
- ライター: management/writer/work_history.log
- チェッカー: management/checker/work_history.log
- レビュワー: management/reviewer/work_history.log

## v0.8の主な変更点

### Phase 4: 管理ファイル整理完了
- RULES.md等の管理文書をmanagement/フォルダに移動
- トップレベルファイル構造をシンプル化
- RULES_PATH.mdで移動先案内を提供

### 監視体制の強化
- tools/prompt-history-checker.py による自動監視開始
- プロンプト・作業履歴の1対1対応チェック
- 定期実行スケジュール（日次21:00、週次月曜、バージョンアップ前）
- HTML/JSON/TXT形式での詳細レポート生成

### 重要なパス変更
- RULES.md → management/RULES.md
- その他管理文書もmanagement/配下に集約

## 初回セットアップ
CLAUDE.mdに以下を記載する：

```
# 作業記録

2025-07-31 10:30:45 JST - 初回セットアップ実行
2025-07-31 10:31:12 JST - workフォルダを作成
2025-07-31 10:32:05 JST - clock.jsファイルを作成
2025-07-31 10:33:20 JST - READMEを更新
```

dateコマンドで時刻を取得し、すべての作業を記録する。

## 開発チームへ
作業中に以下のような問題があれば、すべてFEEDBACK.txtに記載すること：
- 困ったこと
- 悩んだこと
- 説明が分かりにくかったこと
- ルールが分かりにくかったこと