import puppeteer from 'puppeteer'

export async function scrapeBBANews() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36')

  try {
    await page.goto('https://bba.org.lb/ar/Syndicat/News', {
      waitUntil: 'load',
      timeout: 60000
    })
  } catch {
    // continue with partial load
  }

  await new Promise(r => setTimeout(r, 5000))

  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('td')).map(td => {
      const text = (td.textContent ?? '').trim()
      if (text.length < 15 || text.includes('\n')) return null
      return { title: text }
    }).filter(Boolean)
  })

  await browser.close()

  return items.map((item: any) => ({
    title: item.title,
    summary: '',
    source_url: 'https://bba.org.lb/ar/Syndicat/News',
    published_at: new Date().toISOString(),
  }))
}