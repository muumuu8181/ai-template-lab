# レビュワー宛て：構造見直し提案

## 📋 レビュワーへ

### 現在の問題点
1. **トップレベルの混雑**
   - 6個のドキュメントファイル（README, RULES, PERMISSIONS, TEAM_ROLES, SYSTEM_OVERVIEW, CLAUDE）
   - 2個の孤立ファイル（work_history.log, feedback.txt）
   - 2フォルダ（development/, management/）

2. **所有権の不明確さ**
   - トップのwork_history.logは誰のもの？
   - feedback.txtは誰が管理？

3. **初期方針からの逸脱**
   - 「トップはシンプルに」という原則を破っている
   - 5ファイルから始めたのに、今や10個以上

### 提案する新構造
```
ai-template-lab/
├── README.md          # プロジェクト説明のみ
├── CLAUDE.md          # 開発への指示書のみ
├── development/       # 開発チームのすべて
│   ├── work_history.log
│   └── feedback.log
└── management/        # マネジメントチームのすべて
    ├── RULES.md       # ← 移動
    ├── PERMISSIONS.md # ← 移動
    ├── TEAM_ROLES.md  # ← 移動
    ├── SYSTEM_OVERVIEW.md # ← 移動
    ├── writer/
    ├── checker/
    └── reviewer/
```

### メリット
- トップレベル：2ファイル + 2フォルダのみ
- 所有権明確：どのファイルも所属が明確
- 原則遵守：シンプルなトップ構造

### デメリット
- 開発チームがRULES.mdを探しにくい？
- 権限情報へのアクセスが1階層深くなる

### レビュー要請事項
1. この構造変更に賛成か反対か
2. 他により良い案があるか
3. 移行のタイミングはいつが適切か

---
*ライターより、2025-07-31 23:50:00 JST*