export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Farm from '@/models/Farm'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'
import { ProvinceStats } from '@/types'

// GET /api/farms/stats - Estatísticas agregadas de suinocultura por província (público)
// Alimenta o Mapa Interativo na aba "Sobre": total de produtores, total de porcos
// e a contagem detalhada (fêmeas, disponíveis para abate, disponíveis para reprodução).
export async function GET() {
  try {
    await connectDB()

    const stats: ProvinceStats[] = await Farm.getProvinceStats()
    const byProvince = new Map(stats.map((s) => [s.province, s]))

    // Garantir que todas as 21 províncias apareçam no mapa, mesmo sem cadastros ainda
    const full: ProvinceStats[] = ANGOLA_PROVINCE_NAMES.map((province) => (
      byProvince.get(province) || {
        province,
        farmersCount: 0,
        totalPigs: 0,
        females: 0,
        forSlaughter: 0,
        forBreeding: 0,
      }
    ))

    const totals = full.reduce(
      (acc, p) => ({
        farmersCount: acc.farmersCount + p.farmersCount,
        totalPigs: acc.totalPigs + p.totalPigs,
        females: acc.females + p.females,
        forSlaughter: acc.forSlaughter + p.forSlaughter,
        forBreeding: acc.forBreeding + p.forBreeding,
      }),
      { farmersCount: 0, totalPigs: 0, females: 0, forSlaughter: 0, forBreeding: 0 }
    )

    return NextResponse.json(successResponse({ provinces: full, totals }))
  } catch (error) {
    console.error('Erro ao calcular estatísticas de fazendas:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
