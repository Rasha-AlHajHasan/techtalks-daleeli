"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

export default function AdminNewsPage() {
  const t = useTranslations("admin.news")
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
      setMessage(t("messages.titleRequired"))
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
        setMessage(t("messages.error", { error: data.error }))
      } else {
        setMessage(t("messages.success"))
        setForm({
          title: "",
          summary: "",
          content: "",
          source_url: "",
          published_at: new Date().toISOString().split("T")[0],
          content_type: "news",
        })
      }
    } catch {
      setMessage(t("messages.genericError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-[#0d2240] mb-2">{t("title")}</h1>
      <p className="text-sm text-slate-500 mb-8">
        {t("description")}
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {t("fields.title.label")}
          </label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder={t("fields.title.placeholder")}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {t("fields.summary.label")}
          </label>
          <textarea
            value={form.summary}
            onChange={e => setForm({ ...form, summary: e.target.value })}
            placeholder={t("fields.summary.placeholder")}
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {t("fields.contentType.label")}
          </label>
          <select
            value={form.content_type}
            onChange={e => setForm({ ...form, content_type: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          >
            <option value="news">{t("contentTypes.news")}</option>
            <option value="announcements">
              {t("contentTypes.announcements")}
            </option>
            <option value="decisions">{t("contentTypes.decisions")}</option>
            <option value="activities">{t("contentTypes.activities")}</option>
            <option value="circulars">{t("contentTypes.circulars")}</option>
            <option value="events">{t("contentTypes.events")}</option>
            <option value="membership_updates">
              {t("contentTypes.membershipUpdates")}
            </option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {t("fields.content.label")}
          </label>
          <textarea
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            placeholder={t("fields.content.placeholder")}
            rows={6}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {t("fields.sourceUrl.label")}
          </label>
          <input
            value={form.source_url}
            onChange={e => setForm({ ...form, source_url: e.target.value })}
            placeholder={t("fields.sourceUrl.placeholder")}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {t("fields.publishedDate.label")}
          </label>
          <input
            type="date"
            value={form.published_at}
            onChange={e => setForm({ ...form, published_at: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3560]"
          />
        </div>

        {message && (
          <p
            className={`text-sm font-medium ${
              message === t("messages.success")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#1a3560] hover:bg-[#0d2240] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? t("actions.publishing") : t("actions.publish")}
        </button>
      </div>
    </div>
  )
}
