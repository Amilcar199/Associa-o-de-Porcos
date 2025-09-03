import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = (searchParams.get('from') || 'AOA').toUpperCase()
    const to = (searchParams.get('to') || 'USD').toUpperCase()
    const amount = parseFloat(searchParams.get('amount') || '1')
    if (!isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Fetch rate from exchangerate.host (no API key required)
    const apiUrl = `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`
    const res = await fetch(apiUrl, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 502 })
    }
    const json = await res.json()
    const rate = Number(json?.rates?.[to]) || 0
    if (!rate) {
      return NextResponse.json({ error: 'Rate not available' }, { status: 502 })
    }
    const converted = amount * rate
    return NextResponse.json({ from, to, rate, amount, converted })
  } catch (e) {
    return NextResponse.json({ error: 'Conversion error' }, { status: 500 })
  }
}

