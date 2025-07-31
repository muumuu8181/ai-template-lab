/**
 * Busy Time Tracker アプリケーション テスト設定
 */

module.exports = {
  // 基本情報
  appName: '忙しい人のタイムトラッカー',
  basePath: '/mnt/c/Users/user/published-apps/busy-time-tracker-app',
  htmlFile: 'index.html',
  scriptFile: null, // JavaScriptがHTMLに埋め込まれている
  mainClass: 'TimeTracker', // HTMLに埋め込まれたクラス名

  // 基本要素の検証
  expectedTitle: '忙しい人のタイムトラッカー',
  titleSelector: 'h1',

  // 必須DOM要素
  requiredElements: [
    {
      name: 'メインコンテナ',
      selector: '.container'
    },
    {
      name: '左パネル',
      selector: '.left-panel'
    },
    {
      name: '右パネル',
      selector: '.right-panel'
    },
    {
      name: '仕事ボタン',
      selector: '#btn-work'
    },
    {
      name: '休憩ボタン',
      selector: '#btn-break'
    },
    {
      name: '会議ボタン',
      selector: '#btn-meeting'
    },
    {
      name: 'カスタムボタン',
      selector: '#btn-custom'
    },
    {
      name: 'カスタムテキスト入力',
      selector: '#custom-text'
    },
    {
      name: 'カスタム開始ボタン',
      selector: '#start-custom'
    },
    {
      name: '文字数カウンター',
      selector: '#char-count'
    },
    {
      name: 'ボタングリッド',
      selector: '.button-grid'
    }
  ],

  // インタラクティブ要素
  interactiveElements: [
    {
      name: '仕事ボタン',
      selector: '#btn-work',
      expectedAttributes: {
        'data-category': 'Work',
        'id': 'btn-work'
      }
    },
    {
      name: '休憩ボタン',
      selector: '#btn-break',
      expectedAttributes: {
        'data-category': 'Break',
        'id': 'btn-break'
      }
    },
    {
      name: '会議ボタン',
      selector: '#btn-meeting',
      expectedAttributes: {
        'data-category': 'Meeting',
        'id': 'btn-meeting'
      }
    },
    {
      name: 'カスタム入力フィールド',
      selector: '#custom-text',
      expectedAttributes: {
        'maxlength': '50',
        'placeholder': 'カスタムアクティビティを入力（最大50文字）'
      }
    },
    {
      name: 'カスタム開始ボタン初期状態',
      selector: '#start-custom',
      expectedAttributes: {
        'disabled': ''
      }
    }
  ],

  // 組み合わせテスト
  combinationTests: [
    {
      name: 'カテゴリボタン全クリックテスト',
      selectors: {},
      targetButton: '#btn-work'
    },
    {
      name: '休憩ボタンクリックテスト',
      selectors: {},
      targetButton: '#btn-break'
    },
    {
      name: '会議ボタンクリックテスト',
      selectors: {},
      targetButton: '#btn-meeting'
    },
    {
      name: 'カスタムボタンクリックテスト',
      selectors: {},
      targetButton: '#btn-custom'
    }
  ],

  // カスタムテスト
  customTests: [
    {
      name: 'カテゴリボタンの数確認',
      testFunction: () => {
        const categoryButtons = document.querySelectorAll('.record-button[data-category]');
        const expectedCount = 4; // Work, Break, Meeting, Custom
        return {
          success: categoryButtons.length === expectedCount,
          message: `カテゴリボタン数: ${categoryButtons.length} (期待値: ${expectedCount})`
        };
      }
    },
    {
      name: 'カテゴリボタンの内容確認',
      testFunction: () => {
        const workBtn = document.querySelector('#btn-work .label');
        const breakBtn = document.querySelector('#btn-break .label');
        const meetingBtn = document.querySelector('#btn-meeting .label');
        const customBtn = document.querySelector('#btn-custom .label');
        
        const expectedLabels = {
          work: '仕事',
          break: '休憩',
          meeting: '会議',
          custom: 'カスタム'
        };
        
        const actualLabels = {
          work: workBtn?.textContent,
          break: breakBtn?.textContent,
          meeting: meetingBtn?.textContent,
          custom: customBtn?.textContent
        };
        
        const allCorrect = 
          actualLabels.work === expectedLabels.work &&
          actualLabels.break === expectedLabels.break &&
          actualLabels.meeting === expectedLabels.meeting &&
          actualLabels.custom === expectedLabels.custom;
        
        return {
          success: allCorrect,
          message: `ボタンラベル - 仕事:"${actualLabels.work}", 休憩:"${actualLabels.break}", 会議:"${actualLabels.meeting}", カスタム:"${actualLabels.custom}"`
        };
      }
    },
    {
      name: 'アイコンの存在確認',
      testFunction: () => {
        const workIcon = document.querySelector('#btn-work .icon');
        const breakIcon = document.querySelector('#btn-break .icon');
        const meetingIcon = document.querySelector('#btn-meeting .icon');
        const customIcon = document.querySelector('#btn-custom .icon');
        
        const expectedIcons = {
          work: '💼',
          break: '☕',
          meeting: '👥',
          custom: '✏️'
        };
        
        const actualIcons = {
          work: workIcon?.textContent,
          break: breakIcon?.textContent,
          meeting: meetingIcon?.textContent,
          custom: customIcon?.textContent
        };
        
        const allCorrect = 
          actualIcons.work === expectedIcons.work &&
          actualIcons.break === expectedIcons.break &&
          actualIcons.meeting === expectedIcons.meeting &&
          actualIcons.custom === expectedIcons.custom;
        
        return {
          success: allCorrect,
          message: `アイコン - 仕事:${actualIcons.work}, 休憩:${actualIcons.break}, 会議:${actualIcons.meeting}, カスタム:${actualIcons.custom}`
        };
      }
    },
    {
      name: '文字数カウンターの初期値',
      testFunction: () => {
        const charCount = document.querySelector('#char-count');
        const expectedCount = '0';
        return {
          success: charCount && charCount.textContent === expectedCount,
          message: `文字数カウンター: "${charCount?.textContent}" (期待値: "${expectedCount}")`
        };
      }
    },
    {
      name: 'レイアウト構造確認',
      testFunction: () => {
        const container = document.querySelector('.container');
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');
        
        // CSSスタイルの確認（概算）
        const containerExists = !!container;
        const leftPanelExists = !!leftPanel;
        const rightPanelExists = !!rightPanel;
        
        const allExists = containerExists && leftPanelExists && rightPanelExists;
        
        return {
          success: allExists,
          message: `レイアウト要素 - コンテナ:${containerExists}, 左パネル:${leftPanelExists}, 右パネル:${rightPanelExists}`
        };
      }
    },
    {
      name: 'サブタイトルの確認',
      testFunction: () => {
        const subtitle = document.querySelector('.subtitle');
        const expectedText = 'ワンクリックで活動を記録（静的バージョン）';
        return {
          success: subtitle && subtitle.textContent.includes(expectedText),
          message: subtitle ? `サブタイトル: "${subtitle.textContent}"` : 'サブタイトル要素が見つかりません'
        };
      }
    }
  ]
};