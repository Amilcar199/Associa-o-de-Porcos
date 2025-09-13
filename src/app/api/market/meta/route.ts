export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { successResponse } from '@/lib/api-utils'

export async function GET() {
  return NextResponse.json(successResponse({
    lastUpdated: null,
    regions: [],
    breeds: [],
    methodology: {
      pt: '',
      en: ''
    },
    dataSource: '',
    volumeSeriesAvailable: false,
    notes: ''
  }))
}

