/* Take the DEMO-1…3 screenshots and the API log for Part F of the report.

   node tools/demo_screenshots.js            (from the repository root, in PowerShell)

   It starts the API and the Vite client itself (ports 3000 and 5173 must be free), drives the real browser with the
   seeded accounts, restarts the API once for DEMO-1 (NFR-05), and writes
     docs/sprints/sprint-1/evidence/screenshots/demo*.png
     docs/sprints/sprint-1/evidence/screenshots/demo-api-log.txt
   The log has two kinds of lines: the API calls this script makes itself (method, path, status and the response body,
   except the body of a login, which is not written) and, marked "browser", the method, path and status of every /api
   request the browser pages make while the demos run (login, create, publish, list, submit, logout). Request bodies,
   cookies and passwords are never written. The script's own calls all go through one helper, so none is missing; the polling
   of /api/health while the servers start is the only request left out.
   The development database must be seeded (README). Surveys created by a run stay in the development database.
   The password is read from SEED_PASSWORD or server/.env and is never written to any output. */
const { spawn, execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { chromium, request } = require("@playwright/test");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "sprints", "sprint-1", "evidence", "screenshots");
const BASE = "http://localhost:5173";
const API = "http://localhost:3000";
const RATING = "How was the pace of the lectures?";
const CHOICE = "Would you recommend this course?";

function seedPassword() {
  if (process.env.SEED_PASSWORD) return process.env.SEED_PASSWORD;
  const line = fs.readFileSync(path.join(ROOT, "server", ".env"), "utf-8").split(/\r?\n/).find(l => l.startsWith("SEED_PASSWORD="));
  if (!line) throw new Error("Set SEED_PASSWORD or server/.env");
  return line.slice("SEED_PASSWORD=".length).trim().replace(/^["']|["']$/g, "");
}

const logLines = [];
let currentDemo = "run";
function log(demo, text) {
  const line = `[${demo}] ${text}`;
  logLines.push(line);
  console.log(line);
}
/** Log method, path and status (nothing else) of every /api request a browser page makes. */
function watch(page, who) {
  page.on("response", res => {
    const url = new URL(res.url());
    if (!url.pathname.startsWith("/api/")) return;
    log(currentDemo, `browser (${who}): ${res.request().method()} ${url.pathname} -> ${res.status()}`);
  });
}

function start(name, args) {
  const child = spawn("npm", args, { cwd: ROOT, shell: true, stdio: "ignore" });
  child.label = name;
  return child;
}
function stop(child) {
  if (!child || child.killed) return;
  try {
    if (process.platform === "win32") execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" });
    else process.kill(-child.pid);
  } catch { /* already gone */ }
  child.killed = true;
}
async function waitFor(url, label) {
  for (let i = 0; i < 120; i++) {
    try { const r = await fetch(url); if (r.ok) return; } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`${label} did not answer at ${url}`);
}
async function portFree(url) {
  try { await fetch(url); return false; } catch { return true; }
}

async function signIn(page, email, password) {
  await page.goto(BASE + "/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
async function shot(page, file, fullPage = true) {
  await page.screenshot({ path: path.join(OUT, file), fullPage });
  console.log("   screenshot " + file);
}
async function call(demo, ctx, method, url, data) {
  const res = await ctx.fetch(API + url, { method, data });
  if (url === "/api/auth/login") {
    log(demo, `${method} ${url} -> ${res.status()} (script call; body not written)`);
    return res;
  }
  let body = "";
  try { body = JSON.stringify(await res.json()); } catch { body = "(no JSON body)"; }
  log(demo, `${method} ${url} -> ${res.status()} ${body.length > 300 ? body.slice(0, 300) + "…" : body}`);
  return res;
}

async function main() {
  const password = seedPassword();
  fs.mkdirSync(OUT, { recursive: true });
  if (!(await portFree(API + "/api/health")) || !(await portFree(BASE))) {
    throw new Error("Ports 3000 or 5173 are in use: stop the dev servers first.");
  }
  let server = start("api", ["--prefix", "server", "run", "dev"]);
  const client = start("client", ["--prefix", "client", "run", "dev", "--", "--port", "5173", "--strictPort"]);
  const browser = await chromium.launch();
  const api = await request.newContext({ baseURL: API });
  try {
    await waitFor(API + "/api/health", "API");
    await waitFor(BASE, "client");
    const run = Date.now();
    const title = "Lecture feedback W10 demo " + run;
    const view = { viewport: { width: 1100, height: 760 } };
    log("run", `commit ${execSync("git rev-parse HEAD", { cwd: ROOT }).toString().trim()}  ${new Date().toISOString()}`);

    // ---------------- DEMO-1: normal journey and persistence ----------------
    currentDemo = "DEMO-1";
    const ownerCtx = await browser.newContext(view);
    const owner = await ownerCtx.newPage();
    watch(owner, "owner1");
    await signIn(owner, "ann.lee@classpulse.test", password);
    await owner.waitForURL(/\/owner$/);
    await owner.getByRole("link", { name: "New survey" }).click();
    await owner.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
    await owner.getByLabel("Title", { exact: true }).fill(title);
    await owner.getByLabel("Question 1 text").fill(RATING);
    await owner.getByRole("button", { name: "Add question" }).click();
    await owner.getByLabel("Question 2 text").fill(CHOICE);
    await owner.getByLabel("Question 2 type").selectOption("SINGLE_CHOICE");
    await owner.getByLabel("Question 2 option 1").fill("Yes");
    await owner.getByLabel("Question 2 option 2").fill("No");
    await shot(owner, "demo1-01-owner-new-survey-form.png");
    await owner.getByRole("button", { name: "Create survey" }).click();
    await owner.waitForURL(/\/owner\/surveys\/\d+$/);
    const surveyId = Number(owner.url().match(/\/owner\/surveys\/(\d+)$/)[1]);
    await owner.getByRole("button", { name: "Publish" }).click();
    await owner.getByText("Published", { exact: true }).waitFor();
    await shot(owner, "demo1-02-owner-survey-published.png");
    log("DEMO-1", `owner1 created and published survey ${surveyId} "${title}" in CPE334 (AC-10, AC-13, AC-19)`);

    const studentCtx = await browser.newContext(view);
    const student = await studentCtx.newPage();
    watch(student, "student1");
    await signIn(student, "student1@classpulse.test", password);
    await student.waitForURL(/\/surveys$/);
    const row = student.getByRole("listitem").filter({ hasText: title });
    await row.waitFor();
    await row.scrollIntoViewIfNeeded(); // the list grows with every run, so show the part with the demo survey
    await shot(student, "demo1-03-student-survey-list.png", false);
    await row.getByRole("link", { name: title }).click();
    await student.getByText("Identified survey — your name is stored with your answers", { exact: true }).waitFor();
    await student.getByLabel("Rating 4 of 5").locator("xpath=..").click();
    await student.getByLabel("Yes", { exact: true }).check();
    await shot(student, "demo1-04-student-answer-form.png");
    await student.getByRole("button", { name: "Submit", exact: true }).click();
    await student.waitForURL(/\/responses\/\d+$/);
    await student.getByText("Thanks — your response is in.", { exact: true }).waitFor();
    const responseId = Number(student.url().match(/\/responses\/(\d+)$/)[1]);
    await shot(student, "demo1-05-student-confirmation.png");
    const studentApi = await request.newContext({ baseURL: API });
    await call("DEMO-1", studentApi, "POST", "/api/auth/login", { email: "student1@classpulse.test", password }).then(r => { if (r.status() !== 200) throw new Error("student login failed"); });
    const before = await call("DEMO-1", studentApi, "GET", `/api/responses/${responseId}`);
    const beforeBody = JSON.stringify(await before.json());

    // NFR-05: restart the API process, then retrieve the saved response again.
    stop(server);
    await new Promise(r => setTimeout(r, 1500));
    log("DEMO-1", "API process stopped; starting it again (NFR-05)");
    server = start("api", ["--prefix", "server", "run", "dev"]);
    await waitFor(API + "/api/health", "API after restart");
    log("DEMO-1", "API is back after the restart");
    await student.reload();
    await student.getByText("Thanks — your response is in.", { exact: true }).waitFor();
    await shot(student, "demo1-06-after-restart-reload-response.png");
    const after = await call("DEMO-1", studentApi, "GET", `/api/responses/${responseId}`);
    const afterBody = JSON.stringify(await after.json());
    log("DEMO-1", `response ${responseId} identical before and after the restart: ${beforeBody === afterBody}`);

    await owner.goto(`${BASE}/owner/surveys/${surveyId}/summary`);
    await owner.getByLabel("Response count: 1").waitFor();
    await shot(owner, "demo1-07-owner-summary.png");
    log("DEMO-1", `owner1 summary of survey ${surveyId}: response count 1, average 4.00 (AC-30)`);

    // ---------------- DEMO-2: business-rule rejections ----------------
    currentDemo = "DEMO-2";
    await student.goto(`${BASE}/surveys/${surveyId}`);
    await student.getByLabel("Rating 4 of 5").locator("xpath=..").click();
    await student.getByLabel("Yes", { exact: true }).check();
    await student.getByRole("button", { name: "Submit", exact: true }).click();
    await student.getByRole("alert").getByText("You have already submitted this survey").waitFor();
    await shot(student, "demo2-01-student-resubmit-already-responded.png");
    const detail = await (await call("DEMO-2", studentApi, "GET", `/api/surveys/${surveyId}`)).json();
    const ratingQ = detail.survey.questions.find(q => q.type === "RATING");
    const choiceQ = detail.survey.questions.find(q => q.type === "SINGLE_CHOICE");
    await call("DEMO-2", studentApi, "POST", `/api/surveys/${surveyId}/responses`, {
      answers: [{ questionId: ratingQ.id, ratingValue: 4 }, { questionId: choiceQ.id, optionId: choiceQ.options[0].id }]
    });
    const ownerApi = await request.newContext({ baseURL: API });
    await call("DEMO-2", ownerApi, "POST", "/api/auth/login", { email: "ann.lee@classpulse.test", password });
    const owned = await (await call("DEMO-2", ownerApi, "GET", "/api/owner/surveys")).json();
    const closed = owned.surveys.find(s => s.title === "Week 1 pulse");
    log("DEMO-2", `seed survey "Week 1 pulse" is id ${closed.id}, status ${closed.status}`);
    await student.goto(`${BASE}/surveys/${closed.id}`);
    await student.getByRole("alert").waitFor();
    await shot(student, "demo2-02-student-opens-closed-survey.png");
    await call("DEMO-2", studentApi, "POST", `/api/surveys/${closed.id}/responses`, { answers: [] });

    // ---------------- DEMO-3: login, logout, forbidden operations ----------------
    currentDemo = "DEMO-3";
    const guestCtx = await browser.newContext(view);
    const guest = await guestCtx.newPage();
    watch(guest, "student1 (login and logout)");
    await guest.goto(BASE + "/login");
    await guest.getByLabel("Email").fill("student1@classpulse.test");
    await guest.getByLabel("Password").fill("wrong-password-for-demo");
    await guest.getByRole("button", { name: "Sign in" }).click();
    await guest.getByRole("alert").waitFor();
    await shot(guest, "demo3-01-login-wrong-password.png");
    await signIn(guest, "student1@classpulse.test", password);
    await guest.waitForURL(/\/surveys$/);
    await shot(guest, "demo3-02-login-success-navbar.png", false);
    const cookie = (await guestCtx.cookies()).find(c => c.name === "cp_session");
    await guest.getByRole("button", { name: "Logout" }).click();
    await guest.waitForURL(/\/login$/);
    await shot(guest, "demo3-03-after-logout.png");
    const replay = await fetch(API + "/api/auth/me", { headers: { Cookie: `cp_session=${cookie.value}` } });
    log("DEMO-3", `GET /api/auth/me with the cookie of the session that was just logged out -> ${replay.status} ${JSON.stringify(await replay.json())} (AC-04)`);
    await call("DEMO-3", studentApi, "POST", "/api/owner/surveys", { courseId: 1, title: "should not be created", questions: [{ prompt: "x", type: "RATING" }] });
    const benCtx = await browser.newContext(view);
    const ben = await benCtx.newPage();
    watch(ben, "owner2");
    await signIn(ben, "ben.kim@classpulse.test", password);
    await ben.waitForURL(/\/owner$/);
    await ben.goto(`${BASE}/owner/surveys/${surveyId}/summary`);
    await ben.getByRole("alert").waitFor();
    await shot(ben, "demo3-04-other-owner-opens-summary.png");
    const benApi = await request.newContext({ baseURL: API });
    await call("DEMO-3", benApi, "POST", "/api/auth/login", { email: "ben.kim@classpulse.test", password });
    await call("DEMO-3", benApi, "GET", `/api/owner/surveys/${surveyId}/summary`);
    log("run", "done");
  } finally {
    fs.writeFileSync(path.join(OUT, "demo-api-log.txt"), logLines.join("\n") + "\n", "utf-8");
    await api.dispose();
    await browser.close();
    stop(server);
    stop(client);
  }
}

main().catch(err => { console.error(err); process.exitCode = 1; });
