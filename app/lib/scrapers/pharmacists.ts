import axios from 'axios'
import * as cheerio from 'cheerio'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'ar,en;q=0.9',
}

export async function scrapePharmacistsNews() {
  const { data: html } = await axios.get(
    'https://www.opl.org.lb/allnews.php',
    { headers: HEADERS }
  )

  const $ = cheerio.load(html)
  const items: any[] = []

  $('a[href*="newsdetails"]').each((_, el) => {
    const title = $(el).text().trim()
    const href = $(el).attr('href') ?? ''

    if (title.length > 5 && href) {
      items.push({
        title,
        summary: '',
        source_url: `https://www.opl.org.lb/${href}`,
        published_at: new Date().toISOString(),
      })
    }
  })

  return items
}