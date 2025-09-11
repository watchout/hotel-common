import axios from 'axios'

type TestCase = {
  name: string
  run: () => Promise<boolean>
}

const BASE_URL = process.env.HOTEL_COMMON_BASE_URL || 'http://localhost:3400'

// 既存のテストデータに合わせた既知のアカウント
const KNOWN_EMAIL = process.env.TEST_EMAIL || 'admin@omotenasuai.com'
const KNOWN_PASSWORD = process.env.TEST_PASSWORD || 'admin123'

async function login(email: string, password: string, tenantId?: string) {
  return axios.post(`${BASE_URL}/api/v1/auth/login`, {
    email,
    password,
    ...(tenantId ? { tenantId } : {}),
  })
}

const tests: TestCase[] = [
  {
    name: '成功: 正しいメール/パスワードで200',
    run: async () => {
      try {
        const res = await login(KNOWN_EMAIL, KNOWN_PASSWORD)
        const ok = res.status === 200 && !!res.data?.data?.accessToken
        if (!ok) {
          console.error('期待レスポンス不一致:', res.status, res.data)
        }
        return ok
      } catch (e: any) {
        console.error('リクエスト失敗:', e.response?.status, e.response?.data || e.message)
        return false
      }
    },
  },
  {
    name: '失敗: パスワード不一致で401',
    run: async () => {
      try {
        await login(KNOWN_EMAIL, 'this-is-wrong-password')
        console.error('想定外: 不一致でも成功した')
        return false
      } catch (e: any) {
        const status = e.response?.status
        if (status !== 401) {
          console.error('期待ステータス401, 実際:', status, e.response?.data || e.message)
          return false
        }
        return true
      }
    },
  },
  {
    name: '失敗: 未登録メールで401',
    run: async () => {
      try {
        await login('non-existent-user@example.com', 'whatever-password')
        console.error('想定外: 未登録でも成功した')
        return false
      } catch (e: any) {
        const status = e.response?.status
        if (status !== 401) {
          console.error('期待ステータス401, 実際:', status, e.response?.data || e.message)
          return false
        }
        return true
      }
    },
  },
]

async function main() {
  console.log(`🔐 Auth Login テスト開始 (BASE_URL=${BASE_URL})`)
  let allPass = true
  for (const t of tests) {
    process.stdout.write(`- ${t.name} ... `)
    const ok = await t.run()
    if (ok) {
      console.log('OK')
    } else {
      console.log('NG')
      allPass = false
    }
  }
  if (!allPass) {
    process.exit(1)
  }
  console.log('✅ すべてのテストが成功しました')
}

main().catch((e) => {
  console.error('テスト実行エラー:', e)
  process.exit(1)
})


