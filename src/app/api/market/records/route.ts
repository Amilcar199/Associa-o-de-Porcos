export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { successResponse } from '@/lib/api-utils'

export async function GET() {
  return NextResponse.json(successResponse({
    unit: 'kg',
    records: [],
    anchor: { ref: null, bandPct: 0.1 }
  }))
}

