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

function Portrait({ member }: { member: CouncilMember }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl bg-primary-950 shadow-lg ring-1 ring-white/10">
      <div className="relative aspect-[3/4]">
        {member.avatar ? (
          <Image
            src={member.avatar}
            alt={member.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-800 to-primary-950 text-5xl font-semibold text-white">
            {initial(member.name)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-200">{member.role}</p>
          <h3 className="mt-1 font-heading text-xl font-semibold text-white">{member.name}</h3>
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
  const shown = preview ? members.slice(0, 3) : members

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

        <div className={`grid gap-5 ${shown.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'max-w-sm'}`}>
          {shown.map((member) => (
            <Portrait key={member._id} member={member} />
          ))}
        </div>
      </div>
    </section>
  )
}
