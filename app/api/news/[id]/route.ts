import {NextRequest,NextResponse} from 'next/server';
import { supabase } from "@/app/lib/supabase/client"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const syndicate_id = searchParams.get('syndicate_id')

    let query = supabase
      .from('news_items')
      .select('*, syndicates(name)')
      .order('published_at', { ascending: false })
      .limit(20)

    if (syndicate_id) {
      query = query.eq('syndicate_id', syndicate_id)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

     return NextResponse.json(data ?? [])
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load news"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params
    const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id)

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ message: 'News item deleted' })
}
