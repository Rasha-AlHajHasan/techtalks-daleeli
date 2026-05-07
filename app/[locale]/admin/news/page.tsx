"use client"

import { useState } from "react"

export default function AdminNewsPage() {
 const [form, setForm] = useState({
  title: "",
  summary: "",
  content: "",
  source_url: "",
  published_at: new Date().toISOString().split("T")[0],
  content_type: "news",
})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit() {
    if (!form.title) {
      setMessage("Title is required")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(`Error: ${data.error}`)
      } else {
        setMessage("✅ Article published successfully!")
        setForm({
          title: "",
          summary: "",
          content: "",
          source_url: "",
          published_at: new Date().toISOString().split("T")[0],
          content_type: "news",
        })
      }
    } catch (err) {
      setMessage("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-[#0d2240] mb-2">Add News Article</h1>
      <p className="text-sm text-slate-500 mb-8">
        Copy news from oea.org.lb and paste it here
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Title *
          </label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Article title"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Summary
          </label>
          <textarea
            value={form.summary}
            onChange={e => setForm({ ...form, summary: e.target.value })}
            placeholder="Short summary shown on the news card"
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>
        <div>
  <label className="block text-sm font-semibold text-slate-700 mb-1">
    Content Type
  </label>
  <select
    value={form.content_type}
    onChange={e => setForm({ ...form, content_type: e.target.value })}
    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
  >
    <option value="news">News</option>
    <option value="announcements">Announcement</option>
    <option value="decisions">Decision</option>
    <option value="activities">Activity</option>
    <option value="circulars">Circular</option>
    <option value="events">Event</option>
    <option value="membership_updates">Membership Update</option>
  </select>
</div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Full Content
          </label>
          <textarea
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            placeholder="Full article content"
            rows={6}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Source URL
          </label>
          <input
            value={form.source_url}
            onChange={e => setForm({ ...form, source_url: e.target.value })}
            placeholder="https://www.oea.org.lb/news/article-name"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Published Date
          </label>
          <input
            type="date"
            value={form.published_at}
            onChange={e => setForm({ ...form, published_at: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>

        {message && (
          <p className={`text-sm font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#1a3560] hover:bg-[#0d2240] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Article"}
        </button>
      </div>
    </div>
  )
}