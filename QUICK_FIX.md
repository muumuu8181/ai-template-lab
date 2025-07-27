# 🔧 クイック修正ガイド

## 🚨 問題1: Firebase API Key エラー

### エラーメッセージ:
```
Google認証エラー: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

### 🛠️ 解決手順:

1. **Firebase Console にアクセス**
   ```
   https://console.firebase.google.com/
   ```

2. **プロジェクト設定を開く**
   - プロジェクトを選択
   - ⚙️ 設定アイコン → 「プロジェクトの設定」

3. **SDK設定と構成を確認**
   - 下にスクロールして「マイアプリ」セクション
   - Web アプリの「構成」をクリック

4. **設定情報をコピー**
   ```javascript
   const firebaseConfig = {
     apiKey: "actual-api-key-here",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com", 
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

5. **index.html の設定を置き換え**
   - `index.html` を開く
   - 62行目あたりの `firebaseConfig` を実際の値に変更
   - 保存

---

## 📱 問題2: レビュー対象が3個だけ

### 原因:
- `data.json` が正しく読み込まれていない
- 107個のアプリデータが含まれている `data.json` が必要

### 🛠️ 解決手順:

#### オプション1: データファイルの確認
1. **同じフォルダに `data.json` があるか確認**
   ```
   フォルダ構成:
   ├── index.html
   ├── data.json ← これが必要
   └── README.md
   ```

2. **`data.json` のサイズ確認**
   - 正しいファイルは約100KB以上
   - 中身を確認して107個のアプリがあるか確認

#### オプション2: 最新データの再生成
```bash
# GitHub Pages ステータスチェッカーを実行
node github-pages-status-checker.cjs

# 生成されたファイルをコピー
copy github-pages-status.json data.json
```

#### オプション3: ローカルテスト
```bash
# ローカルサーバーで確認
python -m http.server 8000
# http://localhost:8000 でアクセス
```

---

## ✅ 動作確認

### 1. Firebase設定が正しいか確認
- ブラウザのDevTools (F12) → Console
- エラーメッセージが出ていないか確認

### 2. データ読み込み確認
- Console に以下が表示されるか確認:
  ```
  📋 data.json読み込み成功: {total: 152, accessible: 107, ...}
  📱 107個のアクセス可能なアプリを読み込みました
  ```

### 3. 107個のアプリが表示されているか確認
- 右下の進捗表示: `1 / 107 完了` になっているか

---

## 🎯 正しく動作している状態

✅ **接続状態**: `🟢 オンライン同期`  
✅ **アプリ数**: `1 / 107 完了`  
✅ **認証**: Google認証が成功  
✅ **同期**: `✅ クラウド同期完了` が表示

---

## 📞 まだ問題が続く場合

### デバッグ情報の確認
1. **F12** でDevToolsを開く
2. **Console** タブで以下を確認:
   ```
   🚀 レビューツール初期化開始...
   🔥 Firebase接続成功
   📋 data.json読み込み成功: {...}
   📱 107個のアクセス可能なアプリを読み込みました
   ```

### よくあるエラーと解決法
- `Firebase未設定` → firebaseConfig を正しい値に設定
- `data.json読み込みエラー` → data.jsonファイルを同じフォルダに配置
- `ポップアップブロック` → ブラウザでポップアップを許可

この手順で107個のアプリレビューツールが完全に動作するはずです！