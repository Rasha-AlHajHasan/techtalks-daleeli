import axios from 'axios'
import * as cheerio from 'cheerio'

const BASE_URL = 'https://www.orlb.org/';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ar,en;q=0.9',
}

async function main() {
  try {
    const { data: html } = await axios.get(`${BASE_URL}?page=category&id=67`, { headers: HEADERS });
    const $ = cheerio.load(html);
    
    const articles: { title: string; link: string }[] = [];

    // Strategy: Find links that point to 'page=article' specifically
    $('a[href*="page=article"]').each((_, el) => {
      const title = $(el).text().trim();
      let href = $(el).attr('href') ?? '';

      // Clean the URL: ensure it's absolute
      const fullLink = href.startsWith('http') ? href : `${BASE_URL}${href}`;

      // Only add if we have a title and we haven't added this link already
      if (title.length > 10 && !articles.some(a => a.link === fullLink)) {
        articles.push({ title, link: fullLink });
      }
    });

    console.log(`Successfully extracted ${articles.length} unique articles.\n`);

    articles.forEach((art, i) => {
      console.log(`${i + 1}. ${art.title}`);
      console.log(`   Link: ${art.link}`);
      console.log('--------------------------------------------------');
    });

  } catch (err: any) {
    console.error('Scraping failed:', err.message);
  }
}

main();