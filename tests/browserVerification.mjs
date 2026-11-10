import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Simple static server for dist
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const distDir = path.resolve(process.cwd(), 'dist');

const server = createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);
  
  if (existsSync(filePath)) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  } else {
    // SPA fallback
    const indexHtml = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync(indexHtml));
  }
});

server.listen(4173, async () => {
  console.log('Static preview server running on http://localhost:4173');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    // Check initial language state (Arabic / rtl)
    const initialDir = await page.evaluate(() => document.documentElement.dir);
    console.log(`Initial html dir: ${initialDir}`);
    if (initialDir !== 'rtl') throw new Error(`Expected dir to be rtl, got: ${initialDir}`);

    // Find language switcher button
    const langBtn = page.locator('button:has-text("EN"), button:has-text("English")').first();
    const isLangBtnVisible = await langBtn.isVisible();
    console.log(`Language toggle button visible: ${isLangBtnVisible}`);
    if (!isLangBtnVisible) throw new Error('Language switcher button not found on storefront!');

    // Click language switcher
    await langBtn.click();
    await page.waitForTimeout(500);

    // Verify switched to English (ltr)
    const enDir = await page.evaluate(() => document.documentElement.dir);
    console.log(`After click dir: ${enDir}`);
    if (enDir !== 'ltr') throw new Error(`Expected dir to be ltr after switching, got: ${enDir}`);

    // Check that button now shows Arabic option
    const arBtn = page.locator('button:has-text("عربي")').first();
    const isArBtnVisible = await arBtn.isVisible();
    console.log(`Arabic switch back button visible: ${isArBtnVisible}`);
    if (!isArBtnVisible) throw new Error('Arabic switch back button not visible in EN mode!');

    // Click back to Arabic
    await arBtn.click();
    await page.waitForTimeout(500);
    const backToArDir = await page.evaluate(() => document.documentElement.dir);
    console.log(`After second click dir: ${backToArDir}`);
    if (backToArDir !== 'rtl') throw new Error(`Expected dir to be rtl after switching back, got: ${backToArDir}`);

    // Check floating petals element exists
    const petalsContainer = await page.$('.petal-ambient, [data-testid="rose-petals"], .petal-canvas, .z-20');
    console.log(`Petals container found: ${!!petalsContainer}`);

    if (errors.length > 0) {
      console.warn('Page errors logged:', errors);
    } else {
      console.log('✅ All browser assertions passed with 0 errors!');
    }

    await browser.close();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    if (browser) await browser.close();
    server.close();
    process.exit(1);
  }
});
