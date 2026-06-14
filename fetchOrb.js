import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://21st.dev/community/components/ElevenLabs/orb/default', { waitUntil: 'networkidle' });
    
    // Look for the code block or a tab that says "Code"
    // Usually on 21st.dev there's a Code tab
    const codeTab = await page.getByRole('tab', { name: /code/i });
    if (await codeTab.count() > 0) {
        await codeTab.click();
        await page.waitForTimeout(1000); // wait for code to render
    }

    // Try to get the text content of the pre/code block
    const codeBlocks = await page.locator('pre').allTextContents();
    
    fs.writeFileSync('orb_scraped.txt', codeBlocks.join('\n\n---NEXT BLOCK---\n\n'));
    console.log('Successfully scraped code blocks to orb_scraped.txt');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
