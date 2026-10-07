import assert from 'node:assert/strict'
import path from 'node:path'
import { describe, it } from 'node:test'
import { hashResetToken } from './password.ts'
import { hasPermission, isAdminRole, isMemberRole } from './permissions.ts'
import { safeSortField } from './query-guards.ts'
import { checkRateLimit } from './rate-limit-core.ts'
import { isInsideDirectory } from './safe-path.ts'

describe('permissões', () => {
  it('só trata admin como administrador', () => {
    assert.equal(isAdminRole('admin'), true)
    assert.equal(isAdminRole('member'), false)
    assert.equal(isAdminRole(undefined), false)
  })

  it('membro e admin passam na área de membros', () => {
    assert.equal(isMemberRole('member'), true)
    assert.equal(isMemberRole('admin'), true)
    assert.equal(isMemberRole('visitor'), false)
  })

  it('compara o nível do papel exigido', () => {
    assert.equal(hasPermission('admin', 'member'), true)
    assert.equal(hasPermission('member', 'admin'), false)
    assert.equal(hasPermission('visitor', 'member'), false)
    assert.equal(hasPermission(null, 'visitor'), true)
  })
})

describe('ordenação segura', () => {
  it('aceita campos da lista e recusa o resto', () => {
    assert.equal(safeSortField('name'), 'name')
    assert.equal(safeSortField('password'), 'createdAt')
    assert.equal(safeSortField(undefined), 'createdAt')
    assert.equal(safeSortField('createdAt', 'name'), 'createdAt')
  })
})

describe('caminhos de ficheiro', () => {
  const root = path.join(path.parse(process.cwd()).root, 'assuino-public')

  it('aceita ficheiros dentro da pasta e recusa saída', () => {
    assert.equal(isInsideDirectory(root, path.join(root, 'fotos', 'a.png')), true)
    assert.equal(isInsideDirectory(root, path.join(root, '..', 'segredo.txt')), false)
    assert.equal(isInsideDirectory(root, `${root}-extra`), false)
  })
})

describe('token de recuperação', () => {
  it('guarda um hash e não o token em claro', () => {
    const token = 'abc123'
    const hashed = hashResetToken(token)
    assert.notEqual(hashed, token)
    assert.match(hashed, /^[a-f0-9]{64}$/)
    assert.equal(hashResetToken(token), hashed)
  })
})

describe('limite de pedidos', () => {
  it('bloqueia depois do limite da janela', () => {
    const options = { key: `teste-${Date.now()}`, limit: 2, windowMs: 60_000 }
    assert.equal(checkRateLimit('1.2.3.4', options).success, true)
    assert.equal(checkRateLimit('1.2.3.4', options).success, true)
    assert.equal(checkRateLimit('1.2.3.4', options).success, false)
    assert.equal(checkRateLimit('5.6.7.8', options).success, true)
  })
})
