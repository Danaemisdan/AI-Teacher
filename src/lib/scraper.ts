import { chromium } from 'playwright'
import * as cheerio from 'cheerio'

export async function searchDuckDuckGo(query: string, onFrame: (b64: string) => void) {
  const browser = await chromium.launch({ headless: true })
  
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    })
    const page = await context.newPage()
    
    // Function to capture and emit frame
    const captureFrame = async () => {
      try {
        const buffer = await page.screenshot({ type: 'jpeg', quality: 50 })
        onFrame(buffer.toString('base64'))
      } catch (e) {
        // ignore screenshot errors if page is navigating
      }
    }

    // Capture initial blank/loading state
    await captureFrame()

    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    
    // Navigate and capture frames during navigation
    const navPromise = page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
    
    // Polling for frames while loading
    const frameInterval = setInterval(captureFrame, 400)
    
    await navPromise;
    clearInterval(frameInterval)
    
    // Final frame of results
    await captureFrame()
    
    const content = await page.content()
    const $ = cheerio.load(content)
    
    const results: { title: string, snippet: string, link: string }[] = []
    
    $('.result').each((i, el) => {
      if (i >= 5) return false // Get top 5 results max
      
      const title = $(el).find('.result__title').text().trim()
      const snippet = $(el).find('.result__snippet').text().trim()
      const link = $(el).find('.result__url').attr('href') || ''
      
      if (title && snippet) {
        let cleanLink = link;
        if (cleanLink.startsWith('//duckduckgo.com/l/?uddg=')) {
          const urlParams = new URLSearchParams(cleanLink.replace('//duckduckgo.com/l/', ''));
          cleanLink = urlParams.get('uddg') || cleanLink;
        }

        results.push({ title, snippet, link: cleanLink })
      }
    })
    
    return results
  } catch (error) {
    console.error('Scraping error:', error)
    return []
  } finally {
    await browser.close()
  }
}
