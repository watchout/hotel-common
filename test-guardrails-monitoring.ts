// 🧪 ガードレール監視テスト用ファイル
// このファイルを編集してBackground Agentの反応をテスト

interface TestInterface {
  id: string;
  name: string;
}

// TypeScriptエラーを意図的に作成（ガードレール検知テスト）
function testFunction(param: TestInterface) {
  console.log("監視テスト開始");
  
  // 意図的な型エラー（ガードレールが検知すべき）
  const wrongType: number = "これは文字列です"; // Type error
  
  console.log("テスト完了");
} 