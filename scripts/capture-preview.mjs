import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({channel:'chrome', headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:"reduce"});
await mkdir('artifacts',{recursive:true});
for (const [name,route,width,height] of [['home-desktop','/',1440,1000],['home-mobile','/',390,844],['products-desktop','/products',1440,1000],['contact-mobile','/contact',390,844]]) {
  await page.setViewportSize({width,height});
  await page.goto('http://127.0.0.1:3100'+route,{waitUntil:'networkidle',timeout:120000});
  await page.evaluate(() => document.fonts.ready);
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < totalHeight; y += height * 0.8) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(100); }
  await page.evaluate(async () => { await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))); window.scrollTo(0, 0); });
  await page.screenshot({path:`artifacts/${name}.png`,fullPage:true});
  if (name === "home-desktop") await page.screenshot({path:"artifacts/home-preview.png",fullPage:false});
  console.log(name, await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)})));
}
await browser.close();
