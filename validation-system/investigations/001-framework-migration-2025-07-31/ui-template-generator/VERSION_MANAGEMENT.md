# UI Template Generator バージョン管理ガイドライン

## 現在のバージョン構成
- `ui-template-generator/` - 開発用ディレクトリ（現在v0.41）
- `ui-template-generator-v0.1/` - v0.1バックアップ
- `ui-template-generator-v0.2/` - v0.2バックアップ
- `ui-template-generator-v0.41/` - v0.41バックアップ（新規作成）

## 今後のバージョン管理ルール

### 1. 開発フロー
- 常に `ui-template-generator/` で開発
- 重要なマイルストーンでバックアップを作成

### 2. バックアップタイミング
- メジャーバージョンアップ時（0.x → 0.x+1）
- 大きな機能追加完了時
- ユーザーからの要望実装完了時

### 3. フォルダ命名規則
```
ui-template-generator-v{バージョン番号}/
例: ui-template-generator-v0.5/
```

### 4. バージョン番号の意味
- v0.1 - 基本機能実装
- v0.2 - 複数グループ管理
- v0.3 - チェックボックス選択システム
- v0.31 - 横並びレイアウト機能
- v0.32 - 操作履歴ログ機能
- v0.4 - グループクリック選択機能
- v0.41 - UIパネル名変更、高さ反映修正

### 5. 欠番バージョンについて
v0.3は個別バックアップが作成されていませんでした。
今後はこのような欠番が生じないよう、確実にバックアップを作成します。

## 実行コマンド例
```bash
# 現在のバージョンをバックアップ
cp -r ui-template-generator ui-template-generator-v0.XX

# バックアップ確認
ls -la ui-template-generator-v*
```