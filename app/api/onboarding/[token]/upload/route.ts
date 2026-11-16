import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkToken } from '@/lib/onboarding/token'

const MAX_BYTES = 5 * 1024 * 1024

const DOC_EXTENSIONS = ['.txt', '.md', '.docx', '.pdf']
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']

const UploadType = z.enum(['past_post', 'reference_post', 'brand_kit'])

function extensionOf(name: string) {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot).toLowerCase()
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const check = await checkToken(token)

  if (!check.ok) {
    return NextResponse.json(
      { error: 'This link is not valid.', reason: check.reason },
      { status: check.reason === 'unknown' ? 404 : 410 }
    )
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  const parsedType = UploadType.safeParse(form?.get('type'))

  if (!(file instanceof File) || !parsedType.success) {
    return NextResponse.json({ error: 'A file and a valid type are required.' }, { status: 400 })
  }

  const allowed =
    parsedType.data === 'brand_kit' ? [...DOC_EXTENSIONS, ...IMAGE_EXTENSIONS] : DOC_EXTENSIONS

  if (!allowed.includes(extensionOf(file.name))) {
    return NextResponse.json({ error: 'That file type is not accepted here.' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Files must be 5 MB or smaller.' }, { status: 400 })
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, '-')
  const storagePath = `${check.clientId}/${crypto.randomUUID()}-${safeName}`

  const supabase = createAdminClient()

  const { error: uploadError } = await supabase.storage
    .from('client-files')
    .upload(storagePath, await file.arrayBuffer(), {
      contentType: file.type || undefined,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Could not upload the file.' }, { status: 500 })
  }

  const { error: rowError } = await supabase.from('source_documents').insert({
    client_id: check.clientId,
    type: parsedType.data,
    storage_path: storagePath,
  })

  if (rowError) {
    return NextResponse.json({ error: 'Could not record the file.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, path: storagePath })
}
