// @ts-ignore
import puppeteer from 'puppeteer-extra'
// @ts-ignore
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36')

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ar,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Upgrade-Insecure-Requests': '1',
  })

  try {
    await page.goto('https://www.lda.org.lb/news/', {
      waitUntil: 'load',
      timeout: 60000
    })
  } catch {
    console.log('Timeout — continuing...')
  }

  await new Promise(r => setTimeout(r, 8000))

  const title = await page.title()
  console.log('Page title:', title)

  const text = await page.evaluate(() => document.body.innerText)
  console.log('\nPage text (first 2000 chars):')
  console.log(text.slice(0, 2000))

  await browser.close()
}

main()