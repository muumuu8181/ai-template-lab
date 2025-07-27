# 🔍 GitHub Pages アプリレビューツール

107個のGitHub Pagesアプリを効率的にレビューできるWebアプリケーションです。

## ✨ 特徴

- **📱 クロスプラットフォーム**: PC、タブレット、スマートフォンで動作
- **🔄 オンライン同期**: GitHub APIでレビューデータを端末間で同期
- **⚡ 高速評価**: クイック評価ボタンで素早く評価
- **📊 詳細分析**: 10点満点での詳細評価システム
- **💾 自動保存**: ローカル＋オンライン自動保存
- **📈 統計表示**: リアルタイム統計とプログレス表示

## 🚀 使用方法

### オンライン版（推奨）

1. **GitHub Pages でアクセス**:
   ```
   https://yourname.github.io/app-reviewer/
   ```

2. **GitHub連携設定**:
   - GitHub Personal Access Token を作成
   - リポジトリ名を入力
   - 「接続テスト」ボタンで認証

3. **レビュー開始**:
   - 左パネルでアプリを評価
   - 右側でアプリを実際に操作
   - 自動的にオンライン同期

### ローカル版

1. **ファイルダウンロード**:
   ```bash
   # HTMLファイルのみダウンロード
   wget https://raw.githubusercontent.com/yourname/app-reviewer/main/github-app-reviewer.html
   ```

2. **ブラウザで開く**:
   - ダウンロードしたHTMLファイルをダブルクリック
   - またはブラウザにドラッグ&ドロップ

## 🔧 セットアップ（開発者向け）

### GitHub Personal Access Token の作成

1. GitHub Settings → Developer settings → Personal access tokens
2. "Generate new token" をクリック
3. **必要な権限**:
   - `repo` (リポジトリへの完全アクセス)
   - `contents` (ファイルの読み書き)

### リポジトリ設定

1. **このリポジトリをフォーク**
2. **GitHub Pages を有効化**:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)

3. **ファイル構成**:
   ```
   your-repo/
   ├── index.html              # メインのレビューツール
   ├── data.json               # アプリ一覧データ
   ├── reviews.json            # レビューデータ（自動生成）
   └── README.md              # このファイル
   ```

## 📊 データ更新

### 自動更新（GitHub Actions）

```yaml
# .github/workflows/update-data.yml
name: Update App Data
on:
  schedule:
    - cron: '0 0 * * *'  # 毎日0時に実行
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Update app data
        run: |
          node github-pages-status-checker.cjs > data.json
          git add data.json
          git commit -m "Auto-update app data"
          git push
```

### 手動更新

```bash
# 最新のアプリ一覧を取得
node github-pages-status-checker.cjs
cp github-pages-status.json data.json
git add data.json
git commit -m "Update app data"
git push
```

## 🎯 機能詳細

### 評価システム

- **クイック評価**: Good/OK/Bad の3段階
- **詳細評価**: デザイン、機能性、使いやすさ、パフォーマンスを10点満点で評価
- **メモ機能**: 自由形式のテキスト入力

### キーボードショートカット

- `→` / `n`: 次のアプリ
- `←` / `p`: 前のアプリ  
- `Ctrl + S`: 保存
- `Ctrl + R`: アプリリロード

### データ同期

- **ローカル保存**: LocalStorage（オフライン時）
- **オンライン同期**: GitHub API（オンライン時）
- **競合解決**: タイムスタンプベースの自動マージ

## 📱 対応デバイス

- **PC**: Windows, Mac, Linux
- **タブレット**: iPad, Android
- **スマートフォン**: iPhone, Android
- **ブラウザ**: Chrome, Safari, Firefox, Edge

## 🔒 プライバシー

- レビューデータは設定したGitHubリポジトリのみに保存
- 個人情報は収集しません
- GitHub Token はブラウザのLocalStorageに保存

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🆘 サポート

- **Issues**: [GitHub Issues](https://github.com/yourname/app-reviewer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourname/app-reviewer/discussions)

---

**🎉 107個のアプリを効率的にレビューして、品質向上に貢献しましょう！**