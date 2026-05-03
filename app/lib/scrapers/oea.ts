import axios from 'axios';
import * as cheerio from 'cheerio';

type ScrapedNewsItem = {
  title: string;
  summary: string;
  source_url: string;
  published_at: string;
};

export async function scrapeOEANews() {
    const {data: html} = await axios.get(
        'https://www.oea.org.lb/news/',
        {
            proxy: false,
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                'Accept':'text/html,application/xhtml+xml',
                'Accept-Language':'ar,en;q=0.9',
                'referrer':'https://www.oea.org.lb/',
            }
        }
    );
    const $ = cheerio.load(html);
    const items: ScrapedNewsItem[] = [];

    // The site uses h3.entry-title or article h3, not <article> tags
    $('h3.entry-title, article h3, .news-item h3, .post h3').each((_, el) => {
        const parent = $(el).closest('a, .post, article, .news-item');
        const link = parent.find('a').attr('href') ?? $(el).parent().find('a').attr('href') ?? '';
        const title = $(el).text().trim();
        
        // Get date from parent element
        const date = parent.find('.date, time, .post-date').first().text().trim()
            ?? parent.find('[datetime]').attr('datetime') ?? '';
        
        // Get summary/description
        const summary = parent.find('p, .excerpt, .summary').first().text().trim() ?? '';

        if (title && link) {
            items.push({
                title,
                summary: summary.slice(0, 300),
                source_url: link.startsWith('http') ? link : `https://www.oea.org.lb${link}`,
                published_at: date || new Date().toISOString(),
            });
        }
    });

    // Fallback: parse from links in news list
    if (items.length === 0) {
        $('a[href*="/news/"]').each((_, el) => {
            const href = $(el).attr('href') ?? '';
            const title = $(el).text().trim();
            if (href && title && title.length > 5) {
                items.push({
                    title,
                    summary: '',
                    source_url: href.startsWith('http') ? href : `https://www.oea.org.lb${href}`,
                    published_at: new Date().toISOString(),
                });
            }
        });
    }

    return items;
}
