export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import MarketQuote from '@/models/MarketQuote'
import { errorResponse, successResponse } from '@/lib/api-utils'

type Unit = 'kg' | 'head'

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function range(start: Date, end: Date) {
  return { $gte: start, $lt: end }
}

async function computeAverage(unit: Unit, start: Date, end: Date, region?: string, breed?: string) {
  const matchStage: any = {
    $and: [
      { $or: [ { isActive: true }, { isActive: { $exists: false } } ] },
      { $or: [ { availability: 'available' }, { availability: { $exists: false } } ] },
      { $or: [ { updatedAt: range(start, end) }, { createdAt: range(start, end) } ] },
    ]
  }

  if (region) {
    matchStage.$and.push({ location: { $regex: new RegExp(region, 'i') } })
  }

  const addFields: any = {
    pricePerKg: {
      $ifNull: [
        '$pricePerKg',
        {
          $cond: [
            { $and: [ { $gt: ['$price', 0] }, { $gt: ['$weight', 0] } ] },
            { $divide: ['$price', '$weight'] },
            null
          ]
        }
      ]
    },
    value: unit === 'kg' ? '$pricePerKg' : '$price'
  }

  const pipeline: any[] = [
    { $match: matchStage },
    { $addFields: addFields },
  ]

  if (breed) {
    pipeline.push({ $match: { breed } })
  }

  pipeline.push({ $match: { value: { $ne: null } } })
  pipeline.push({
    $group: {
      _id: null,
      count: { $sum: 1 },
      avgValue: { $avg: '$value' }
    }
  })

  const result = await (Product as any).aggregate(pipeline)
  if (!result.length || result[0].avgValue == null) {
    return { avg: null as number | null, count: result[0]?.count || 0 }
  }
  return { avg: result[0].avgValue as number, count: result[0].count as number }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const saleFormParam = searchParams.get('saleForm') as ('carcaça' | 'vivo') | null
    const unit: Unit = (searchParams.get('unit') as Unit) || (saleFormParam === 'vivo' ? 'head' : 'kg')
    const region = searchParams.get('region') || undefined
    const breed = searchParams.get('breed') || undefined

    const now = new Date()
    const todayStart = startOfDay(now)
    const tomorrowStart = addDays(todayStart, 1)

    const current = await computeAverage(unit, todayStart, tomorrowStart, region, breed)

    let effectiveCurrent = current
    let effectiveDayStart = todayStart
    let effectiveDayEnd = tomorrowStart
    let usedFallback = false
    if (current.avg == null) {
      // Expand fallback window up to 365 days back to find a recent valid day
      for (let i = 1; i <= 365; i++) {
        const s = addDays(todayStart, -i)
        const e = addDays(todayStart, -(i - 1))
        const tmp = await computeAverage(unit, s, e, region, breed)
        if (tmp.avg != null) {
          effectiveCurrent = tmp
          effectiveDayStart = s
          effectiveDayEnd = e
          usedFallback = true
          break
        }
      }
    }

    // Find nearest previous valid day (not necessarily consecutive)
    let prevValid: { avg: number | null, count: number } = { avg: null, count: 0 }
    for (let i = 1; i <= 365; i++) {
      const s = addDays(effectiveDayStart, -i)
      const e = addDays(effectiveDayStart, -(i - 1))
      const tmp = await computeAverage(unit, s, e, region, breed)
      if (tmp.avg != null) { prevValid = tmp; break }
    }

    const last7 = await computeAverage(unit, addDays(effectiveDayEnd, -7), effectiveDayEnd, region, breed)
    const prev7 = await computeAverage(unit, addDays(effectiveDayEnd, -14), addDays(effectiveDayEnd, -7), region, breed)

    const last30 = await computeAverage(unit, addDays(effectiveDayEnd, -30), effectiveDayEnd, region, breed)
    const prev30 = await computeAverage(unit, addDays(effectiveDayEnd, -60), addDays(effectiveDayEnd, -30), region, breed)

    function changePct(cur: number | null, prev: number | null) {
      if (cur == null || prev == null || prev === 0) return null
      return ((cur - prev) / prev) * 100
    }

    let officialRef: number | null = null
    try {
      const mqQuery: any = { status: 'approved' }
      if (region) mqQuery.region = new RegExp(region, 'i')
      if (saleFormParam) mqQuery.saleForm = saleFormParam
      const mq = await (MarketQuote as any).findOne(mqQuery).sort({ updatedAt: -1 }).lean()
      if (mq) officialRef = unit === 'kg' ? (mq.refPricePerKg ?? null) : (mq.refPricePerHead ?? null)
    } catch {}

    return NextResponse.json(successResponse({
      unit,
      current: effectiveCurrent,
      variation: {
        daily: changePct(effectiveCurrent.avg, prevValid.avg),
        weekly: changePct(last7.avg, prev7.avg),
        monthly: changePct(last30.avg, prev30.avg)
      },
      officialRef,
      usedFallback,
      effectiveDate: effectiveDayStart.toISOString()
    }))
  } catch (error) {
    console.error('Erro em /api/market/summary:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

