# 🗺️ ナビゲーションマップ

## プロジェクト全体図

```
あなたはここにいます → 📍
                      ↓
ai-template-lab-restructured/
├── 📌 START_HERE.md (今読んだファイル)
├── 🗺️ NAVIGATION_MAP.md (このファイル)
│
├── 作業履歴 ─────────────────────┐
│   └── TEMPLATE_DEV_LOGS/       │
│                               │
├── システムコア ─────────────────┤
│   └── 🔒 core/ [変更禁止]      │
│       ├── integrity/          │ 監視
│       └── interfaces/         │ 連携
│                               │
├── 標準テンプレート ─────────────┤
│   └── 📝 base/ [条件付き]      │
│       ├── rules/              │ ルール
│       └── templates/          │ 雛形
│                               │
├── カスタム領域 ─────────────────┤
│   └── ✏️ custom/ [自由編集]     │
│       └── projects/           │ 開発
│                               │
├── ツール群 ─────────────────────┤
│   └── 🔧 tools/                │
│       ├── ui-generator/       │ UI作成
│       └── test-runner/        │ テスト
│                               │
└── AI作業場 ─────────────────────┘
    └── 🤖 AI_WORKSPACES/
        ├── dev-ai/    → 開発AI用
        └── check-ai/  → チェックAI用
```

## 🎯 目的別ガイド

### 新規アプリを作りたい
1. `base/templates/` でテンプレートを選択
2. `custom/projects/` に新規フォルダ作成
3. `tools/ui-generator/` でUI作成

### ルールを確認したい
→ `base/rules/` を参照

### エラーが出た
→ `monitoring/logs/` で原因確認

### 改善提案がある
→ `TEMPLATE_DEV_LOGS/` に記録

## 🚦 権限レベル

| フォルダ | 開発AI | チェックAI |
|---------|--------|------------|
| core/   | ❌読取不可 | ✅読取のみ |
| base/   | ✅読取のみ | ✅読取のみ |
| custom/ | ✅読み書き | ✅読取のみ |
| tools/  | ✅使用可能 | ✅使用可能 |

---
*迷ったらこのマップに戻ってください*