'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Upload,
  Plus,
  X,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
} from 'lucide-react'

type PostFile = {
  id: string
  name: string
  size: string
}

export default function PastPostsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<PostFile[]>([])
  const [postText, setPostText] = useState('')
  const [pastedPosts, setPastedPosts] = useState<string[]>([])
  const [message, setMessage] = useState('')

  function addFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size:
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }))

    setFiles((previous) => [...previous, ...newFiles])
    setMessage('')
  }

  function removeFile(id: string) {
    setFiles((previous) => previous.filter((file) => file.id !== id))
  }

  function addPost() {
    const trimmed = postText.trim()

    if (!trimmed) return

    setPastedPosts((previous) => [...previous, trimmed])
    setPostText('')
    setMessage('')
  }

  function removePost(index: number) {
    setPastedPosts((previous) => previous.filter((_, i) => i !== index))
  }

  function handleContinue() {
    if (files.length === 0 && pastedPosts.length === 0) {
      setMessage('Please upload a file or add at least one LinkedIn post.')
      return
    }

    router.push(`/c/${clientId}/onboarding/reference-posts`)
  }

  const totalPosts = files.length + pastedPosts.length

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

          <h1 className="text-3xl font-semibold tracking-tight text-[#292326]">
            Past LinkedIn posts
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#89817E]">
            Share content you&lsquo;ve previously published on LinkedIn. These examples help us
            understand your natural writing style, tone and communication preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            {/* Upload section */}
            <section className="rounded-xl border border-[#E8E4E0] bg-white p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-[#FBEFF1] p-3 text-[#A82B45]">
                  <Upload size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#292326]">Upload your posts</h2>
                  <p className="mt-1 text-xs text-[#89817E]">
                    Add documents containing your previously published posts.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv"
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files)
                  event.target.value = ''
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E8E4E0] bg-[#FCFBF9] px-5 py-10 text-center transition hover:border-[#A82B45] hover:bg-[#FBEFF1]/40"
              >
                <div className="mb-4 rounded-full bg-[#FBEFF1] p-4 text-[#A82B45]">
                  <Upload size={23} />
                </div>

                <p className="text-sm font-semibold text-[#292326]">Click to browse files</p>

                <p className="mt-2 text-xs text-[#89817E]">PDF, DOC, DOCX, TXT or CSV</p>

                <p className="mt-1 text-[11px] text-[#A49C98]">You can select multiple files.</p>
              </button>

              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-[11px] font-semibold tracking-wider text-[#89817E] uppercase">
                    Uploaded files ({files.length})
                  </p>

                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg border border-[#E8E4E0] p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-[#F2EFEC] p-2 text-[#89817E]">
                          <FileText size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#292326]">{file.name}</p>
                          <p className="mt-1 text-[11px] text-[#89817E]">{file.size}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        aria-label={`Remove ${file.name}`}
                        className="ml-3 rounded-md p-2 text-[#89817E] hover:bg-[#FBEFF1] hover:text-[#A82B45]"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Paste post section */}
            <section className="rounded-xl border border-[#E8E4E0] bg-white p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-[#FBEFF1] p-3 text-[#A82B45]">
                  <MessageSquare size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#292326]">
                    Add a LinkedIn post manually
                  </h2>
                  <p className="mt-1 text-xs text-[#89817E]">
                    Copy and paste a post directly from LinkedIn.
                  </p>
                </div>
              </div>

              <label
                htmlFor="post-content"
                className="mb-2 block text-[11px] font-semibold tracking-wider text-[#89817E] uppercase"
              >
                Post content
              </label>

              <textarea
                id="post-content"
                rows={6}
                value={postText}
                onChange={(event) => setPostText(event.target.value)}
                placeholder="Paste your previously published LinkedIn post here..."
                className="w-full resize-y rounded-lg border border-[#E8E4E0] bg-white px-4 py-3 text-sm leading-6 text-[#292326] transition outline-none placeholder:text-[#A49C98] focus:border-[#A82B45] focus:ring-2 focus:ring-[#A82B45]/10"
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={addPost}
                  disabled={!postText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#A82B45] px-4 py-2.5 text-xs font-semibold text-[#A82B45] transition hover:bg-[#FBEFF1] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={15} />
                  Add post
                </button>
              </div>

              {pastedPosts.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-[11px] font-semibold tracking-wider text-[#89817E] uppercase">
                    Added posts ({pastedPosts.length})
                  </p>

                  {pastedPosts.map((post, index) => (
                    <div key={index} className="rounded-lg border border-[#E8E4E0] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#292326]">
                          LinkedIn post {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => removePost(index)}
                          aria-label={`Remove post ${index + 1}`}
                          className="rounded-md p-1 text-[#89817E] hover:text-[#A82B45]"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <p className="text-xs leading-6 break-words whitespace-pre-wrap text-[#89817E]">
                        {post}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Continue section */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E8E4E0] pt-6">
              <Link
                href={`/c/${clientId}/onboarding`}
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

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-xl bg-[#292326] p-5 text-white">
              <h3 className="text-lg font-semibold">Your voice matters.</h3>

              <p className="mt-3 text-xs leading-6 text-[#D1C5C8]">
                Your previous writing helps us understand how you naturally communicate with your
                audience.
              </p>

              <div className="mt-5 border-t border-white/15 pt-4">
                <p className="text-[10px] font-semibold tracking-wider text-[#E7A9B6]">IMPORTANT</p>

                <p className="mt-2 text-xs leading-5 text-[#F4ECEE]">
                  We use your own posts as writing-style examples. Reference posts from other
                  creators are collected separately.
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
                        index === 1
                          ? 'bg-[#FBEFF1] text-[#A82B45]'
                          : index === 0
                            ? 'bg-[#F2EFEC] text-[#89817E]'
                            : 'bg-[#F2EFEC] text-[#89817E]'
                      }`}
                    >
                      {index === 0 ? <CheckCircle2 size={15} /> : `0${index + 1}`}
                    </div>

                    <span
                      className={`text-xs ${
                        index === 1 ? 'font-semibold text-[#A82B45]' : 'text-[#89817E]'
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

              <p className="mt-3 text-2xl font-semibold text-[#292326]">{totalPosts}</p>

              <p className="mt-1 text-xs text-[#89817E]">Files and manually added posts</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
