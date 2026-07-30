import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  const url = process.env.DATABASE_URL || ''
  const masked = url ? url.replace(/(postgresql:\/\/[^:]+:)([^@]+)(@.*)/, '$1***$3') : 'NOT SET'

  const results: Record<string, unknown>[] = []

  for (const port of [5432, 6543]) {
    const testUrl = url.replace(/:6543|:5432/, `:${port}`)
    try {
      const pool = new Pool({ connectionString: testUrl, family: 4 } as any)
      const r = await pool.query('SELECT 1 AS ok')
      await pool.end()
      results.push({ port, family: 4, status: 'OK' })
    } catch (e: unknown) {
      const err = e as Error
      results.push({ port, family: 4, status: 'FAIL', error: err.message?.substring(0, 100) })
    }
  }

  return NextResponse.json({
    currentPort: url.includes(':6543') ? 6543 : url.includes(':5432') ? 5432 : 'unknown',
    maskedUrl: masked,
    tests: results,
  })
}
