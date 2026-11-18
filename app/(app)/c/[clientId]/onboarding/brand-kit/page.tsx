'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Palette,
  Globe,
  Type,
  X,
  CheckCircle2,
  ClipboardList,
  Plus,
} from 'lucide-react'

export default function BrandKitPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)

  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [font, setFont] = useState('')
  const [colors, setColors] = useState(['#A82B45', '#242424'])
  const [newColor, setNewColor] = useState('#E8E2DC')
  const [files, setFiles] = useState<File[]>([])
  const [saved, setSaved] = useState(false)

  function addColor() {
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor) && colors.length < 6) {
      setColors([...colors, newColor.toUpperCase()])
    }
  }

  function removeColor(index: number) {
    setColors(colors.filter((_, i) => i !== index))
  }

  function addFiles(selectedFiles: FileList | null) {
    if (selectedFiles) {
      setFiles((current) => [...current, ...Array.from(selectedFiles)])
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <Link
        href={`/c/${clientId}/onboarding/reference-posts`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Reference Posts
      </Link>

      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#A82B45] uppercase">
          <ClipboardList size={15} />
          Founder Onboarding · Step 4 of 4
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#242424]">
          Build your Brand Kit.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Share your brand&lsquo;s visual identity so the team understands how your company looks
          and feels. You can leave optional fields empty.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[#F8EDF0] p-2.5 text-[#A82B45]">
            <Upload size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-[#242424]">Brand assets</h2>
            <p className="text-xs text-gray-500">
              Upload your logo, brand guidelines, or other visual assets.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-[#FAFAF9] px-6 py-10 text-center transition hover:border-[#A82B45]">
          <Upload size={25} className="mb-3 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Click to upload brand assets</span>
          <span className="mt-1 text-xs text-gray-400">
            PNG, JPG, SVG, PDF or other brand documents
          </span>
          <input
            type="file"
            multiple
            accept="image/*,.svg,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Upload size={15} className="text-gray-400" />
                  <span className="max-w-xs truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-red-600"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[#F8EDF0] p-2.5 text-[#A82B45]">
            <Palette size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-[#242424]">Brand colours</h2>
            <p className="text-xs text-gray-500">Add your primary and secondary brand colours.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {colors.map((color, index) => (
            <div
              key={`${color}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-2"
            >
              <div
                className="h-9 w-9 rounded-md border border-black/10"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-medium text-gray-600">{color}</span>
              <button
                type="button"
                onClick={() => removeColor(index)}
                className="text-gray-400 hover:text-red-600"
                aria-label={`Remove colour ${color}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded border border-gray-200 bg-white p-1"
            aria-label="Choose a brand colour"
          />
          <input
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-10 w-32 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#A82B45]"
            placeholder="#FFFFFF"
          />
          <button
            type="button"
            onClick={addColor}
            disabled={colors.length >= 6}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <Plus size={15} />
            Add colour
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">You can add up to 6 colours.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[#F8EDF0] p-2.5 text-[#A82B45]">
            <Globe size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-[#242424]">Online presence</h2>
            <p className="text-xs text-gray-500">
              Add your website and a short description of your brand.
            </p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-700">Website URL</label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourcompany.com"
          className="mb-5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#A82B45]"
        />

        <label className="mb-2 block text-sm font-medium text-gray-700">
          About your brand
          <span className="ml-2 text-xs font-normal text-gray-400">Optional</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe your company, its personality, visual direction, and anything else the team should know..."
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#A82B45]"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[#F8EDF0] p-2.5 text-[#A82B45]">
            <Type size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-[#242424]">Typography</h2>
            <p className="text-xs text-gray-500">Tell us which fonts your brand uses, if known.</p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-700">Brand font</label>
        <input
          value={font}
          onChange={(e) => setFont(e.target.value)}
          placeholder="e.g. Inter, Helvetica, Poppins"
          className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#A82B45]"
        />
      </div>

      {saved && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Brand Kit completed!</p>
            <p className="mt-1 text-green-700">
              Your onboarding interface is complete. Backend saving will be connected in a later
              phase.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse justify-between gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center">
        <Link
          href={`/c/${clientId}/onboarding`}
          className="text-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          Back to onboarding overview
        </Link>

        {saved ? (
          <Link
            href={`/c/${clientId}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#A82B45] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8F233A]"
          >
            Go to Client Workspace
            <ArrowRight size={16} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#A82B45] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8F233A]"
          >
            Complete onboarding
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
