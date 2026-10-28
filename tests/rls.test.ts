import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const SECRET = process.env.SUPABASE_SECRET_KEY!

/** Admin client - bypasses every security rule. Test setup only. */
const admin = createClient(URL, SECRET, { auth: { persistSession: false } })

const PASSWORD = 'test-password-not-secret'
const emailA = `rls-a-${Date.now()}@example.com`
const emailB = `rls-b-${Date.now()}@example.com`

let userA = ''
let userB = ''
let clientOfA = ''

async function makeOperator(email: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role: 'operator', full_name: email },
  })
  if (error) throw error
  return data.user.id
}

/** A normal signed-in client, exactly like the app uses. */
async function signedInAs(email: string) {
  const c = createClient(URL, PUBLISHABLE, { auth: { persistSession: false } })
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD })
  if (error) throw error
  return c
}

beforeAll(async () => {
  userA = await makeOperator(emailA)
  userB = await makeOperator(emailB)

  const { data, error } = await admin
    .from('clients')
    .insert({ operator_id: userA, name: 'Operator A client', company: 'A Ltd' })
    .select('id')
    .single()
  if (error) throw error
  clientOfA = data.id
})

afterAll(async () => {
  await admin.from('clients').delete().eq('id', clientOfA)
  await admin.auth.admin.deleteUser(userA)
  await admin.auth.admin.deleteUser(userB)
})

describe('row-level security on clients', () => {
  it('lets an operator read their own client', async () => {
    const a = await signedInAs(emailA)
    const { data } = await a.from('clients').select('id').eq('id', clientOfA)

    // This test is not filler. Without it a policy that blocks EVERYTHING
    // would make the next two tests pass while the app is completely broken.
    expect(data).toHaveLength(1)
  })

  it('does not let another operator read it', async () => {
    const b = await signedInAs(emailB)
    const { data, error } = await b.from('clients').select('id').eq('id', clientOfA)

    // Postgres returns no rows rather than an error - the row is invisible,
    // not forbidden. Both of these assertions matter.
    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('does not let another operator write to it', async () => {
    const b = await signedInAs(emailB)
    await b.from('clients').update({ name: 'hijacked' }).eq('id', clientOfA)

    // The update reports no error - it simply matches no rows, because the row
    // is invisible to B. Proving it failed means reading the row back as admin.
    const { data: check } = await admin.from('clients').select('name').eq('id', clientOfA).single()
    expect(check?.name).toBe('Operator A client')
  })

  it('shows nothing at all to a signed-out visitor', async () => {
    const anon = createClient(URL, PUBLISHABLE, { auth: { persistSession: false } })
    const { data } = await anon.from('clients').select('id')
    expect(data).toHaveLength(0)
  })
})
