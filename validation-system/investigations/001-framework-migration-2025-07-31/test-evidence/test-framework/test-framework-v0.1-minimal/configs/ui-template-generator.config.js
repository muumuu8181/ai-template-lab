/**
 * UI Template Generator v0.43 テスト設定
 */

module.exports = {
  // 基本情報
  appName: 'UI Template Generator v0.43',
  basePath: '/mnt/c/Users/user/ui-template-generator',
  htmlFile: 'index.html',
  scriptFile: 'script.js',
  mainClass: 'UITemplateGenerator',
  instancePath: 'window.uiTemplateGenerator', // インスタンスへのパス

  // 基本要素の検証
  expectedTitle: 'UI Template Generator v0.43',
  titleSelector: 'h1',

  // 必須DOM要素
  requiredElements: [
    {
      name: '新規グループボタン',
      selector: '#newGroupBtn'
    },
    {
      name: '全クリアボタン',
      selector: '#clearBtn'
    },
    {
      name: '全グループチェックボタン',
      selector: '#selectAllBtn'
    },
    {
      name: '全グループ外すボタン',
      selector: '#deselectAllBtn'
    },
    {
      name: '横1列にまとめるボタン',
      selector: '#mergeGroupsBtn'
    },
    {
      name: '反映ボタン',
      selector: '#applySizeBtn'
    },
    {
      name: 'プレビューエリア',
      selector: '#previewArea'
    },
    {
      name: 'プレースホルダー',
      selector: '.placeholder'
    },
    {
      name: '横セレクター',
      selector: '#colsSelector'
    },
    {
      name: '縦セレクター',
      selector: '#rowsSelector'
    },
    {
      name: '幅セレクター',
      selector: '#widthSelector'
    },
    {
      name: '高さセレクター',
      selector: '#heightSelector'
    },
    {
      name: '色セレクター',
      selector: '#colorSelector'
    },
    {
      name: '操作履歴パネル',
      selector: '#operationLogPanel'
    },
    {
      name: 'ログコピーボタン',
      selector: '#copyLogBtn'
    }
  ],

  // インタラクティブ要素
  interactiveElements: [
    {
      name: '新規グループボタン',
      selector: '#newGroupBtn',
      expectedAttributes: {
        'type': null, // buttonタグなのでtype属性なし
        'id': 'newGroupBtn'
      }
    },
    {
      name: '横セレクターのデフォルト選択',
      selector: '#colsSelector .selected',
      expectedAttributes: {
        'data-value': '1'
      }
    },
    {
      name: '縦セレクターのデフォルト選択',
      selector: '#rowsSelector .selected',
      expectedAttributes: {
        'data-value': '3'
      }
    },
    {
      name: '幅セレクターのデフォルト選択',
      selector: '#widthSelector .selected',
      expectedAttributes: {
        'data-value': '100'
      }
    },
    {
      name: '高さセレクターのデフォルト選択',
      selector: '#heightSelector .selected',
      expectedAttributes: {
        'data-value': '40'
      }
    }
  ],

  // 組み合わせテスト
  combinationTests: [
    {
      name: 'セレクター全組み合わせでの新規グループ作成テスト',
      selectors: {
        '#colsSelector': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        '#rowsSelector': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        '#widthSelector': ['20', '40', '60', '80', '100', '120', '140', '160'],
        '#heightSelector': ['20', '30', '40', '50', '60', '70']
      },
      targetButton: '#newGroupBtn'
    },
    {
      name: 'セレクター変更後の反映ボタンテスト',
      selectors: {
        '#colsSelector': ['1', '3', '5', '10'],
        '#rowsSelector': ['1', '3', '7', '10'],
        '#widthSelector': ['40', '80', '120', '160'],
        '#heightSelector': ['30', '40', '60', '70']
      },
      targetButton: '#applySizeBtn'
    }
  ],

  // カスタムテスト
  customTests: [
    {
      name: 'プレースホルダーのテキスト確認',
      testFunction: () => {
        const placeholder = document.querySelector('.placeholder');
        const expectedText = '設定を選択してボタンを生成してください';
        return {
          success: placeholder && placeholder.textContent.includes(expectedText),
          message: placeholder ? `実際のテキスト: "${placeholder.textContent}"` : 'プレースホルダー要素が見つかりません'
        };
      }
    },
    {
      name: '初期状態でのグループ数確認',
      testFunction: () => {
        const groups = document.querySelectorAll('.button-group');
        return {
          success: groups.length === 0,
          message: `グループ数: ${groups.length} (期待値: 0)`
        };
      }
    },
    {
      name: 'セレクターボタンの数確認',
      testFunction: () => {
        const colsButtons = document.querySelectorAll('#colsSelector .selector-btn');
        const rowsButtons = document.querySelectorAll('#rowsSelector .selector-btn');
        const widthButtons = document.querySelectorAll('#widthSelector .selector-btn');
        const heightButtons = document.querySelectorAll('#heightSelector .selector-btn');
        
        const expected = { cols: 10, rows: 10, width: 8, height: 6 };
        const actual = {
          cols: colsButtons.length,
          rows: rowsButtons.length,
          width: widthButtons.length,
          height: heightButtons.length
        };
        
        const allCorrect = 
          actual.cols === expected.cols &&
          actual.rows === expected.rows &&
          actual.width === expected.width &&
          actual.height === expected.height;
        
        return {
          success: allCorrect,
          message: `セレクター数 - 横:${actual.cols}(期待:${expected.cols}), 縦:${actual.rows}(期待:${expected.rows}), 幅:${actual.width}(期待:${expected.width}), 高さ:${actual.height}(期待:${expected.height})`
        };
      }
    },
    {
      name: '色セレクターの数確認',
      testFunction: () => {
        const colorButtons = document.querySelectorAll('#colorSelector .color-btn');
        const expectedCount = 8;
        return {
          success: colorButtons.length === expectedCount,
          message: `色選択肢数: ${colorButtons.length} (期待値: ${expectedCount})`
        };
      }
    },
    {
      name: 'レイアウトコントロールパネルの初期状態',
      testFunction: () => {
        const layoutPanel = document.getElementById('layoutControlPanel');
        const groupPanel = document.getElementById('groupControlPanel');
        
        const layoutHidden = layoutPanel && layoutPanel.style.display === 'none';
        const groupHidden = groupPanel && groupPanel.style.display === 'none';
        
        return {
          success: layoutHidden && groupHidden,
          message: `レイアウトパネル表示: ${layoutPanel?.style.display}, グループパネル表示: ${groupPanel?.style.display} (両方ともnoneが期待値)`
        };
      }
    },
    {
      name: '操作ログの初期状態確認',
      testFunction: () => {
        const logPlaceholder = document.querySelector('.log-placeholder');
        const expectedText = 'まだ操作履歴がありません';
        
        return {
          success: logPlaceholder && logPlaceholder.textContent.includes(expectedText),
          message: logPlaceholder ? `ログ初期メッセージ: "${logPlaceholder.textContent}"` : 'ログプレースホルダーが見つかりません'
        };
      }
    },
    {
      name: '高さ変更の反映テスト',
      testFunction: () => {
        // UITemplateGeneratorインスタンスを取得
        const generator = window.uiTemplateGenerator;
        if (!generator) {
          return { success: false, message: 'UITemplateGeneratorインスタンスが見つかりません' };
        }
        
        // 新規グループを作成
        generator.createNewGroup();
        
        // グループが作成されたか確認
        const group = document.querySelector('.button-group');
        if (!group) {
          return { success: false, message: 'グループが作成されませんでした' };
        }
        
        // チェックボックスをチェック
        const checkbox = group.querySelector('.group-checkbox');
        if (checkbox) {
          checkbox.checked = true;
          const event = document.createEvent('Event');
          event.initEvent('change', true, true);
          checkbox.dispatchEvent(event);
        }
        
        // 高さを60に変更
        const heightBtn = document.querySelector('#heightSelector [data-value="60"]');
        if (heightBtn) {
          const clickEvent = document.createEvent('Event');
          clickEvent.initEvent('click', true, true);
          heightBtn.dispatchEvent(clickEvent);
        }
        
        // 反映ボタンをクリック
        const applyBtn = document.querySelector('#applySizeBtn');
        if (applyBtn) {
          const clickEvent = document.createEvent('Event');
          clickEvent.initEvent('click', true, true);
          applyBtn.dispatchEvent(clickEvent);
        }
        
        // ボタンの高さを確認
        const button = group.querySelector('.generated-button');
        if (!button) {
          return { success: false, message: 'ボタンが見つかりません' };
        }
        
        const actualHeight = button.style.height;
        const expectedHeight = '60px';
        const success = actualHeight === expectedHeight;
        
        return {
          success: success,
          message: `ボタンの高さ: ${actualHeight} (期待値: ${expectedHeight})`
        };
      }
    },
    {
      name: '横1列にまとめる機能テスト',
      testFunction: () => {
        const generator = window.uiTemplateGenerator;
        if (!generator) {
          return { success: false, message: 'UITemplateGeneratorインスタンスが見つかりません' };
        }
        
        // 既存のグループをクリア
        generator.clearPreview();
        
        // 2つのグループを作成
        generator.createNewGroup();
        generator.createNewGroup();
        
        // 両方のグループにチェック
        const checkboxes = document.querySelectorAll('.group-checkbox');
        checkboxes.forEach(checkbox => {
          checkbox.checked = true;
          const event = document.createEvent('Event');
          event.initEvent('change', true, true);
          checkbox.dispatchEvent(event);
        });
        
        // まとめるボタンをクリック
        try {
          generator.mergeSelectedGroups();
          
          // 結果を確認
          const groupRows = document.querySelectorAll('.group-row');
          const mergedGroups = groupRows[0] ? groupRows[0].querySelectorAll('.button-group').length : 0;
          
          return {
            success: groupRows.length > 0 && mergedGroups === 2,
            message: `group-row数: ${groupRows.length}, 横並びグループ数: ${mergedGroups} (期待値: 1行に2グループ)`
          };
        } catch (error) {
          return {
            success: false,
            message: `エラー発生: ${error.message}`
          };
        }
      }
    }
  ]
};