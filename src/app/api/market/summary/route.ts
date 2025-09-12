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
      { availability: 'available' },
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
    const unit = (searchParams.get('unit') as Unit) || 'kg'
    const region = searchParams.get('region') || undefined
    const breed = searchParams.get('breed') || undefined

    const now = new Date()
    const todayStart = startOfDay(now)
    const tomorrowStart = addDays(todayStart, 1)

    const current = await computeAverage(unit, todayStart, tomorrowStart, region, breed)

    // If no data today, fallback to last available day within 14 days
    let effectiveCurrent = current
    let effectiveDayStart = todayStart
    let effectiveDayEnd = tomorrowStart
    if (current.avg == null) {
      for (let i = 1; i <= 14; i++) {
        const s = addDays(todayStart, -i)
        const e = addDays(todayStart, -(i - 1))
        const tmp = await computeAverage(unit, s, e, region, breed)
        if (tmp.avg != null) {
          effectiveCurrent = tmp
          effectiveDayStart = s
          effectiveDayEnd = e
          break
        }
      }
    }

    const prevDay = await computeAverage(unit, addDays(effectiveDayStart, -1), effectiveDayStart, region, breed)

    const last7 = await computeAverage(unit, addDays(effectiveDayEnd, -7), effectiveDayEnd, region, breed)
    const prev7 = await computeAverage(unit, addDays(effectiveDayEnd, -14), addDays(effectiveDayEnd, -7), region, breed)

    const last30 = await computeAverage(unit, addDays(effectiveDayEnd, -30), effectiveDayEnd, region, breed)
    const prev30 = await computeAverage(unit, addDays(effectiveDayEnd, -60), addDays(effectiveDayEnd, -30), region, breed)

    function changePct(cur: number | null, prev: number | null) {
      if (cur == null || prev == null || prev === 0) return null
      return ((cur - prev) / prev) * 100
    }

    // Anexar referência de cotação oficial (se houver)
    let officialRef: number | null = null
    try {
      const mq = await (MarketQuote as any).findOne({ status: 'approved' }).sort({ updatedAt: -1 }).lean()
      if (mq) officialRef = unit === 'kg' ? (mq.refPricePerKg ?? null) : (mq.refPricePerHead ?? null)
    } catch {}

    return NextResponse.json(successResponse({
      unit,
      current: effectiveCurrent,
      variation: {
        daily: changePct(effectiveCurrent.avg, prevDay.avg),
        weekly: changePct(last7.avg, prev7.avg),
        monthly: changePct(last30.avg, prev30.avg)
      },
      officialRef
    }))
  } catch (error) {
    console.error('Erro em /api/market/summary:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

