import axios from 'axios'
import * as cheerio from 'cheerio'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'ar,en;q=0.9',
}

export async function scrapeTripoliBarNews() {
  const { data: html } = await axios.get(
    'https://www.nl-bar.org/Category?CID=5',
    { headers: HEADERS }
  )

  const $ = cheerio.load(html)
  const items: any[] = []

  $('article').each((_, el) => {
    const title = $(el).find('h2, h3').first().text().trim()

    // Link is on the h2/h3 text directly — find matching link from all links
    const matchingLink = $('a').filter((_, a) => {
      return $(a).text().trim().slice(0, 30) === title.slice(0, 30)
    }).first().attr('href') ?? ''

    const link = matchingLink.startsWith('http')
      ? matchingLink
      : matchingLink ? `https://www.nl-bar.org/${matchingLink}` : ''

    if (title && link) {
      items.push({
        title,
        summary: '',
        source_url: link,
        published_at: new Date().toISOString(),
      })
    }
  })

  return items
}