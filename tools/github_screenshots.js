/* Screenshot public GitHub pages (Issues, pull requests, tags) as process evidence for Part F.6.

   node tools/github_screenshots.js                       the Issue and PR chains of I-07 and I-08
   node tools/github_screenshots.js name=url [name=url]   any other public pages, e.g. release=https://github.com/Punge089/classpulse/pull/26

   Writes docs/sprints/sprint-1/evidence/github/<name>.png. Only public pages work: the project board is private and
   must be captured by hand while signed in. The page is cut at 3200 px so a long conversation stays readable. */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const OUT = path.resolve(__dirname, "..", "docs", "sprints", "sprint-1", "evidence", "github");
const REPO = "https://github.com/Punge089/classpulse";
const DEFAULT = {
  "issue-7-survey-authoring": `${REPO}/issues/7`,
  "pr-18-survey-authoring": `${REPO}/pull/18`,
  "issue-8-response-submission": `${REPO}/issues/8`,
  "pr-21-response-submission": `${REPO}/pull/21`
};

async function main() {
  const given = process.argv.slice(2).map(a => a.split(/=(.+)/).slice(0, 2));
  const pages = given.length ? Object.fromEntries(given) : DEFAULT;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, colorScheme: "light" });
  const page = await context.newPage();
  try {
    for (const [name, url] of Object.entries(pages)) {
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      if (!response || response.status() !== 200) throw new Error(`${url} answered ${response && response.status()}`);
      await page.waitForLoadState("networkidle").catch(() => {});
      const height = Math.min(3200, await page.evaluate(() => document.documentElement.scrollHeight));
      await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: { x: 0, y: 0, width: 1200, height } });
      console.log(`${name}: ${url} -> ${name}.png (${height}px)`);
    }
  } finally {
    await browser.close();
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
