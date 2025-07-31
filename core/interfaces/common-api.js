/**
 * 共通インターフェース定義
 * すべてのツールはこのインターフェースに準拠する必要があります
 */

class ToolInterface {
  constructor(config) {
    this.config = config;
    this.version = '1.0.0';
  }

  /**
   * 入力データの検証
   * @param {Object} input - 入力データ
   * @returns {Boolean} 検証結果
   */
  validateInput(input) {
    throw new Error('validateInput must be implemented');
  }

  /**
   * ツールの実行
   * @param {Object} input - 入力データ
   * @returns {Object} 実行結果
   */
  execute(input) {
    throw new Error('execute must be implemented');
  }

  /**
   * 出力データのフォーマット
   * @param {Object} result - 実行結果
   * @returns {Object} フォーマット済み出力
   */
  formatOutput(result) {
    return {
      success: true,
      data: result,
      metadata: {
        tool: this.constructor.name,
        version: this.version,
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = ToolInterface;