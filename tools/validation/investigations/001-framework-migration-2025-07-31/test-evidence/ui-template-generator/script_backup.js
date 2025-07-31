class UITemplateGenerator {
    constructor() {
        this.rowsSelector = document.getElementById('rowsSelector');
        this.colsSelector = document.getElementById('colsSelector');
        this.clearBtn = document.getElementById('clearBtn');
        this.newGroupBtn = document.getElementById('newGroupBtn');
        this.previewArea = document.getElementById('previewArea');
        this.widthSelector = document.getElementById('widthSelector');
        this.heightSelector = document.getElementById('heightSelector');
        this.alignSelector = document.getElementById('alignSelector');
        this.colorSelector = document.getElementById('colorSelector');
        this.applySizeBtn = document.getElementById('applySizeBtn');
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.deselectAllBtn = document.getElementById('deselectAllBtn');
        this.messageArea = document.getElementById('messageArea');
        this.layoutControlPanel = document.getElementById('layoutControlPanel');
        
        this.selectedRows = 3;
        this.selectedCols = 1;
        this.selectedWidth = 100;
        this.selectedHeight = 40;
        this.selectedAlign = 'start';
        this.selectedColor = '#34495e';
        
        this.buttonGroups = [];
        this.groupCounter = 0;
        this.selectedGroupIds = [];
        this.layoutColumns = 1;
        this.groupLayoutContainer = null;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.clearBtn.addEventListener('click', () => this.clearPreview());
        this.newGroupBtn.addEventListener('click', () => this.createNewGroup());
        this.applySizeBtn.addEventListener('click', () => this.applyButtonSize());
        this.selectAllBtn.addEventListener('click', () => this.selectAllGroups());
        this.deselectAllBtn.addEventListener('click', () => this.deselectAllGroups());
        
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
        
        // レイアウトボタンセレクター
        const layoutButtons = this.layoutControlPanel.querySelectorAll('.layout-btn');
        layoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                layoutButtons.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.layoutColumns = parseInt(e.target.dataset.cols);
                this.updateGroupLayout();
            });
        });
    }
    
    showMessage(message, type = 'info') {
        this.messageArea.className = `message-area show ${type}`;
        this.messageArea.textContent = message;
        
        // 3秒後に自動的に非表示
        setTimeout(() => {
            this.messageArea.classList.remove('show');
        }, 3000);
    }
    
    selectAllGroups() {
        const checkboxes = document.querySelectorAll('.group-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateSelectedGroups();
        this.showMessage(`全${checkboxes.length}グループを選択しました`, 'success');
    }
    
    deselectAllGroups() {
        const checkboxes = document.querySelectorAll('.group-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectedGroups();
        this.showMessage('全グループの選択を解除しました', 'info');
    }
    
    updateGroupLayout() {
        if (!this.groupLayoutContainer || this.buttonGroups.length === 0) return;
        
        this.groupLayoutContainer.className = `group-layout-container cols-${this.layoutColumns}`;
        this.showMessage(`グループを${this.layoutColumns}列に配置しました`, 'success');
    }
    
    handleButtonClick(buttonNumber) {
        this.showMessage(`ボタン ${buttonNumber} がクリックされました！`, 'info');
    }
    
    clearPreview() {
        this.previewArea.innerHTML = '<p class="placeholder">設定を選択してボタンを生成してください</p>';
        this.buttonGroups = [];
        this.groupCounter = 0;
        this.groupLayoutContainer = null;
        this.layoutControlPanel.style.display = 'none';
        this.showMessage('全てクリアしました', 'info');
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
        }
        
        this.groupCounter++;
        const groupId = `group-${this.groupCounter}`;
        
        // グループコンテナ作成
        const groupContainer = document.createElement('div');
        groupContainer.className = 'button-group';
        groupContainer.id = groupId;
        
        // ドラッグハンドル追加
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '☰';
        dragHandle.title = 'ドラッグして順序を変更';
        
        // グループヘッダー作成
        const groupHeader = document.createElement('div');
        groupHeader.className = 'button-group-header';
        
        const groupTitle = document.createElement('div');
        groupTitle.className = 'button-group-title';
        groupTitle.textContent = `グループ ${this.groupCounter} (${rows}×${cols})`;
        
        const groupControls = document.createElement('div');
        groupControls.className = 'group-controls';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'group-checkbox';
        checkbox.id = `checkbox-${groupId}`;
        checkbox.addEventListener('change', () => this.updateSelectedGroups());
        
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
        
        groupContainer.appendChild(dragHandle);
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
            }
            
            this.showMessage('グループを削除しました', 'info');
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
    }
    
    showError(message) {
        this.previewArea.innerHTML = `<p style="color: #e74c3c; text-align: center; margin-top: 50px;">${message}</p>`;
    }
    
    applyButtonSize() {
        if (this.selectedGroupIds.length > 0) {
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
                    buttons.forEach(button => {
                        button.style.width = `${this.selectedWidth}px`;
                        button.style.height = `${this.selectedHeight}px`;
                        button.style.minWidth = 'unset';
                        if (this.selectedColor) {
                            button.style.backgroundColor = this.selectedColor;
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
            
            // チェックボックスをクリア
            document.querySelectorAll('.group-checkbox:checked').forEach(checkbox => {
                checkbox.checked = false;
            });
            this.updateSelectedGroups();
            this.showMessage(`${this.selectedGroupIds.length}グループに設定を反映しました`, 'success');
        } else {
            // チェックなしの場合はエラーメッセージを表示
            this.showMessage('反映するグループにチェックを入れてください', 'error');
            return;
        }
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new UITemplateGenerator();
});