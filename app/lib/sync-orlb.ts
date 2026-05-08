import { supabase } from '@/app/lib/supabase/client'
import { scrapeORLBNews } from '@/app/lib/scrapers/orlb'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

async function findSyndicateId(keywords: string[]) {
  for (const keyword of keywords) {
    const { data } = await supabase
      .from('syndicates')
      .select('id')
      .ilike('name', `%${keyword}%`)
      .maybeSingle()
    if (data?.id) return data.id
  }
  return null
}

async function resolveSourceId(syndicateId: string) {
  const { data: fromNews } = await supabase
    .from('news_items')
    .select('source_id')
    .eq('syndicate_id', syndicateId)
    .not('source_id', 'is', null)
    .limit(1)
    .maybeSingle()

  if (fromNews?.source_id) return fromNews.source_id

  const { data: fromSources } = await supabase
    .from('syndicate_sources')
    .select('id')
    .eq('syndicate_id', syndicateId)
    .limit(1)
    .maybeSingle()

  return fromSources?.id ?? null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .slice(0, 200)
}

async function saveNewsItem(
  item: { title: string; summary: string; source_url: string; published_at: string },
  syndicateId: string,
  sourceId: string
) {
  const slug = slugify(item.title)

  const { data: existing } = await supabase
    .from('news_items')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  const payload = {
    title: item.title,
    slug,
    summary: item.summary,
    source_url: item.source_url,
    published_at: item.published_at,
    fetched_at: new Date().toISOString(),
    source_id: sourceId,
    syndicate_id: syndicateId,
    status: 'published',
    is_active: true,
    language: 'ar',
  }

  if (existing?.id) {
    return supabase.from('news_items').update(payload).eq('id', existing.id)
  }
  return supabase.from('news_items').insert(payload)
}

export async function syncORLBNews() {
  console.log('Starting ORLB news sync...')

  const syndicateId = await findSyndicateId(['محرري', 'الصحافة', 'محررين', 'orlb'])
  if (!syndicateId) {
    console.error('ORLB syndicate not found')
    return { inserted: 0, found: 0 }
  }

  const sourceId = await resolveSourceId(syndicateId)
  if (!sourceId) {
    console.error('No source_id found for ORLB')
    return { inserted: 0, found: 0 }
  }

  const { data: job } = await supabase
    .from('crawl_jobs')
    .insert({
      source_id: sourceId,
      job_type: 'page_scrape',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  try {
    const items = await scrapeORLBNews()
    console.log(`Found ${items.length} articles`)
    let inserted = 0

    for (const item of items) {
      const { error } = await saveNewsItem(item, syndicateId, sourceId)
      if (!error) inserted++
      else console.error('Insert error:', error.message)
    }

    if (job?.id) {
      await supabase.from('crawl_jobs').update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        items_found: items.length,
        items_inserted: inserted,
      }).eq('id', job.id)
    }

    console.log(`Done. Inserted: ${inserted}/${items.length}`)
    return { inserted, found: items.length }

  } catch (error: unknown) {
    const msg = getErrorMessage(error)
    if (job?.id) {
      await supabase.from('crawl_jobs').update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error_message: msg,
      }).eq('id', job.id)
    }
    console.error('Sync failed:', msg)
    return { inserted: 0, found: 0, error: msg }
  }
}