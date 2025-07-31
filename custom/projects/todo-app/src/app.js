// Todo アプリケーション - ai-template-lab v1.0
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.logger = new OperationLogger();
        
        this.init();
    }

    init() {
        // DOM要素の取得
        this.todoInput = document.getElementById('todoInput');
        this.addButton = document.getElementById('addButton');
        this.todoList = document.getElementById('todoList');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // イベントリスナーの設定
        this.addButton.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // 初期表示
        this.render();
        this.updateStats();
        
        this.logger.addLog('アプリケーション起動', 'Todo アプリを初期化しました');
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (!text) {
            this.logger.addLog('入力エラー', 'タスクが空です', 'error');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(todo);
        this.saveTodos();
        this.todoInput.value = '';
        
        this.logger.addLog('タスク追加', `"${text}" を追加しました`);
        
        this.render();
        this.updateStats();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            
            this.logger.addLog('タスク状態変更', 
                `"${todo.text}" を${todo.completed ? '完了' : '未完了'}にしました`);
            
            this.render();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            
            this.logger.addLog('タスク削除', `"${todo.text}" を削除しました`);
            
            this.render();
            this.updateStats();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // フィルターボタンの状態を更新
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.logger.addLog('フィルター変更', `表示を "${filter}" に切り替えました`);
        
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        this.todoList.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-content">
                    <input type="checkbox" 
                           class="todo-checkbox" 
                           ${todo.completed ? 'checked' : ''}
                           onchange="app.toggleTodo(${todo.id})">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                </div>
                <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">削除</button>
            </div>
        `).join('');
        
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">タスクがありません</p>';
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('activeCount').textContent = active;
        document.getElementById('completedCount').textContent = completed;
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 操作ログ管理クラス
class OperationLogger {
    constructor() {
        this.logContainer = document.getElementById('logContainer');
        this.logs = [];
    }

    addLog(action, details, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('ja-JP');
        const logEntry = { timestamp, action, details, type };
        
        this.logs.push(logEntry);
        this.renderLog(logEntry);
        
        // 空メッセージを削除
        const emptyMsg = this.logContainer.querySelector('.log-empty');
        if (emptyMsg) emptyMsg.remove();
        
        // スクロール
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    renderLog(entry) {
        const logDiv = document.createElement('div');
        logDiv.className = 'log-entry';
        
        const timeSpan = document.createElement('span');
        timeSpan.style.color = '#4facfe';
        timeSpan.textContent = `[${entry.timestamp}] `;
        
        const actionSpan = document.createElement('span');
        actionSpan.style.color = entry.type === 'error' ? '#e74c3c' : '#2ecc71';
        actionSpan.textContent = entry.action;
        
        const detailsSpan = document.createElement('span');
        detailsSpan.style.color = '#f39c12';
        detailsSpan.textContent = ` → ${entry.details}`;
        
        logDiv.appendChild(timeSpan);
        logDiv.appendChild(actionSpan);
        if (entry.details) {
            logDiv.appendChild(detailsSpan);
        }
        
        this.logContainer.appendChild(logDiv);
    }
}

// アプリケーションの初期化
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});