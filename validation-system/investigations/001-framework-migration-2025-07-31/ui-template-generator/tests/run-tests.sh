#!/bin/bash

# UI Template Generator E2E Test Runner
# 自動テスト実行スクリプト

set -e  # エラー時に停止

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ヘルプ表示
show_help() {
    cat << EOF
UI Template Generator E2E Test Runner

使用方法:
    ./run-tests.sh [オプション]

オプション:
    -h, --help          このヘルプを表示
    -i, --install       依存関係とPlaywrightブラウザをインストール
    -t, --test [FILE]   テストを実行（ファイル名指定可能）
    -b, --browser NAME  特定ブラウザでテスト実行 (chromium|firefox|edge)
    -u, --ui            UIモードでテスト実行
    -d, --debug         デバッグモードでテスト実行
    -r, --report        テストレポートを表示
    -c, --clean         テスト結果ファイルをクリーンアップ
    -a, --all           全ての処理を順次実行（インストール→テスト→レポート）

例:
    ./run-tests.sh --install                    # セットアップ
    ./run-tests.sh --test                       # 全テスト実行
    ./run-tests.sh --test 01-basic-group        # 特定テスト実行
    ./run-tests.sh --browser chromium           # Chrome専用テスト
    ./run-tests.sh --ui                         # UIモード
    ./run-tests.sh --all                        # 全処理実行
EOF
}

# 依存関係チェック
check_dependencies() {
    log_info "依存関係をチェック中..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js がインストールされていません"
        log_info "Node.js をインストールしてください: https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm がインストールされていません"
        exit 1
    fi
    
    log_success "依存関係チェック完了"
}

# インストール処理
install_dependencies() {
    log_info "依存関係をインストール中..."
    
    if [ ! -f "package.json" ]; then
        log_error "package.json が見つかりません"
        log_info "testsディレクトリ内で実行してください"
        exit 1
    fi
    
    npm install
    
    log_info "Playwrightブラウザをインストール中..."
    npx playwright install
    
    log_success "インストール完了"
}

# テスト実行
run_tests() {
    local test_file="$1"
    local browser="$2"
    local mode="$3"
    
    log_info "テストを実行中..."
    
    # 基本コマンド
    local cmd="npx playwright test"
    
    # ファイル指定
    if [ -n "$test_file" ]; then
        cmd="$cmd $test_file"
        log_info "対象: $test_file"
    else
        log_info "対象: 全テストファイル"
    fi
    
    # ブラウザ指定
    if [ -n "$browser" ]; then
        cmd="$cmd --project=$browser"
        log_info "ブラウザ: $browser"
    fi
    
    # モード指定
    case "$mode" in
        "ui")
            cmd="$cmd --ui"
            log_info "モード: インタラクティブUI"
            ;;
        "debug")
            cmd="$cmd --debug"
            log_info "モード: デバッグ"
            ;;
        "headed")
            cmd="$cmd --headed"
            log_info "モード: ブラウザ表示"
            ;;
        *)
            log_info "モード: ヘッドレス（標準）"
            ;;
    esac
    
    echo
    log_info "実行コマンド: $cmd"
    echo
    
    # テスト実行
    if $cmd; then
        log_success "テスト実行完了"
        return 0
    else
        log_error "テスト実行中にエラーが発生しました"
        return 1
    fi
}

# レポート表示
show_report() {
    log_info "テストレポートを表示中..."
    
    if [ -d "playwright-report" ]; then
        npm run test:report
        log_success "レポート表示完了"
    else
        log_warning "テストレポートが見つかりません"
        log_info "先にテストを実行してください: ./run-tests.sh --test"
    fi
}

# クリーンアップ
cleanup() {
    log_info "テスト結果をクリーンアップ中..."
    
    # 結果ディレクトリを削除
    rm -rf test-results/
    rm -rf playwright-report/
    
    log_success "クリーンアップ完了"
}

# 全処理実行
run_all() {
    log_info "全処理を開始します..."
    echo
    
    # 1. 依存関係チェック
    check_dependencies
    echo
    
    # 2. インストール
    install_dependencies
    echo
    
    # 3. テスト実行
    if run_tests "" "" ""; then
        echo
        # 4. レポート表示
        show_report
        echo
        log_success "全処理が正常に完了しました！"
    else
        echo
        log_error "テストが失敗しました"
        log_info "詳細はレポートを確認してください: ./run-tests.sh --report"
        exit 1
    fi
}

# 実行時間測定
start_time=$(date +%s)

# 引数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -i|--install)
            check_dependencies
            echo
            install_dependencies
            exit 0
            ;;
        -t|--test)
            TEST_FILE="$2"
            if [[ "$2" && "$2" != -* ]]; then
                shift
            else
                TEST_FILE=""
            fi
            SHOULD_TEST=true
            ;;
        -b|--browser)
            BROWSER="$2"
            if [[ "$2" && "$2" =~ ^(chromium|firefox|edge)$ ]]; then
                shift
            else
                log_error "無効なブラウザ: $2"
                log_info "利用可能: chromium, firefox, edge"
                exit 1
            fi
            ;;
        -u|--ui)
            MODE="ui"
            SHOULD_TEST=true
            ;;
        -d|--debug)
            MODE="debug"
            SHOULD_TEST=true
            ;;
        --headed)
            MODE="headed"
            SHOULD_TEST=true
            ;;
        -r|--report)
            show_report
            exit 0
            ;;
        -c|--clean)
            cleanup
            exit 0
            ;;
        -a|--all)
            run_all
            exit 0
            ;;
        *)
            log_error "不明なオプション: $1"
            show_help
            exit 1
            ;;
    esac
    shift
done

# テスト実行が指定された場合
if [ "$SHOULD_TEST" = true ]; then
    check_dependencies
    echo
    if run_tests "$TEST_FILE" "$BROWSER" "$MODE"; then
        echo
        end_time=$(date +%s)
        execution_time=$((end_time - start_time))
        log_success "実行時間: ${execution_time}秒"
        
        log_info "レポートを表示するには: ./run-tests.sh --report"
    else
        exit 1
    fi
    exit 0
fi

# オプションが指定されなかった場合はヘルプを表示
log_warning "オプションが指定されていません"
echo
show_help