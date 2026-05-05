import axios from 'axios'
import * as cheerio from 'cheerio'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'ar,en;q=0.9',
}

export async function scrapePhysiciansNews() {
  const { data: html } = await axios.get(
    'https://www.lopt-lb.org/category/news/',
    { headers: HEADERS }
  )

  const $ = cheerio.load(html)
  const items: any[] = []

  $('.post').each((_, el) => {
    const title = $(el).find('.entry-title').first().text().trim()
    const link = $(el).find('.entry-title a, a').first().attr('href') ?? ''
    const date = $(el).find('time').first().attr('datetime')
      ?? $(el).find('.entry-date').first().text().trim()
    const summary = $(el).find('p').first().text().trim()

    if (title && link) {
      items.push({
        title,
        summary: summary.slice(0, 300),
        source_url: link,
        published_at: date || new Date().toISOString(),
      })
    }
  })

  return items
}