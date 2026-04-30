import { NextRequest, NextResponse } from 'next/server'
import { supabase } from "@/app/lib/supabase/client"

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .slice(0, 200)
}

// POST - create a news article
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const title = body.title
    const summary = body.summary
    const content = body.content
    const source_url = body.source_url
    const published_at = body.published_at
    let syndicate_id = body.syndicate_id

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!syndicate_id) {
      const { data: firstSyndicate } = await supabase
        .from('syndicates')
        .select('id')
        .limit(1)
        .single()
      syndicate_id = firstSyndicate?.id ?? null
    }

    if (!syndicate_id) {
      return NextResponse.json({ error: 'No syndicate found' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('news_items')
      .insert({
        title,
        summary,
        content,
        source_url,
        published_at: published_at || new Date().toISOString(),
        syndicate_id,
        slug: slugify(title),
        status: 'published',
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
// GET - fetch all news
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const syndicate_id = searchParams.get('syndicate_id')

    let query = supabase
      .from('news_items')
      .select('*, syndicate:syndicates(id, name)')
      .order('published_at', { ascending: false })
      .limit(20)

    if (syndicate_id) {
      query = query.eq('syndicate_id', syndicate_id)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data ?? [], { status: 200 })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
