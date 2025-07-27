# 🔥 Firebase App Reviewer - 完全セットアップガイド

## 📋 概要

Firebase App Reviewerで使用している Firebase 設定とGoogle認証設定の完全ドキュメントです。

## 🔧 Firebase プロジェクト情報

### プロジェクト基本情報
- **プロジェクト名**: shares-b1b97
- **プロジェクトID**: shares-b1b97
- **Firebase Console**: https://console.firebase.google.com/project/shares-b1b97

### 設定済みサービス
- ✅ **Authentication** (Google認証)
- ✅ **Realtime Database** (レビューデータ同期)
- ✅ **Hosting** (GitHub Pages連携)

## 🔐 Authentication 設定

### Google認証プロバイダー
**設定場所**: https://console.firebase.google.com/project/shares-b1b97/authentication/providers

#### 有効化済み設定:
- ☑️ **Google認証プロバイダー**: 有効
- ☑️ **承認済みドメイン**: 
  - `muumuu8181.github.io` (GitHub Pages)
  - `localhost` (ローカル開発用)

#### 設定手順:
1. Firebase Console → Authentication → Sign-in method
2. Google プロバイダーを選択
3. 「有効にする」をON
4. プロジェクトサポートメールを設定
5. 承認済みドメインに `muumuu8181.github.io` を追加

## 💾 Realtime Database 設定

### データベース情報
- **URL**: https://shares-b1b97-default-rtdb.firebaseio.com
- **地域**: us-central1
- **データ構造**:
```
shares-b1b97-default-rtdb/
├── app-reviews/
│   └── {userId}/
│       └── {appName}/
│           ├── userId: string
│           ├── appName: string
│           ├── design: number (1-10)
│           ├── functionality: number (1-10)
│           ├── usability: number (1-10)
│           ├── performance: number (1-10)
│           ├── quickRating: string ("good"|"ok"|"bad")
│           ├── memo: string
│           ├── timestamp: string (ISO)
│           └── deviceInfo: string
└── sync-test-tasks/ (simple-sync.html用)
```

### セキュリティルール
**設定場所**: https://console.firebase.google.com/project/shares-b1b97/database/shares-b1b97-default-rtdb/rules

```javascript
{
  "rules": {
    // アプリレビューデータ
    "app-reviews": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    // simple-sync用テストデータ
    "sync-test-tasks": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 🔑 Firebase設定情報

### アプリケーション設定
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyA5PXKChizYDCXF_GJ4KL6Ylq9K5hCPXWE",
    authDomain: "shares-b1b97.firebaseapp.com",
    databaseURL: "https://shares-b1b97-default-rtdb.firebaseio.com",
    projectId: "shares-b1b97",
    storageBucket: "shares-b1b97.firebasestorage.app",
    messagingSenderId: "38311063248",
    appId: "1:38311063248:web:0d2d5726d12b305b24b8d5"
};
```

### SDK設定 (compat版使用)
```html
<!-- Firebase SDKs (compat版) -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
```

## 🎯 動作確認済み機能

### ✅ 認証機能
- Google認証（ポップアップ方式）
- 認証状態の永続化
- ログアウト機能
- ユーザー情報表示（名前・アバター）

### ✅ データ同期機能  
- リアルタイムレビューデータ同期
- 複数デバイス間での自動反映
- オフライン→オンライン時の自動同期
- データ競合の自動解決

### ✅ レビュー機能
- 10点満点詳細評価（デザイン・機能性・使いやすさ・パフォーマンス）
- クイック評価（Good/OK/Bad）
- 自由記述メモ
- 統計表示とプログレス管理

## 🔍 トラブルシューティング

### よくある問題と解決法

#### 1. 認証エラー
```
Firebase: Error (auth/popup-blocked)
```
**解決法**: ブラウザのポップアップブロックを無効化

#### 2. データベース接続エラー
```
Firebase error. Please ensure that you have the URL configured correctly
```
**解決法**: Realtime Database URLが正しく設定されているか確認

#### 3. 同期されない
**確認項目**:
- ネットワーク接続
- 同じGoogleアカウントでログイン
- Firebase Console でユーザーが認証されているか

## 🔄 データ移行・バックアップ

### エクスポート方法
```bash
# Firebase CLI でデータエクスポート
firebase database:get / --project shares-b1b97 > backup.json
```

### インポート方法  
```bash
# Firebase CLI でデータインポート
firebase database:set / backup.json --project shares-b1b97
```

## 🛡️ セキュリティ考慮事項

### 実装済みセキュリティ
- ✅ 認証必須（未認証ユーザーはデータアクセス不可）
- ✅ ユーザー分離（自分のデータのみアクセス可能）
- ✅ HTTPS通信（GitHub Pages）
- ✅ APIキー制限（ドメイン限定）

### 追加推奨設定
- 📧 **通知設定**: Firebase Console で異常アクセス通知
- 🔒 **API制限**: Google Cloud Console でAPIキー制限強化
- 📊 **利用監視**: Firebase Analytics で使用状況監視

## 📞 サポート・参考資料

### 公式ドキュメント
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Realtime Database](https://firebase.google.com/docs/database)
- [Firebase Console](https://console.firebase.google.com/)

### 関連アプリ
- **Firebase App Reviewer**: https://muumuu8181.github.io/firebase-app-reviewer/
- **Simple Sync Test**: 同じFirebaseプロジェクトで動作確認済み

---

**📝 最終更新**: 2025-07-27  
**✅ 動作確認**: Google認証・リアルタイム同期・複数デバイス連携すべて正常動作