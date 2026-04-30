import axios from 'axios'
import * as cheerio from 'cheerio'

type ScrapedNewsItem = {
  title: string;
  summary: string;
  source_url: string;
  published_at: string;
};

export async function scrapeLOPNews() {
  const { data: html } = await axios.get(
    'https://lopbeirut.org/en/category/news/',
    {
      proxy: false,
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en,ar;q=0.9',
      }
    }
  )

  const $ = cheerio.load(html)
  const items: ScrapedNewsItem[] = []

  $('article, .post, .td_module_wrap, .jeg_post, .elementor-post').each((_, el) => {
    const title = $(el).find('h2, h3, .entry-title, .jeg_post_title').first().text().trim()
    const link = $(el).find('a').first().attr('href') ?? ''
    const summary = $(el).find('p, .entry-summary, .entry-content, .jeg_post_excerpt').first().text().trim()
    const date = $(el).find('time').first().attr('datetime')
      ?? $(el).find('.entry-date, .posted-on, .meta-date, .td-post-date').first().text().trim()

    if (title && link) {
      items.push({
        title,
        summary: summary.slice(0, 300),
        source_url: link,
        published_at: date || new Date().toISOString(),
      })
    }
  })

  if (items.length === 0) {
    $('a[href*="/news/"], a[href*="/en/news/"]').each((_, el) => {
      const href = $(el).attr('href') ?? ''
      const title = $(el).text().trim()

      if (href && title && title.length > 5) {
        items.push({
          title,
          summary: '',
          source_url: href.startsWith('http') ? href : `https://lopbeirut.org${href}`,
          published_at: new Date().toISOString(),
        })
      }
    })
  }

  return items
}
