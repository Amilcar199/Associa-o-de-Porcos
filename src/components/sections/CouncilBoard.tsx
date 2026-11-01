'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type CouncilMember = {
  _id: string
  name: string
  role: string
  company?: string
  avatar?: string
  description?: string
}

function initial(name: string) {
  return (name.trim().slice(0, 1) || 'A').toUpperCase()
}

function rankOf(role: string) {
  const value = role.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (value.includes('vice')) return 1
  if (value.includes('president')) return 0
  if (value.includes('secret')) return 2
  if (value.includes('tesour')) return 3
  return 4
}

function byHierarchy(members: CouncilMember[]) {
  return members
    .map((member, index) => ({ member, index, rank: rankOf(member.role) }))
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map((item) => item.member)
}

function Portrait({ member, lead = false }: { member: CouncilMember; lead?: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-3xl bg-primary-950 shadow-lg ${lead ? 'ring-2 ring-primary-300' : 'ring-1 ring-white/10'}`}>
      <div className={`relative ${lead ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}>
        {member.avatar ? (
          <Image
            src={member.avatar}
            alt={member.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes={lead ? '(max-width:768px) 100vw, 420px' : '(max-width:768px) 100vw, 280px'}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-800 to-primary-950 text-5xl font-semibold text-white">
            {initial(member.name)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className={`font-semibold uppercase tracking-[0.18em] text-primary-200 ${lead ? 'text-xs' : 'text-[11px]'}`}>{member.role}</p>
          <h3 className={`mt-1 font-heading font-semibold text-white ${lead ? 'text-2xl' : 'text-lg'}`}>{member.name}</h3>
          {member.company && <p className="mt-1 text-sm text-white/70">{member.company}</p>}
          {member.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/80">{member.description}</p>
          )}
        </div>
      </div>
    </article>
  )
}

export default function CouncilBoard({
  members,
  isEn,
  preview = false,
}: {
  members: CouncilMember[]
  isEn: boolean
  preview?: boolean
}) {
  const ranked = byHierarchy(members)
  const shown = preview ? ranked.slice(0, 3) : ranked
  const [lead, ...rest] = shown

  return (
    <section className="relative overflow-hidden bg-gray-950 py-14 text-white md:py-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary-700/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary-900/40 blur-3xl" />
      <div className="container-custom relative">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-300">
              {isEn ? 'Administrative council' : 'Conselho administrativo'}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-5xl">
              {isEn ? 'The people who lead the association' : 'Quem dirige a associação'}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              {isEn
                ? 'The council represents the members and sets the direction of the association.'
                : 'O conselho representa os associados e define o rumo da associação.'}
            </p>
          </div>
          {preview && (
            <Link href="/colaboradores" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-200 hover:text-white">
              {isEn ? 'Full council' : 'Ver o conselho'}
              <ArrowRight size={18} />
            </Link>
          )}
        </div>

        <div>
          {lead && (
            <div className="mx-auto max-w-sm">
              <Portrait member={lead} lead />
            </div>
          )}
          {rest.length > 0 && (
            <div className={`mx-auto mt-8 grid max-w-3xl gap-5 ${rest.length > 1 ? 'sm:grid-cols-2' : 'max-w-xs'}`}>
              {rest.map((member) => (
                <Portrait key={member._id} member={member} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
