'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Link2,
  Lightbulb,
  ExternalLink,
  ClipboardList,
} from 'lucide-react'

type ReferencePost = {
  id: string
  url: string
  content: string
}

export default function ReferencePostsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [references, setReferences] = useState<ReferencePost[]>([])
  const [message, setMessage] = useState('')

  function addReference() {
    const trimmedUrl = url.trim()
    const trimmedContent = content.trim()

    if (!trimmedUrl && !trimmedContent) {
      setMessage('Please add a LinkedIn URL or paste a post.')
      return
    }

    if (trimmedUrl && !/^https?:\/\/\S+$/i.test(trimmedUrl)) {
      setMessage('Please enter a valid URL starting with http:// or https://.')
      return
    }

    setReferences((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        url: trimmedUrl,
        content: trimmedContent,
      },
    ])

    setUrl('')
    setContent('')
    setMessage('')
  }

  function removeReference(id: string) {
    setReferences((previous) => previous.filter((item) => item.id !== id))
  }

  function handleContinue() {
    if (references.length === 0) {
      setMessage('Please add at least one reference post to continue.')
      return
    }

    router.push(`/c/${clientId}/onboarding/brand-kit`)
  }

  return (
    <div className="min-h-screen bg-[#F8F6F3] px-5 py-8 md:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/c/${clientId}/onboarding`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#89817E] transition hover:text-[#A82B45]"
        >
          <ArrowLeft size={16} />
          Back to onboarding
        </Link>

        <div className="mb-8">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#A82B45]">
            CLIENT ONBOARDING
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#292326]">Reference posts</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#89817E]">
            Share LinkedIn posts from creators, founders or industry voices whose content you
            admire. These references help us understand the direction and ideas that inspire you.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-[#E8E4E0] bg-white p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-[#FBEFF1] p-3 text-[#A82B45]">
                  <Link2 size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#292326]">Add a reference post</h2>
                  <p className="mt-1 text-xs text-[#89817E]">
                    Add a LinkedIn post URL or paste its content.
                  </p>
                </div>
              </div>

              <label
                htmlFor="reference-url"
                className="mb-2 block text-[11px] font-semibold tracking-wider text-[#89817E] uppercase"
              >
                LinkedIn post URL
              </label>

              <input
                id="reference-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://www.linkedin.com/posts/..."
                className="w-full rounded-lg border border-[#E8E4E0] px-4 py-3 text-sm text-[#292326] transition outline-none placeholder:text-[#A49C98] focus:border-[#A82B45] focus:ring-2 focus:ring-[#A82B45]/10"
              />

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E8E4E0]" />
                <span className="text-[10px] font-semibold tracking-wider text-[#A49C98]">OR</span>
                <div className="h-px flex-1 bg-[#E8E4E0]" />
              </div>

              <label
                htmlFor="reference-content"
                className="mb-2 block text-[11px] font-semibold tracking-wider text-[#89817E] uppercase"
              >
                Paste post content
              </label>

              <textarea
                id="reference-content"
                rows={6}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Paste the LinkedIn post you admire here..."
                className="w-full resize-y rounded-lg border border-[#E8E4E0] px-4 py-3 text-sm leading-6 text-[#292326] transition outline-none placeholder:text-[#A49C98] focus:border-[#A82B45] focus:ring-2 focus:ring-[#A82B45]/10"
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={addReference}
                  disabled={!url.trim() && !content.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#A82B45] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#8F243B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={15} />
                  Add reference
                </button>
              </div>
            </section>

            {references.length > 0 && (
              <section className="rounded-xl border border-[#E8E4E0] bg-white p-6 md:p-8">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-[#292326]">Your references</h2>
                  <p className="mt-1 text-xs text-[#89817E]">
                    {references.length} reference
                    {references.length === 1 ? '' : 's'} added
                  </p>
                </div>

                <div className="space-y-4">
                  {references.map((reference, index) => (
                    <div key={reference.id} className="rounded-lg border border-[#E8E4E0] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#292326]">
                          Reference {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeReference(reference.id)}
                          aria-label={`Remove reference ${index + 1}`}
                          className="rounded-md p-2 text-[#89817E] transition hover:bg-[#FBEFF1] hover:text-[#A82B45]"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {reference.url && (
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mb-3 inline-flex items-center gap-2 text-xs break-all text-[#A82B45] hover:underline"
                        >
                          <ExternalLink size={14} />
                          {reference.url}
                        </a>
                      )}

                      {reference.content && (
                        <p className="text-xs leading-6 break-words whitespace-pre-wrap text-[#89817E]">
                          {reference.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E8E4E0] pt-6">
              <Link
                href={`/c/${clientId}/onboarding/past-posts`}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E8E4E0] px-4 py-3 text-sm text-[#89817E] transition hover:bg-white"
              >
                <ArrowLeft size={15} />
                Back
              </Link>

              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center gap-2 rounded-lg bg-[#A82B45] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#8F243B]"
              >
                Save & continue
                <ArrowRight size={15} />
              </button>
            </div>

            {message && (
              <div className="rounded-lg border border-[#E8E4E0] bg-white p-4 text-sm text-[#89817E]">
                {message}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl bg-[#292326] p-5 text-white">
              <div className="mb-4 w-fit rounded-lg bg-white/10 p-3 text-[#E7A9B6]">
                <Lightbulb size={21} />
              </div>

              <h3 className="text-lg font-semibold">Inspiration, not imitation.</h3>

              <p className="mt-3 text-xs leading-6 text-[#D1C5C8]">
                These posts help us understand the content direction you admire — such as
                storytelling, structure, topics and creative approaches.
              </p>

              <div className="mt-5 border-t border-white/15 pt-4">
                <p className="text-[10px] font-semibold tracking-wider text-[#E7A9B6]">IMPORTANT</p>

                <p className="mt-2 text-xs leading-5 text-[#F4ECEE]">
                  Reference posts are not used as examples of your personal writing voice. Your own
                  posts serve that purpose.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
              <p className="mb-5 text-[10px] font-semibold tracking-wider text-[#89817E]">
                ONBOARDING STEPS
              </p>

              {['Founder questionnaire', 'Past LinkedIn posts', 'Reference posts', 'Brand kit'].map(
                (item, index) => (
                  <div key={item} className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${
                        index === 2 ? 'bg-[#FBEFF1] text-[#A82B45]' : 'bg-[#F2EFEC] text-[#89817E]'
                      }`}
                    >
                      {index === 0 ? '✓' : `0${index + 1}`}
                    </div>

                    <span
                      className={`text-xs ${
                        index === 2 ? 'font-semibold text-[#A82B45]' : 'text-[#89817E]'
                      }`}
                    >
                      {item}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
              <div className="flex items-center gap-2">
                <ClipboardList size={17} className="text-[#A82B45]" />
                <p className="text-sm font-semibold text-[#292326]">Your collection</p>
              </div>

              <p className="mt-3 text-2xl font-semibold text-[#292326]">{references.length}</p>

              <p className="mt-1 text-xs text-[#89817E]">Reference posts added</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
