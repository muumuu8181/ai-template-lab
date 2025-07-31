module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  collectCoverageFrom: [
    '../*.js',
    '!**/node_modules/**'
  ],
  verbose: true,
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './html-report',
        filename: 'report.html',
        pageTitle: 'UI Template Generator テスト結果',
        logoImgPath: '',
        hideIcon: false,
        expand: true,
        openReport: false,
        dateFormat: 'yyyy/mm/dd HH:MM:ss'
      }
    ]
  ]
};