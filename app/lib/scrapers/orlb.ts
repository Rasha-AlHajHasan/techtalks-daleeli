import axios from 'axios'
import * as cheerio from 'cheerio'

const BASE_URL = 'https://www.orlb.org/'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ar,en;q=0.9',
}

export async function scrapeORLBNews() {
  const { data: html } = await axios.get(
    `${BASE_URL}?page=category&id=67`,
    { headers: HEADERS }
  )

  const $ = cheerio.load(html)
  const items: any[] = []

  $('a[href*="page=article"]').each((_, el) => {
    const title = $(el).text().trim()
    const href = $(el).attr('href') ?? ''
    const fullLink = href.startsWith('http') ? href : `${BASE_URL}${href}`

    if (title.length > 10 && !items.some(a => a.source_url === fullLink)) {
      items.push({
        title,
        summary: '',
        source_url: fullLink,
        published_at: new Date().toISOString(),
      })
    }
  })

  return items
}