import 'dotenv/config'
import { config } from 'dotenv'

// Vitest does not read .env.local the way Next.js does.
config({ path: '.env.local' })
