import { execSync } from 'child_process'
import path from 'path'

// __dirname here is packages/ide/src/tests/integration/
// 3 levels up → packages/ide/
const IDE_ROOT = path.resolve(__dirname, '../../..')
const TEST_DB_PATH = path.resolve(IDE_ROOT, 'prisma/test.db')

export default function globalSetup() {
  execSync('npx prisma migrate deploy', {
    cwd: IDE_ROOT,
    env: { ...process.env, DATABASE_URL: `file:${TEST_DB_PATH}` },
    stdio: 'pipe',
  })
}
