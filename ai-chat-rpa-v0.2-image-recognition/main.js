const { app, BrowserWindow, ipcMain, screen, desktopCapturer } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let imageEditorWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    // 大きめのウィンドウ（デバッグ用）
    mainWindow = new BrowserWindow({
        width: 880,
        height: 1600,
        x: width - 900, // 画面右端
        y: 50,
        alwaysOnTop: true, // 常に最前面
        frame: false, // フレームレス
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    
    // 開発者ツールは無効（画面内ログを使用）
    // mainWindow.webContents.openDevTools();
}

// 画像編集ウィンドウを作成
function createImageEditorWindow(base64Image) {
    if (imageEditorWindow) {
        imageEditorWindow.close();
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    imageEditorWindow = new BrowserWindow({
        width: Math.min(1200, width - 100),
        height: Math.min(800, height - 100),
        x: 50,
        y: 50,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // 動的にHTMLを生成
    const editorHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>画像編集 - 範囲選択</title>
    <style>
        body {
            margin: 0;
            padding: 10px;
            background: #2d2d2d;
            color: #fff;
            font-family: 'Segoe UI', sans-serif;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .controls {
            display: flex;
            gap: 10px;
        }
        .btn {
            background: #0078d4;
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn:hover { background: #106ebe; }
        .btn-save { background: #16a085; }
        .btn-save:hover { background: #27ae60; }
        .btn-cancel { background: #e74c3c; }
        .btn-cancel:hover { background: #c0392b; }
        
        #canvas-container {
            position: relative;
            border: 2px solid #555;
            display: inline-block;
            background: #fff;
        }
        #screenshot-canvas {
            cursor: crosshair;
        }
        .selection-overlay {
            position: absolute;
            border: 2px dashed #ff0000;
            background: rgba(255, 0, 0, 0.1);
            pointer-events: none;
        }
        .instructions {
            margin-top: 10px;
            color: #ccc;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>📸 画像範囲選択</h3>
        <div class="controls">
            <button id="save-btn" class="btn btn-save">💾 範囲を保存</button>
            <button id="cancel-btn" class="btn btn-cancel">❌ キャンセル</button>
        </div>
    </div>
    
    <div id="canvas-container">
        <canvas id="screenshot-canvas"></canvas>
        <div id="selection-overlay" class="selection-overlay" style="display: none;"></div>
    </div>
    
    <div class="instructions">
        📍 ドラッグして範囲を選択してください。赤い点線で範囲が表示されます。
    </div>

    <script>
        const { ipcRenderer } = require('electron');
        
        const canvas = document.getElementById('screenshot-canvas');
        const ctx = canvas.getContext('2d');
        const overlay = document.getElementById('selection-overlay');
        const container = document.getElementById('canvas-container');
        
        let isSelecting = false;
        let startX, startY, endX, endY;
        let selection = null;
        
        // 画像を描画
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = 'data:image/png;base64,${base64Image}';
        
        // マウスイベント
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            isSelecting = true;
            overlay.style.display = 'block';
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isSelecting) return;
            
            const rect = canvas.getBoundingClientRect();
            endX = e.clientX - rect.left;
            endY = e.clientY - rect.top;
            
            const x = Math.min(startX, endX);
            const y = Math.min(startY, endY);
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            
            overlay.style.left = x + 'px';
            overlay.style.top = y + 'px';
            overlay.style.width = width + 'px';
            overlay.style.height = height + 'px';
        });
        
        canvas.addEventListener('mouseup', (e) => {
            if (!isSelecting) return;
            
            isSelecting = false;
            const rect = canvas.getBoundingClientRect();
            endX = e.clientX - rect.left;
            endY = e.clientY - rect.top;
            
            selection = {
                x: Math.min(startX, endX),
                y: Math.min(startY, endY),
                width: Math.abs(endX - startX),
                height: Math.abs(endY - startY)
            };
            
            console.log('選択範囲:', selection);
        });
        
        // 保存ボタン
        document.getElementById('save-btn').addEventListener('click', async () => {
            if (!selection) {
                alert('範囲を選択してください');
                return;
            }
            
            try {
                const result = await ipcRenderer.invoke('save-selection', {
                    base64Image: '${base64Image}',
                    selection: selection
                });
                
                alert('テンプレートを保存しました: ' + result);
                window.close();
            } catch (error) {
                alert('保存エラー: ' + error.message);
            }
        });
        
        // キャンセルボタン
        document.getElementById('cancel-btn').addEventListener('click', () => {
            window.close();
        });
    </script>
</body>
</html>`;

    // HTMLを一時ファイルに保存
    const tempHtmlPath = path.join(__dirname, 'temp-editor.html');
    fs.writeFileSync(tempHtmlPath, editorHTML);
    
    imageEditorWindow.loadFile(tempHtmlPath);
    
    imageEditorWindow.on('closed', () => {
        imageEditorWindow = null;
        
        // 一時ファイル削除
        try {
            fs.unlinkSync(tempHtmlPath);
        } catch (e) {
            console.log('一時ファイル削除エラー:', e.message);
        }
    });
}

// スクリーンショット取得（Electronネイティブ）
ipcMain.handle('take-screenshot', async () => {
    try {
        console.log('スクリーンショット撮影開始...');
        
        // デスクトップをキャプチャ
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });
        
        if (sources.length === 0) {
            throw new Error('スクリーンソースが見つかりません');
        }
        
        // 最初のスクリーンを使用
        const source = sources[0];
        const thumbnail = source.thumbnail;
        
        // PNG形式でバッファを取得
        const buffer = thumbnail.toPNG();
        console.log('スクリーンショット撮影成功:', buffer.length, 'bytes');
        
        // デバッグ用にファイルに保存
        const debugPath = path.join(__dirname, 'debug-screenshot.png');
        fs.writeFileSync(debugPath, buffer);
        console.log('デバッグ用スクリーンショット保存:', debugPath);
        
        // Base64に変換
        const base64Image = buffer.toString('base64');
        
        // 画像編集ウィンドウを開く
        createImageEditorWindow(base64Image);
        
        return base64Image;
    } catch (error) {
        console.error('スクリーンショットエラー:', error);
        throw new Error(`スクリーンショット失敗: ${error.message}`);
    }
});

// ChatGPTを開く（普通のブラウザで）
ipcMain.handle('open-chatgpt', async () => {
    try {
        const { shell } = require('electron');
        await shell.openExternal('https://chat.openai.com');
        return 'ChatGPTを既定のブラウザで開きました';
    } catch (error) {
        console.error('ChatGPT起動エラー:', error);
        throw error;
    }
});

// Geminiを開く（普通のブラウザで）
ipcMain.handle('open-gemini', async () => {
    try {
        const { shell } = require('electron');
        await shell.openExternal('https://gemini.google.com');
        return 'Geminiを既定のブラウザで開きました';
    } catch (error) {
        console.error('Gemini起動エラー:', error);
        throw error;
    }
});

// 選択範囲を保存
ipcMain.handle('save-selection', async (event, data) => {
    try {
        const { base64Image, selection } = data;
        
        // JIMPを使って画像処理
        const { Jimp } = require('jimp');
        const imageBuffer = Buffer.from(base64Image, 'base64');
        
        // 画像を読み込み
        const image = await Jimp.fromBuffer(imageBuffer);
        
        // 選択範囲を切り出し
        const croppedImage = image.crop({
            x: selection.x, 
            y: selection.y, 
            w: selection.width, 
            h: selection.height
        });
        
        // PNG画像として保存
        const templateName = `template_${Date.now()}`;
        const templatePath = path.join(__dirname, 'templates', `${templateName}.png`);
        
        // templatesディレクトリが存在しない場合は作成
        const templatesDir = path.join(__dirname, 'templates');
        if (!fs.existsSync(templatesDir)) {
            fs.mkdirSync(templatesDir);
        }
        
        // PNG画像として保存
        await croppedImage.write(templatePath);
        console.log('テンプレート画像保存完了:', templatePath);
        
        // メインウィンドウにログを送信
        if (mainWindow) {
            mainWindow.webContents.send('template-saved', `テンプレート画像保存完了: ${templateName}.png`);
        }
        
        return templateName;
        
    } catch (error) {
        console.error('選択範囲保存エラー:', error);
        
        // メインウィンドウにエラーログを送信
        if (mainWindow) {
            mainWindow.webContents.send('template-saved', `保存エラー: ${error.message}`);
        }
        
        throw error;
    }
});

// 簡単なメッセージ送信（画像認識なし、キーボードのみ）
ipcMain.handle('send-message', async (event, message) => {
    try {
        // 現在はキーボード操作なし（robotjs無し）
        // 将来的に画像認識で実装予定
        return `メッセージ送信機能は開発中です: "${message}"`;
        
    } catch (error) {
        console.error('メッセージ送信エラー:', error);
        throw error;
    }
});

// ウィンドウドラッグ機能
ipcMain.handle('start-drag', (event) => {
    mainWindow.setMovable(true);
});

ipcMain.handle('move-window', (event, deltaX, deltaY) => {
    const [currentX, currentY] = mainWindow.getPosition();
    mainWindow.setPosition(currentX + deltaX, currentY + deltaY);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});