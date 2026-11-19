'use client'

import Link from 'next/link'
import { use } from 'react'
import { useState } from 'react'
import {
  ArrowLeft,
  Search,
  Lightbulb,
  MessageSquare,
  BookOpen,
  Quote,
  Filter,
  ArrowUpRight,
  Plus,
  Layers3,
} from 'lucide-react'

type KnowledgeItem = {
  id: number
  title: string
  content: string
  category: string
  source: string
  date: string
}

const sampleKnowledge: KnowledgeItem[] = [
  {
    id: 1,
    title: 'Building a business through consistency',
    content:
      'Consistency matters more than waiting for the perfect strategy. Small improvements over time create a sustainable competitive advantage.',
    category: 'Founder Lessons',
    source: 'Founder Interview',
    date: 'Nov 12, 2026',
  },
  {
    id: 2,
    title: 'Why customer feedback matters',
    content:
      'Customers often reveal problems that internal teams overlook. Listening carefully can help shape better products and decisions.',
    category: 'Business Philosophy',
    source: 'Founder Interview',
    date: 'Nov 12, 2026',
  },
  {
    id: 3,
    title: 'The early challenges of hiring',
    content:
      'Hiring too quickly without understanding the actual role requirements can create more operational problems than it solves.',
    category: 'Personal Story',
    source: 'Founder Interview',
    date: 'Nov 10, 2026',
  },
  {
    id: 4,
    title: 'Marketing is about trust',
    content:
      'People do not simply buy a service. They want to trust the people behind the business and understand the value being offered.',
    category: 'Industry Insights',
    source: 'Founder Interview',
    date: 'Nov 10, 2026',
  },
  {
    id: 5,
    title: 'A lesson from a failed project',
    content:
      'A project that did not deliver the expected results helped us identify gaps in planning, communication and execution.',
    category: 'Personal Story',
    source: 'Founder Interview',
    date: 'Nov 9, 2026',
  },
  {
    id: 6,
    title: 'Focus on solving real problems',
    content:
      'Instead of chasing every new trend, focus on solving problems that customers genuinely experience.',
    category: 'Founder Lessons',
    source: 'Founder Questionnaire',
    date: 'Nov 8, 2026',
  },
]

const categories = [
  'All',
  'Founder Lessons',
  'Business Philosophy',
  'Personal Story',
  'Industry Insights',
]

export default function KnowledgeVaultPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredKnowledge = sampleKnowledge.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory

    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href={`/c/${clientId}`}
          className="inline-flex items-center gap-2 text-sm text-[#89817E] transition hover:text-[#252326]"
        >
          <ArrowLeft size={16} />
          Back to workspace
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
                <Layers3 size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#252326]">
                  Knowledge Vault
                </h1>
                <p className="mt-1 text-sm text-[#89817E]">
                  Capture the founder&apos;s knowledge, stories and ideas.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E9E3E1] bg-white px-4 py-2.5 text-sm font-medium text-[#252326] transition hover:bg-[#F8F6F5]"
          >
            <Plus size={16} />
            Add knowledge
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total knowledge',
            value: '24',
            icon: BookOpen,
            description: 'Collected insights',
          },
          {
            label: 'Founder lessons',
            value: '08',
            icon: Lightbulb,
            description: 'Experiences & lessons',
          },
          {
            label: 'Interview insights',
            value: '16',
            icon: MessageSquare,
            description: 'Extracted insights',
          },
          {
            label: 'Stories',
            value: '06',
            icon: Quote,
            description: 'Personal experiences',
          },
        ].map((stat) => {
          const Icon = stat.icon

          return (
            <div key={stat.label} className="rounded-2xl border border-[#EAE5E3] bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#89817E]">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-[#252326]">{stat.value}</p>
                  <p className="mt-1 text-xs text-[#A39B98]">{stat.description}</p>
                </div>
                <div className="rounded-xl bg-[#F8F5F4] p-3 text-[#A82B45]">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Introduction */}
      <div className="rounded-2xl border border-[#EAE5E3] bg-[#252326] p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/10 p-3">
            <Lightbulb size={22} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-medium">The founder&apos;s knowledge base</h2>
            <p className="max-w-3xl text-sm leading-6 text-white/70">
              Every interview, experience and opinion contributes to a growing knowledge library.
              These insights become the foundation for authentic LinkedIn content, strategies and
              storytelling.
            </p>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#A39B98]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search insights, stories or topics..."
              className="w-full rounded-xl border border-[#EAE5E3] bg-white py-3 pr-4 pl-10 text-sm text-[#252326] transition outline-none focus:border-[#A82B45]"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-[#89817E]">
            <Filter size={16} />
            <span>Filter knowledge</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeCategory === category
                  ? 'border-[#A82B45] bg-[#A82B45] text-white'
                  : 'border-[#EAE5E3] bg-white text-[#89817E] hover:border-[#C9BDBA] hover:text-[#252326]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge cards */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Knowledge entries</h2>
            <p className="mt-1 text-sm text-[#89817E]">
              Browse the founder&apos;s collected insights.
            </p>
          </div>
          <span className="text-sm text-[#89817E]">{filteredKnowledge.length} entries</span>
        </div>

        {filteredKnowledge.length === 0 ? (
          <div className="rounded-2xl border border-[#EAE5E3] bg-white px-6 py-16 text-center">
            <Search size={24} className="mx-auto text-[#A39B98]" />
            <p className="mt-4 font-medium text-[#252326]">No knowledge entries found</p>
            <p className="mt-2 text-sm text-[#89817E]">Try another search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredKnowledge.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-[#EAE5E3] bg-white p-5 transition hover:border-[#D8C7CA] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-[#FBEFF1] px-3 py-1 text-xs font-medium text-[#A82B45]">
                    {item.category}
                  </span>
                  <button
                    type="button"
                    className="text-[#A39B98] transition hover:text-[#A82B45]"
                    aria-label={`View ${item.title}`}
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#252326]">{item.title}</h3>

                <p className="mt-3 text-sm leading-6 text-[#89817E]">{item.content}</p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0ECEB] pt-4">
                  <div className="flex items-center gap-2 text-xs text-[#89817E]">
                    <MessageSquare size={14} />
                    {item.source}
                  </div>
                  <span className="text-xs text-[#A39B98]">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-[#EAE5E3] bg-[#FAF8F7] p-4">
        <p className="text-sm leading-6 text-[#89817E]">
          <span className="font-medium text-[#252326]">Prototype:</span> These entries are sample
          data for the frontend. In a later phase, interview transcripts, questionnaire responses
          and extracted insights will populate this vault through the Renegade knowledge pipeline.
        </p>
      </div>
    </div>
  )
}
