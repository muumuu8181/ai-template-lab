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

### Google認証プロバイダー設定手順

#### 📋 事前準備
1. **Googleアカウント**が必要（Firebase Console アクセス用）
2. **Firebase プロジェクト**が作成済みであること

#### 🚀 Google認証有効化手順

##### Step 1: Firebase Console にアクセス
```
https://console.firebase.google.com/project/shares-b1b97
```

##### Step 2: Authentication設定画面へ
1. 左メニューから **「Authentication」** をクリック
2. **「Sign-in method」** タブをクリック
3. **「Additional providers」** セクションを確認

##### Step 3: Google認証プロバイダーを有効化
1. **「Google」** をクリック
2. **「Enable」** トグルを **ON** にする
3. **「Project support email」** を設定
   - 自分のGoogleアカウントのメールアドレスを入力
   - 例: `kakari8888@gmail.com`
4. **「Save」** ボタンをクリック

##### Step 4: 承認済みドメインを設定
1. **「Settings」** タブをクリック
2. **「Authorized domains」** セクションを確認
3. 以下のドメインが追加されていることを確認:
   - ✅ `muumuu8181.github.io` (GitHub Pages用)
   - ✅ `localhost` (ローカル開発用)
4. 未追加の場合は **「Add domain」** で追加

##### Step 5: 設定確認
- ✅ Google認証が **「Enabled」** になっている
- ✅ サポートメールが設定されている  
- ✅ 必要なドメインが承認済みリストにある

#### 🔧 現在の設定状況
- ☑️ **Google認証プロバイダー**: 有効
- ☑️ **プロジェクトサポートメール**: 設定済み
- ☑️ **承認済みドメイン**: 
  - `muumuu8181.github.io` (GitHub Pages)
  - `localhost` (ローカル開発用)

#### ⚠️ トラブルシューティング

##### エラー: "auth/popup-blocked"
**原因**: ブラウザがポップアップをブロック  
**解決法**:
1. ブラウザのアドレスバー右側のポップアップブロックアイコンをクリック
2. 「このサイトのポップアップを常に許可」を選択
3. ページをリロードして再試行

##### エラー: "auth/unauthorized-domain"
**原因**: 認証を試行しているドメインが承認済みリストにない  
**解決法**:
1. Firebase Console → Authentication → Settings → Authorized domains
2. 該当ドメインを追加
3. 数分待ってから再試行

##### エラー: "auth/operation-not-allowed"
**原因**: Google認証プロバイダーが無効  
**解決法**:
1. Firebase Console → Authentication → Sign-in method
2. Google プロバイダーが有効になっているか確認
3. 無効の場合は有効化

#### 🧪 動作テスト手順

##### 1. ローカルテスト
```bash
# 簡易サーバー起動
python -m http.server 8000
# または
npx serve .
```
`http://localhost:8000` でアクセスしてテスト

##### 2. 本番環境テスト
```
https://muumuu8181.github.io/firebase-app-reviewer/
```

##### 3. 確認項目
- ✅ 「🔵 Googleで続行」ボタンが表示される
- ✅ クリックでGoogleログインポップアップが開く
- ✅ 認証成功でユーザー情報が表示される
- ✅ アバター画像が表示される（Googleアカウントに設定されている場合）

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