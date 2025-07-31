class UITemplateGenerator {
    constructor() {
        this.rowsSelector = document.getElementById('rowsSelector');
        this.colsSelector = document.getElementById('colsSelector');
        this.clearBtn = document.getElementById('clearBtn');
        this.newGroupBtn = document.getElementById('newGroupBtn');
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.deselectAllBtn = document.getElementById('deselectAllBtn');
        this.previewArea = document.getElementById('previewArea');
        this.widthSelector = document.getElementById('widthSelector');
        this.heightSelector = document.getElementById('heightSelector');
        this.alignSelector = document.getElementById('alignSelector');
        this.colorSelector = document.getElementById('colorSelector');
        this.applySizeBtn = document.getElementById('applySizeBtn');
        this.layoutControlPanel = document.getElementById('layoutControlPanel');
        this.groupControlPanel = document.getElementById('groupControlPanel');
        
        this.selectedRows = 3;
        this.selectedCols = 1;
        this.selectedWidth = 100;
        this.selectedHeight = 40;
        this.selectedAlign = 'start';
        this.selectedColor = '#34495e';
        
        this.buttonGroups = [];
        this.groupCounter = 0;
        this.selectedGroupIds = [];
        this.groupLayoutContainer = null;
        this.mergeGroupsBtn = document.getElementById('mergeGroupsBtn');
        this.copyLogBtn = document.getElementById('copyLogBtn');
        this.logContent = document.getElementById('logContent');
        this.operationLog = [];
        this.activeGroupInfo = document.getElementById('activeGroupInfo');
        this.activeGroupId = null;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.clearBtn.addEventListener('click', () => this.clearPreview());
        this.newGroupBtn.addEventListener('click', () => this.createNewGroup());
        this.selectAllBtn.addEventListener('click', () => this.selectAllGroups());
        this.deselectAllBtn.addEventListener('click', () => this.deselectAllGroups());
        this.applySizeBtn.addEventListener('click', () => this.applyButtonSize());
        this.mergeGroupsBtn.addEventListener('click', () => this.mergeSelectedGroups());
        this.copyLogBtn.addEventListener('click', () => this.copyOperationLog());
        
        // 縦のボタンセレクター
        this.rowsSelector.querySelectorAll('.selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.rowsSelector.querySelector('.selected').classList.remove('selected');
                e.target.classList.add('selected');
                this.selectedRows = parseInt(e.target.dataset.value);
            });
        });
        
        // 横のボタンセレクター
        this.colsSelector.querySelectorAll('.selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.colsSelector.querySelector('.selected').classList.remove('selected');
                e.target.classList.add('selected');
                this.selectedCols = parseInt(e.target.dataset.value);
            });
        });
        
        // 幅のボタンセレクター
        this.widthSelector.querySelectorAll('.selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.widthSelector.querySelector('.selected').classList.remove('selected');
                e.target.classList.add('selected');
                this.selectedWidth = parseInt(e.target.dataset.value);
            });
        });
        
        // 高さのボタンセレクター
        this.heightSelector.querySelectorAll('.selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.heightSelector.querySelector('.selected').classList.remove('selected');
                e.target.classList.add('selected');
                this.selectedHeight = parseInt(e.target.dataset.value);
            });
        });
        
        // 配置のボタンセレクター
        this.alignSelector.querySelectorAll('.selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.alignSelector.querySelector('.selected').classList.remove('selected');
                e.target.classList.add('selected');
                this.selectedAlign = e.target.dataset.value;
            });
        });
        
        // 色のボタンセレクター
        this.colorSelector.querySelectorAll('.selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.colorSelector.querySelector('.selected').classList.remove('selected');
                e.target.classList.add('selected');
                this.selectedColor = e.target.dataset.value;
            });
        });
        
    }
    
    showMessage(message, type = 'info') {
        const messageArea = document.getElementById('messageArea');
        messageArea.textContent = message;
        messageArea.className = `message-area ${type}`;
        
        // 3秒後に自動的に非表示
        setTimeout(() => {
            messageArea.className = 'message-area';
        }, 3000);
    }
    
    addLog(action, details = {}) {
        const timestamp = new Date().toLocaleString('ja-JP');
        const logEntry = {
            timestamp,
            action,
            details,
            uiState: this.getCurrentUIState()
        };
        
        this.operationLog.push(logEntry);
        this.updateLogDisplay();
    }
    
    getCurrentUIState() {
        return {
            totalGroups: this.buttonGroups.length,
            groupDetails: this.buttonGroups.map(g => ({
                id: g.id,
                size: `${g.cols}×${g.rows}`,
                width: g.width,
                height: g.height
            })),
            mergedRows: this.groupLayoutContainer ? 
                this.groupLayoutContainer.querySelectorAll('.group-row').length : 0
        };
    }
    
    updateLogDisplay() {
        if (this.operationLog.length === 0) {
            this.logContent.innerHTML = '<p class="log-placeholder">まだ操作履歴がありません</p>';
            return;
        }
        
        const logHTML = this.operationLog.slice(-10).reverse().map(entry => `
            <div class="log-entry">
                <div class="log-timestamp">[${entry.timestamp}]</div>
                <div class="log-action">操作: ${entry.action}</div>
                ${Object.keys(entry.details).length > 0 ? 
                    `<div class="log-details">詳細: ${JSON.stringify(entry.details, null, 2)}</div>` : ''}
                <div class="log-result">UI状態: グループ数=${entry.uiState.totalGroups}, 横並び行数=${entry.uiState.mergedRows}</div>
            </div>
        `).join('');
        
        this.logContent.innerHTML = logHTML;
    }
    
    copyOperationLog() {
        const logText = this.operationLog.map(entry => 
            `[${entry.timestamp}] ${entry.action}\n詳細: ${JSON.stringify(entry.details)}\nUI状態: ${JSON.stringify(entry.uiState)}`
        ).join('\n\n');
        
        navigator.clipboard.writeText(logText).then(() => {
            this.showMessage('操作履歴をクリップボードにコピーしました', 'success');
        }).catch(() => {
            this.showMessage('コピーに失敗しました', 'error');
        });
    }
    
    handleButtonClick(buttonNumber) {
        this.showMessage(`${buttonNumber} がクリックされました！`, 'info');
    }
    
    clearPreview() {
        this.addLog('全グループをクリア');
        
        this.previewArea.innerHTML = '<p class="placeholder">設定を選択してボタンを生成してください</p>';
        this.buttonGroups = [];
        this.groupCounter = 0;
        this.groupLayoutContainer = null;
        this.layoutControlPanel.style.display = 'none';
        this.groupControlPanel.style.display = 'none';
        this.activeGroupId = null;
        this.activeGroupInfo.className = 'active-group-info';
        this.activeGroupInfo.innerHTML = '<span class="no-active-group">グループを選択してください</span>';
    }
    
    createNewGroup() {
        // 既存のグループがある場合はそのまま新規グループを追加
        this.addButtonGroup(this.selectedRows, this.selectedCols);
    }
    
    addButtonGroup(rows, cols) {
        // プレースホルダーを削除
        const placeholder = this.previewArea.querySelector('.placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // グループレイアウトコンテナがなければ作成
        if (!this.groupLayoutContainer) {
            this.groupLayoutContainer = document.createElement('div');
            this.groupLayoutContainer.className = 'group-layout-container cols-1';
            this.previewArea.appendChild(this.groupLayoutContainer);
            
            // レイアウトコントロールパネルを表示
            this.layoutControlPanel.style.display = 'block';
            this.groupControlPanel.style.display = 'block';
        }
        
        this.groupCounter++;
        const groupId = `group-${this.groupCounter}`;
        
        // グループコンテナ作成
        const groupContainer = document.createElement('div');
        groupContainer.className = 'button-group';
        groupContainer.id = groupId;
        groupContainer.addEventListener('click', (e) => {
            // チェックボックスやボタンのクリックではアクティブ化しない
            if (e.target.type === 'checkbox' || e.target.tagName === 'BUTTON') {
                return;
            }
            this.setActiveGroup(groupId);
        });
        
        // グループヘッダー作成
        const groupHeader = document.createElement('div');
        groupHeader.className = 'button-group-header';
        
        const groupTitle = document.createElement('div');
        groupTitle.className = 'button-group-title';
        groupTitle.textContent = `グループ ${this.groupCounter} (${cols}×${rows})`;
        
        const groupControls = document.createElement('div');
        groupControls.className = 'group-controls';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'group-checkbox';
        checkbox.id = `checkbox-${groupId}`;
        checkbox.addEventListener('change', (e) => {
            const groupInfo = this.buttonGroups.find(g => g.id === groupId);
            if (groupInfo) {
                this.addLog('グループチェック変更', {
                    groupId: groupId,
                    groupSize: `${groupInfo.cols}×${groupInfo.rows}`,
                    checked: e.target.checked
                });
            }
            this.updateSelectedGroups();
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-group-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.addEventListener('click', () => this.deleteGroup(groupId));
        
        groupControls.appendChild(checkbox);
        groupControls.appendChild(deleteBtn);
        groupHeader.appendChild(groupTitle);
        groupHeader.appendChild(groupControls);
        
        // ボタングリッド作成
        const container = document.createElement('div');
        container.className = 'button-grid';
        if (this.selectedAlign === 'center') {
            container.classList.add('align-center');
        } else if (this.selectedAlign === 'end') {
            container.classList.add('align-end');
        }
        container.style.gridTemplateColumns = `repeat(${cols}, ${this.selectedWidth}px)`;
        
        let buttonNumber = 1;
        for (let r = 1; r <= rows; r++) {
            for (let c = 1; c <= cols; c++) {
                const button = document.createElement('button');
                button.className = 'generated-button';
                button.textContent = `G${this.groupCounter}-${buttonNumber}`;
                button.style.width = `${this.selectedWidth}px`;
                button.style.height = `${this.selectedHeight}px`;
                button.style.minWidth = 'unset';
                button.style.backgroundColor = this.selectedColor;
                button.addEventListener('click', () => {
                    this.handleButtonClick(`グループ${this.groupCounter} ボタン${buttonNumber}`);
                });
                container.appendChild(button);
                buttonNumber++;
            }
        }
        
        groupContainer.appendChild(groupHeader);
        groupContainer.appendChild(container);
        this.groupLayoutContainer.appendChild(groupContainer);
        
        // グループ情報を保存
        this.buttonGroups.push({
            id: groupId,
            rows: rows,
            cols: cols,
            width: this.selectedWidth,
            height: this.selectedHeight,
            align: this.selectedAlign,
            color: this.selectedColor
        });
        
        this.addLog('新規グループ作成', {
            groupId: groupId,
            size: `${cols}×${rows}`,
            settings: {
                width: this.selectedWidth,
                height: this.selectedHeight,
                align: this.selectedAlign,
                color: this.selectedColor
            }
        });
    }
    
    deleteGroup(groupId) {
        const group = document.getElementById(groupId);
        if (group) {
            group.remove();
            this.buttonGroups = this.buttonGroups.filter(g => g.id !== groupId);
            
            // 全てのグループが削除されたらプレースホルダーを表示
            if (this.buttonGroups.length === 0) {
                this.previewArea.innerHTML = '<p class="placeholder">設定を選択してボタンを生成してください</p>';
                this.groupLayoutContainer = null;
                this.layoutControlPanel.style.display = 'none';
                this.groupControlPanel.style.display = 'none';
            }
            
            // 削除したグループがアクティブだった場合
            if (groupId === this.activeGroupId) {
                this.activeGroupId = null;
                this.activeGroupInfo.className = 'active-group-info';
                this.activeGroupInfo.innerHTML = '<span class="no-active-group">グループを選択してください</span>';
            }
            
            this.addLog('グループ削除', { deletedGroup: groupId });
        }
    }
    
    updateSelectedGroups() {
        this.selectedGroupIds = [];
        const checkboxes = document.querySelectorAll('.group-checkbox:checked');
        
        checkboxes.forEach(checkbox => {
            const groupId = checkbox.id.replace('checkbox-', '');
            this.selectedGroupIds.push(groupId);
        });
        
        // 反映ボタンのテキストを更新
        if (this.selectedGroupIds.length > 0) {
            this.applySizeBtn.textContent = `選択中(${this.selectedGroupIds.length})に反映`;
        } else {
            this.applySizeBtn.textContent = '反映';
        }
        
        // まとめるボタンの有効/無効を更新
        if (this.selectedGroupIds.length >= 2) {
            this.mergeGroupsBtn.disabled = false;
        } else {
            this.mergeGroupsBtn.disabled = true;
        }
    }
    
    applyButtonSize() {
        if (this.selectedGroupIds.length > 0) {
            // ログ用に選択されたグループIDを保存
            const targetGroups = [...this.selectedGroupIds];
            
            // チェックされたグループのみに反映
            this.selectedGroupIds.forEach(groupId => {
                const group = document.getElementById(groupId);
                const groupInfo = this.buttonGroups.find(g => g.id === groupId);
                
                if (group && groupInfo) {
                    const container = group.querySelector('.button-grid');
                    
                    // 配置の更新
                    container.classList.remove('align-center', 'align-end');
                    if (this.selectedAlign === 'center') {
                        container.classList.add('align-center');
                    } else if (this.selectedAlign === 'end') {
                        container.classList.add('align-end');
                    }
                    
                    // グリッドの列幅更新
                    container.style.gridTemplateColumns = `repeat(${groupInfo.cols}, ${this.selectedWidth}px)`;
                    
                    // ボタンサイズの更新
                    const buttons = container.querySelectorAll('.generated-button');
                    buttons.forEach((button, index) => {
                        const beforeHeight = button.style.height;
                        button.style.width = `${this.selectedWidth}px`;
                        button.style.height = `${this.selectedHeight}px`;
                        button.style.minWidth = 'unset';
                        if (this.selectedColor) {
                            button.style.backgroundColor = this.selectedColor;
                        }
                        // デバッグ: 最初のボタンだけログ出力
                        if (index === 0) {
                            console.log(`Button height changed: ${beforeHeight} → ${this.selectedHeight}px`);
                        }
                    });
                    
                    // グループ情報を更新
                    groupInfo.width = this.selectedWidth;
                    groupInfo.height = this.selectedHeight;
                    groupInfo.align = this.selectedAlign;
                    if (this.selectedColor) {
                        groupInfo.color = this.selectedColor;
                    }
                }
            });
            
            // ログに記録
            this.addLog('設定を反映', {
                targetGroups: targetGroups,
                settings: {
                    width: this.selectedWidth,
                    height: this.selectedHeight,
                    align: this.selectedAlign,
                    color: this.selectedColor
                }
            });
            
            // チェックボックスをクリア
            document.querySelectorAll('.group-checkbox:checked').forEach(checkbox => {
                checkbox.checked = false;
            });
            this.updateSelectedGroups();
            
            this.showMessage('選択したグループに設定を反映しました', 'success');
        } else {
            // チェックなしの場合はエラーメッセージ
            this.showMessage('反映するグループにチェックを入れてください', 'error');
            return;
        }
    }
    
    selectAllGroups() {
        const checkboxes = document.querySelectorAll('.group-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateSelectedGroups();
        if (checkboxes.length > 0) {
            this.addLog('全グループを選択', {
                groupCount: checkboxes.length
            });
            this.showMessage('全てのグループを選択しました', 'success');
        }
    }
    
    deselectAllGroups() {
        const checkboxes = document.querySelectorAll('.group-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectedGroups();
        if (checkboxes.length > 0) {
            this.addLog('全グループの選択を解除', {
                groupCount: checkboxes.length
            });
            this.showMessage('全てのグループの選択を解除しました', 'info');
        }
    }
    
    setActiveGroup(groupId) {
        // 以前のアクティブグループのスタイルを解除
        if (this.activeGroupId) {
            const prevActive = document.getElementById(this.activeGroupId);
            if (prevActive) {
                prevActive.classList.remove('active');
            }
        }
        
        // 新しいアクティブグループを設定
        const group = document.getElementById(groupId);
        const groupInfo = this.buttonGroups.find(g => g.id === groupId);
        
        if (group && groupInfo) {
            group.classList.add('active');
            this.activeGroupId = groupId;
            
            // グループの設定を上部セレクターに反映
            this.loadGroupSettings(groupInfo);
            
            // アクティブグループ情報を表示
            this.updateActiveGroupInfo(groupInfo);
            
            // ログに記録
            this.addLog('グループを選択', {
                groupId: groupId,
                groupSize: `${groupInfo.cols}×${groupInfo.rows}`,
                settings: {
                    width: groupInfo.width,
                    height: groupInfo.height,
                    align: groupInfo.align,
                    color: groupInfo.color
                }
            });
        }
    }
    
    loadGroupSettings(groupInfo) {
        // 横の設定を反映
        this.colsSelector.querySelector('.selected').classList.remove('selected');
        const colsBtn = this.colsSelector.querySelector(`[data-value="${groupInfo.cols}"]`);
        if (colsBtn) {
            colsBtn.classList.add('selected');
            this.selectedCols = groupInfo.cols;
        }
        
        // 縦の設定を反映
        this.rowsSelector.querySelector('.selected').classList.remove('selected');
        const rowsBtn = this.rowsSelector.querySelector(`[data-value="${groupInfo.rows}"]`);
        if (rowsBtn) {
            rowsBtn.classList.add('selected');
            this.selectedRows = groupInfo.rows;
        }
        
        // 幅の設定を反映
        this.widthSelector.querySelector('.selected').classList.remove('selected');
        const widthBtn = this.widthSelector.querySelector(`[data-value="${groupInfo.width}"]`);
        if (widthBtn) {
            widthBtn.classList.add('selected');
            this.selectedWidth = groupInfo.width;
        }
        
        // 高さの設定を反映
        this.heightSelector.querySelector('.selected').classList.remove('selected');
        const heightBtn = this.heightSelector.querySelector(`[data-value="${groupInfo.height}"]`);
        if (heightBtn) {
            heightBtn.classList.add('selected');
            this.selectedHeight = groupInfo.height;
        }
        
        // 配置の設定を反映
        this.alignSelector.querySelector('.selected').classList.remove('selected');
        const alignBtn = this.alignSelector.querySelector(`[data-value="${groupInfo.align}"]`);
        if (alignBtn) {
            alignBtn.classList.add('selected');
            this.selectedAlign = groupInfo.align;
        }
        
        // 色の設定を反映
        this.colorSelector.querySelector('.selected').classList.remove('selected');
        const colorBtn = this.colorSelector.querySelector(`[data-value="${groupInfo.color}"]`);
        if (colorBtn) {
            colorBtn.classList.add('selected');
            this.selectedColor = groupInfo.color;
        }
    }
    
    updateActiveGroupInfo(groupInfo) {
        this.activeGroupInfo.className = 'active-group-info has-selection';
        this.activeGroupInfo.innerHTML = `
            選択中: ${groupInfo.id} (${groupInfo.cols}×${groupInfo.rows}) - 
            幅: ${groupInfo.width}px, 高さ: ${groupInfo.height}px
        `;
    }
    
    mergeSelectedGroups() {
        if (this.selectedGroupIds.length < 2) {
            this.showMessage('まとめるには2つ以上のグループを選択してください', 'error');
            return;
        }
        
        // 既存のレイアウトをリセット
        this.resetGroupLayout();
        
        // 選択されたグループを同じ行に配置
        const groupRow = document.createElement('div');
        groupRow.className = 'group-row';
        
        // 最初の選択されたグループの位置を記憶（移動前に記憶）
        const firstGroup = document.getElementById(this.selectedGroupIds[0]);
        const insertBefore = firstGroup ? firstGroup : null;
        
        // 選択されたグループを移動
        const movedGroups = [];
        this.selectedGroupIds.forEach(groupId => {
            const group = document.getElementById(groupId);
            if (group) {
                groupRow.appendChild(group);
                group.classList.add('selected-for-merge');
                const groupInfo = this.buttonGroups.find(g => g.id === groupId);
                if (groupInfo) {
                    movedGroups.push(`${groupInfo.id}(${groupInfo.cols}×${groupInfo.rows})`);
                }
            }
        });
        
        // 横並びの行を挿入（全てのグループをgroupRowに移動した後）
        if (this.groupLayoutContainer) {
            this.groupLayoutContainer.appendChild(groupRow);
        }
        
        // チェックボックスをクリア
        document.querySelectorAll('.group-checkbox:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectedGroups();
        
        this.addLog('グループを横1列にまとめる', {
            mergedGroups: movedGroups,
            mergedCount: movedGroups.length
        });
        
        this.showMessage(`${movedGroups.length}つのグループを横1列にまとめました`, 'success');
    }
    
    resetGroupLayout() {
        // 既存のグループ行を解除
        const groupRows = this.groupLayoutContainer.querySelectorAll('.group-row');
        groupRows.forEach(row => {
            const groups = Array.from(row.querySelectorAll('.button-group'));
            groups.forEach(group => {
                group.classList.remove('selected-for-merge');
                this.groupLayoutContainer.appendChild(group);
            });
            row.remove();
        });
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    window.uiTemplateGenerator = new UITemplateGenerator();
});

// テスト環境用にクラスをエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UITemplateGenerator };
}