export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { successResponse } from '@/lib/api-utils'

export async function GET() {
  return NextResponse.json(successResponse({
    unit: 'kg',
    current: { avg: null, count: 0 },
    variation: { daily: null, weekly: null, monthly: null },
    officialRef: null,
    usedFallback: false
  }))
}

