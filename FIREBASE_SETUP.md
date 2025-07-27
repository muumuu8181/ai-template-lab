# 🔥 Firebase レビューツール セットアップガイド

## 📋 概要
このツールはGoogle認証でデバイス間同期できるアプリレビューシステムです。

## 🎯 最終的にできること
- **PC、タブレット、スマホ**で同じレビューデータを共有
- **Google認証**で簡単ログイン
- **リアルタイム同期** - 他のデバイスでの変更が即座に反映
- **107個のアプリ**を効率的にレビュー

---

## 🚀 セットアップ手順

### 1️⃣ Firebase プロジェクト作成

1. **Firebase Console** にアクセス
   ```
   https://console.firebase.google.com/
   ```

2. **「プロジェクトを追加」** をクリック

3. **プロジェクト名を入力**
   ```
   例: app-reviewer-2025
   ```

4. **Google Analytics** は「今は設定しない」を選択

5. **「プロジェクトを作成」** をクリック

### 2️⃣ Authentication 設定

1. 左メニューから **「Authentication」** をクリック

2. **「始める」** をクリック

3. **「Sign-in method」** タブに移動

4. **「Google」** を選択して有効化
   - **プロジェクトのサポートメール** を入力
   - **「保存」** をクリック

### 3️⃣ Firestore Database 作成

1. 左メニューから **「Firestore Database」** をクリック

2. **「データベースの作成」** をクリック

3. **「本番環境モードで開始」** を選択

4. **ロケーション** を選択
   ```
   推奨: asia-northeast1 (東京)
   ```

5. **「完了」** をクリック

### 4️⃣ Realtime Database 作成

1. 左メニューから **「Realtime Database」** をクリック

2. **「データベースを作成」** をクリック

3. **「ロックモードで開始」** を選択

4. **「有効にする」** をクリック

### 5️⃣ セキュリティルール設定

#### Firestore Rules
1. **Firestore Database** → **「ルール」** タブ
2. 以下のルールを設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // レビューデータ: 認証済みユーザーが自分のデータのみアクセス可能
    match /reviews/{reviewId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // 新しいレビューの作成
    match /reviews/{reviewId} {
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### Realtime Database Rules
1. **Realtime Database** → **「ルール」** タブ
2. 以下のルールを設定:

```json
{
  "rules": {
    ".read": true,
    ".write": false
  }
}
```

### 6️⃣ Web アプリ追加

1. **プロジェクトの概要** ページに戻る

2. **「</>」** (Web) アイコンをクリック

3. **アプリのニックネーム** を入力
   ```
   例: App Reviewer Web
   ```

4. **「Firebase Hosting も設定する」** にチェック

5. **「アプリを登録」** をクリック

6. **設定情報をコピー** (後で使用)

### 7️⃣ GitHub Pages 設定

#### リポジトリ作成
1. **GitHub** で新しいリポジトリ作成
   ```
   リポジトリ名: firebase-app-reviewer
   Public に設定
   ```

2. **ファイルアップロード**
   - `index.html` (作成済み)
   - `data.json` (作成済み)
   - `README.md`

#### GitHub Pages 有効化
1. **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: main / (root)
4. **Save** をクリック

### 8️⃣ Firebase設定の適用

1. **index.html** を開く

2. **firebaseConfig** 部分を書き換え:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",  
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

3. **変更をコミット**してGitHub Pages にデプロイ

### 9️⃣ 承認済みドメイン追加

1. **Firebase Console** → **Authentication** → **Settings**

2. **承認済みドメイン** タブ

3. **ドメインを追加** をクリック

4. **GitHub Pages URL** を追加
   ```
   例: yourname.github.io
   ```

---

## ✅ 動作確認

### 1. GitHub Pages URL にアクセス
```
https://yourname.github.io/firebase-app-reviewer/
```

### 2. Google認証をテスト
- **「🔵 Googleで続行」** をクリック
- Google アカウントでログイン
- ユーザー名が表示されることを確認

### 3. レビュー機能をテスト
- アプリを評価して **「💾 保存」** をクリック
- **「✅ クラウド同期完了」** が表示されることを確認

### 4. 同期をテスト
- **別のデバイス/ブラウザ** で同じURLにアクセス
- 同じGoogleアカウントでログイン
- レビューデータが同期されていることを確認

---

## 🔧 トラブルシューティング

### 🚫 「Firebase未設定」が表示される
- **原因**: firebaseConfig が正しく設定されていない
- **解決**: Firebase Console からconfig情報を再確認

### 🚫 Google認証が失敗する
- **原因**: 承認済みドメインが設定されていない
- **解決**: Firebase Console で GitHub Pages ドメインを追加

### 🚫 「ポップアップがブロックされました」
- **原因**: ブラウザのポップアップブロック
- **解決**: GitHub Pages ドメインのポップアップを許可

### 🚫 データが同期されない
- **原因**: Firestore ルールの設定ミス
- **解決**: セキュリティルールを再確認

### 🚫 「オフライン」表示が続く
- **原因**: Realtime Database の設定不備
- **解決**: Realtime Database が作成されているか確認

---

## 📈 使用方法

### 基本的な流れ
1. **Google認証** でログイン
2. **左パネル** でアプリを評価
3. **右側** でアプリを実際に操作  
4. **評価・メモ** を入力
5. **「保存」** で同期
6. **「次へ」** で次のアプリ

### キーボードショートカット
- `→` または `n`: 次のアプリ
- `←` または `p`: 前のアプリ
- `Ctrl + S`: 保存
- `Ctrl + R`: アプリリロード

### 評価システム
- **クイック評価**: Good/OK/Bad (3段階)
- **詳細評価**: デザイン・機能性・使いやすさ・パフォーマンス (10点満点)
- **メモ**: 自由記述

---

## 🌟 完成！

これで**どのデバイスからでも同じレビューデータにアクセス**できるようになりました！

📱 **PC → タブレット → スマホ** でシームレスにレビュー作業を継続できます。

🔗 **あなたのレビューツール**: `https://yourname.github.io/firebase-app-reviewer/`