# 統合プロジェクト管理テンプレート v0.3

## 概要
プロジェクト管理とアプリ開発が統合されたオールインワンテンプレート

## 特徴
- **プロジェクト管理**: 作業ログ、要件管理、振り返りなど
- **アプリ開発**: 操作ログ機能付きWebアプリテンプレート
- **標準構成**: `src/`（ソースコード）と`doc/`（ドキュメント）

## 使い方

### 1. テンプレートのコピー
```bash
# template_setフォルダを新プロジェクト名でコピー
cp -r template_set my_new_project
cd my_new_project
```

### 2. アプリ開発
```bash
# アプリを起動
python3 -m http.server 8080
# ブラウザで http://localhost:8080/src/index.html を開く
```

### 3. プロジェクト管理
```bash
# ドキュメント管理画面を開く
# ブラウザで http://localhost:8080/docs/viewer.html を開く
```

## フォルダ構成
```
template_set/
├── CLAUDE.md       ← Claude用作業指示書
├── README.md       ← プロジェクトの説明
├── src/            ← アプリのソースコード
│   └── index.html  ← 操作ログ機能付きアプリ
└── docs/           ← プロジェクト管理ドキュメント
    ├── viewer.html ← ドキュメントビューワー
    ├── README.md   ← プロジェクト詳細
    ├── work_log.md ← 作業記録
    ├── requirements_spec.md
    ├── version_history.md
    ├── todo_list.md
    ├── reflection.md
    ├── rules.md
    ├── prompts.md
    ├── tests.md
    └── knowledge.md
```

## 新機能（v0.3）
- **操作ログシステム**: すべてのユーザー操作を自動記録
- **ログコピー機能**: AIに渡しやすい形式でワンクリックコピー
- **統合構成**: アプリ開発とプロジェクト管理が1つのテンプレートに

## 従来版からの変更点
- **v0.1-0.2**: プロジェクト管理のみ
- **v0.3**: アプリ開発機能を統合、標準的なフォルダ構成を採用

## GitHub
[リポジトリURL]

---
*最終更新: 2025-07-30*