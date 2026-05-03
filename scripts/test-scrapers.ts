import { scrapeLOPNews } from '@/app/lib/scrapers/lop';
import { scrapeOEANews } from '@/app/lib/scrapers/oea';

async function test() {
  console.log('Testing LOP scraper...');
  try {
    const lopItems = await scrapeLOPNews();
    console.log(`LOP: Found ${lopItems.length} items`);
    if (lopItems.length > 0) {
      console.log('Sample:', JSON.stringify(lopItems[0], null, 2));
    }
  } catch (e: any) {
    console.error('LOP Error:', e.message);
  }

  console.log('\nTesting OEA scraper...');
  try {
    const oeaItems = await scrapeOEANews();
    console.log(`OEA: Found ${oeaItems.length} items`);
    if (oeaItems.length > 0) {
      console.log('Sample:', JSON.stringify(oeaItems[0], null, 2));
    }
  } catch (e: any) {
    console.error('OEA Error:', e.message);
  }
}

test();