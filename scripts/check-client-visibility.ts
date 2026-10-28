/**
 * Signs in as the test operator and lists their clients, using the same
 * publishable key the browser uses.
 *
 * Why this exists: if row-level security is wrong, a client list renders empty
 * with no error and no failed request - there is nothing to debug. This proves
 * the rows are visible to a normal session before anyone builds a screen on
 * top of them.
 *
 *   npx tsx scripts/check-client-visibility.ts
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const email = process.env.TEST_OPERATOR_EMAIL
  const password = process.env.TEST_OPERATOR_PASSWORD

  if (!url || !key || !email || !password) {
    console.error(
      'Missing env. Needs NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,\n' +
        'TEST_OPERATOR_EMAIL and TEST_OPERATOR_PASSWORD in .env.local.'
    )
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    console.error('Sign-in failed:', signInError.message)
    process.exit(1)
  }
  console.log(`signed in as ${email}`)

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, company, status')
    .order('name')

  if (error) {
    console.error('Query failed:', error.message)
    process.exit(1)
  }

  console.log(`\nclients visible to this operator: ${clients?.length ?? 0}`)
  for (const c of clients ?? []) {
    console.log(`  ${c.id}  ${c.name} - ${c.company} [${c.status}]`)
  }

  // The operator's own row should be readable too - the sidebar will want the name.
  const { data: me } = await supabase.from('operators').select('email, full_name').single()
  console.log(
    `\noperator row readable: ${me ? `yes (${me.full_name})` : 'NO - check 0001 policies'}`
  )
}

main()
