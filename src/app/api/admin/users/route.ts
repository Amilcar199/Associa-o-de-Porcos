export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getPaginationParams, successResponse, errorResponse, validateSession } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

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
      User.find(query)
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .select('name email role isActive createdAt company location')
        .lean(),
      User.countDocuments(query)
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
    await connectDB()

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
    const existingUser = await User.findOne({ email: body.email.toLowerCase() })
    if (existingUser) {
      return errorResponse('Email já está em uso')
    }

    // Criar novo usuário
    const userData = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      password: body.password,
      role: body.role,
      company: body.company?.trim() || null,
      bio: body.bio?.trim() || null,
      location: body.location?.trim() || null,
      phone: body.phone?.trim() || null,
      website: body.website?.trim() || null,
      socialMedia: {
        linkedin: body.socialMedia?.linkedin?.trim() || null,
        twitter: body.socialMedia?.twitter?.trim() || null,
        facebook: body.socialMedia?.facebook?.trim() || null
      },
      isActive: body.isActive !== undefined ? body.isActive : true
    }

    const newUser = new User(userData)
    await newUser.save()

    // Retornar usuário criado (sem senha)
    const createdUser = await User.findById(newUser._id)
      .select('name email role isActive createdAt company bio location phone website socialMedia avatar')
      .lean()

    return NextResponse.json(successResponse(createdUser, 'Usuário criado com sucesso'), { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}