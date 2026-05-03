import axios from 'axios'
import * as cheerio from 'cheerio'

async function test() {
  try {
    const { data: html } = await axios.get(
      'https://lopbeirut.org/en/category/news/',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ar,en;q=0.9',
          'Referer': 'https://lopbeirut.org/',
        }
      }
    )

    const $ = cheerio.load(html)
    
    // Log the page title to confirm we got through
    console.log('Page title:', $('title').text())
    
    // Try to find news articles
    const articles: any[] = []
    $('article, .post, .news-item, .elementor-post').each((_, el) => {
      articles.push({
        title: $(el).find('h2, h3, .entry-title').first().text().trim(),
        link: $(el).find('a').first().attr('href'),
        date: $(el).find('time, .entry-date').first().text().trim(),
      })
    })

    console.log(`Found ${articles.length} articles:`)
    console.log(articles.slice(0, 3))

  } catch (err: any) {
    console.error('Failed:', err.message)
  }
}

test()