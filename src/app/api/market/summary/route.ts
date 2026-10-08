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

async function computeAverage(unit: Unit, start: Date, end: Date, region?: string, breed?: string, saleForm?: 'carcaça' | 'vivo') {
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
  if (saleForm) matchStage.$and.push({ saleForm })

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
      avgValue: { $avg: '$value' },
      minValue: { $min: '$value' },
      maxValue: { $max: '$value' },
    }
  })

  const result = await (Product as any).aggregate(pipeline)
  if (!result.length || result[0].avgValue == null) {
    return { avg: null as number | null, min: null as number | null, max: null as number | null, count: result[0]?.count || 0 }
  }
  return {
    avg: result[0].avgValue as number,
    min: result[0].minValue as number,
    max: result[0].maxValue as number,
    count: result[0].count as number,
  }
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

    const saleForm = saleFormParam === 'carcaça' || saleFormParam === 'vivo' ? saleFormParam : undefined
    const current = await computeAverage(unit, todayStart, tomorrowStart, region, breed, saleForm)

    let effectiveCurrent = current
    let effectiveDayStart = todayStart
    let effectiveDayEnd = tomorrowStart
    let usedFallback = false
    const yearProbe = current.avg == null
      ? await computeAverage(unit, addDays(todayStart, -365), tomorrowStart, region, breed, saleForm)
      : current
    if (current.avg == null && yearProbe.avg != null) {
      for (let i = 1; i <= 365; i++) {
        const s = addDays(todayStart, -i)
        const e = addDays(todayStart, -(i - 1))
        const tmp = await computeAverage(unit, s, e, region, breed, saleForm)
        if (tmp.avg != null) {
          effectiveCurrent = tmp
          effectiveDayStart = s
          effectiveDayEnd = e
          usedFallback = true
          break
        }
      }
    }

    let prevValid: { avg: number | null, count: number } = { avg: null, count: 0 }
    if (yearProbe.avg != null) {
      for (let i = 1; i <= 365; i++) {
        const s = addDays(effectiveDayStart, -i)
        const e = addDays(effectiveDayStart, -(i - 1))
        const tmp = await computeAverage(unit, s, e, region, breed, saleForm)
        if (tmp.avg != null) { prevValid = tmp; break }
      }
    }

    const last7 = await computeAverage(unit, addDays(effectiveDayEnd, -7), effectiveDayEnd, region, breed, saleForm)
    const prev7 = await computeAverage(unit, addDays(effectiveDayEnd, -14), addDays(effectiveDayEnd, -7), region, breed, saleForm)

    const last30 = await computeAverage(unit, addDays(effectiveDayEnd, -30), effectiveDayEnd, region, breed, saleForm)
    const prev30 = await computeAverage(unit, addDays(effectiveDayEnd, -60), addDays(effectiveDayEnd, -30), region, breed, saleForm)

    function changePct(cur: number | null, prev: number | null) {
      if (cur == null || prev == null || prev === 0) return null
      return ((cur - prev) / prev) * 100
    }

    let officialRef: number | null = null
    let official: { value: number; date: string; region: string; saleForm: string; source: string } | null = null
    try {
      const mqQuery: any = { status: 'approved' }
      if (region) mqQuery.region = new RegExp(region, 'i')
      if (saleForm) mqQuery.saleForm = saleForm
      const mq = await (MarketQuote as any).findOne(mqQuery).sort({ updatedAt: -1 }).lean()
      if (mq) {
        officialRef = unit === 'kg' ? (mq.refPricePerKg ?? null) : (mq.refPricePerHead ?? null)
        if (officialRef != null) {
          official = {
            value: officialRef,
            date: new Date(mq.updatedAt || mq.createdAt).toISOString(),
            region: mq.region,
            saleForm: mq.saleForm,
            source: 'Cotação aprovada pela associação',
          }
        }
      }
    } catch {}

    return NextResponse.json(successResponse({
      unit,
      product: 'suíno',
      saleForm: saleForm || null,
      current: effectiveCurrent,
      variation: {
        daily: changePct(effectiveCurrent.avg, prevValid.avg),
        weekly: changePct(last7.avg, prev7.avg),
        monthly: changePct(last30.avg, prev30.avg)
      },
      officialRef,
      official,
      source: 'Anúncios públicos de suínos disponíveis. Cada anúncio entra uma vez na média simples.',
      usedFallback,
      effectiveDate: effectiveDayStart.toISOString()
    }))
  } catch (error) {
    console.error('Erro em /api/market/summary:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

