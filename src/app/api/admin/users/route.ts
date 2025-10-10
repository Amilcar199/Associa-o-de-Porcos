export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getPaginationParams, successResponse, errorResponse, validateSession } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    // Apenas admins
    const auth = await validateSession(req, true)
    if ('error' in auth) {
      return errorResponse(auth.error || 'Não autorizado', auth.status)
    }

    const { searchParams } = new URL(req.url)
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = getPaginationParams(searchParams)

    const search = searchParams.get('search')?.trim()
    const role = searchParams.get('role') as 'admin' | 'member' | 'visitor' | null
    const activeParam = searchParams.get('active')
    const isActive = activeParam === null ? undefined : activeParam === 'true'

    const query: any = {}
    if (search) {
      const regex = new RegExp(search, 'i')
      query.$or = [{ name: regex }, { email: regex }]
    }
    if (role) query.role = role
    if (isActive !== undefined) query.isActive = isActive

    const skip = (page - 1) * limit

    const [results, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          AND: [
            search ? { OR: [ { name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } } ] } : {},
            role ? { role } : {},
            isActive !== undefined ? { isActive } : {}
          ]
        },
        orderBy: { [sort]: order as any },
        skip: skip,
        take: limit,
        select: { name: true, email: true, role: true, isActive: true, createdAt: true, company: true, location: true }
      }),
      prisma.user.count({
        where: {
          AND: [
            search ? { OR: [ { name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } } ] } : {},
            role ? { role } : {},
            isActive !== undefined ? { isActive } : {}
          ]
        }
      })
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: results,
      pagination: { page, limit, total, pages }
    })
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    // Apenas admins podem criar usuários
    const auth = await validateSession(req, true)
    if ('error' in auth) {
      return errorResponse(auth.error || 'Não autorizado', auth.status)
    }

    const body = await req.json()
    
    // Validação dos campos obrigatórios
    if (!body.name || !body.email || !body.password || !body.role) {
      return errorResponse('Nome, email, senha e papel são obrigatórios')
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } })
    if (existingUser) {
      return errorResponse('Email já está em uso')
    }

    // Criar novo usuário
    const createdUser = await prisma.user.create({ data: {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      password: body.password,
      role: body.role,
      company: body.company?.trim() || null,
      bio: body.bio?.trim() || null,
      location: body.location?.trim() || null,
      phone: body.phone?.trim() || null,
      website: body.website?.trim() || null,
      social: body.socialMedia ? (body.socialMedia as any) : undefined,
      isActive: body.isActive !== undefined ? body.isActive : true
    }, select: { name: true, email: true, role: true, isActive: true, createdAt: true, company: true, bio: true, location: true, phone: true, website: true, avatar: true } })

    return NextResponse.json(successResponse(createdUser, 'Usuário criado com sucesso'), { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}