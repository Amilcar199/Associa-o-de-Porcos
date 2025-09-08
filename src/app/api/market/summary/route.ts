export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
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

async function computeAverage(unit: Unit, start: Date, end: Date, region?: string, category?: string) {
  const matchStage: any = {
    $and: [
      { $or: [ { isActive: true }, { isActive: { $exists: false } } ] },
      { createdAt: range(start, end) },
    ]
  }

  if (region) {
    matchStage.$and.push({ location: { $regex: new RegExp(region, 'i') } })
  }

  const addFields: any = {
    pricePerKg: {
      $cond: [
        { $and: [ { $gt: ['$price', 0] }, { $gt: ['$weight', 0] } ] },
        { $divide: ['$price', '$weight'] },
        null
      ]
    },
    categoryKey: {
      $switch: {
        branches: [
          { case: { $or: [ { $lt: ['$weight', 25] }, { $lt: ['$age', 2] } ] }, then: 'piglet' },
          { case: { $or: [ { $and: [ { $gte: ['$weight', 25] }, { $lte: ['$weight', 90] } ] }, { $and: [ { $gte: ['$age', 2] }, { $lte: ['$age', 6] } ] } ] }, then: 'fattening' },
        ],
        default: 'breeders'
      }
    }
  }

  const pipeline: any[] = [
    { $match: matchStage },
    { $addFields: addFields },
  ]

  if (category) {
    pipeline.push({ $match: { categoryKey: category } })
  }

  pipeline.push({
    $group: {
      _id: null,
      count: { $sum: 1 },
      avgValue: { $avg: unit === 'kg' ? '$pricePerKg' : '$price' }
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
    const category = searchParams.get('category') || undefined

    const now = new Date()
    const todayStart = startOfDay(now)
    const tomorrowStart = addDays(todayStart, 1)

    const current = await computeAverage(unit, todayStart, tomorrowStart, region, category)

    // If no data today, fallback to last available day within 14 days
    let effectiveCurrent = current
    let effectiveDayStart = todayStart
    let effectiveDayEnd = tomorrowStart
    if (current.avg == null) {
      for (let i = 1; i <= 14; i++) {
        const s = addDays(todayStart, -i)
        const e = addDays(todayStart, -(i - 1))
        const tmp = await computeAverage(unit, s, e, region, category)
        if (tmp.avg != null) {
          effectiveCurrent = tmp
          effectiveDayStart = s
          effectiveDayEnd = e
          break
        }
      }
    }

    const prevDay = await computeAverage(unit, addDays(effectiveDayStart, -1), effectiveDayStart, region, category)

    const last7 = await computeAverage(unit, addDays(effectiveDayEnd, -7), effectiveDayEnd, region, category)
    const prev7 = await computeAverage(unit, addDays(effectiveDayEnd, -14), addDays(effectiveDayEnd, -7), region, category)

    const last30 = await computeAverage(unit, addDays(effectiveDayEnd, -30), effectiveDayEnd, region, category)
    const prev30 = await computeAverage(unit, addDays(effectiveDayEnd, -60), addDays(effectiveDayEnd, -30), region, category)

    function changePct(cur: number | null, prev: number | null) {
      if (cur == null || prev == null || prev === 0) return null
      return ((cur - prev) / prev) * 100
    }

    return NextResponse.json(successResponse({
      unit,
      current: effectiveCurrent,
      variation: {
        daily: changePct(effectiveCurrent.avg, prevDay.avg),
        weekly: changePct(last7.avg, prev7.avg),
        monthly: changePct(last30.avg, prev30.avg)
      }
    }))
  } catch (error) {
    console.error('Erro em /api/market/summary:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

