import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, test } from "node:test";

// Run on a Docker host with Node 24. All database values are disposable fixtures.
const root = resolve(import.meta.dirname, "../..");
const scratch = mkdtempSync(join(tmpdir(), "classpulse-docker-"));
const project = "cp-lab5-" + process.pid;
const image = project + ":test";
const environment = {
  ...process.env,
  COMPOSE_PROJECT_NAME: project,
  CLASSPULSE_IMAGE: image,
  POSTGRES_USER: "fixture",
  POSTGRES_PASSWORD: "public-test-placeholder",
  POSTGRES_DB: "fixture",
  DATABASE_URL: "postgresql://fixture:public-test-placeholder@db:5432/fixture?schema=public",
  SEED_PASSWORD: "public-test-placeholder",
  PORT: "3100",
  APP_PORT: "0",
  SESSION_TTL_HOURS: "8"
};
let built = false;
let started = false;

function command(program, args, options = {}) {
  const result = spawnSync(program, args, {
    cwd: scratch, env: environment, encoding: "utf8", timeout: 600_000,
    maxBuffer: 8 * 1024 * 1024, ...options
  });
  assert.equal(result.error, undefined, program + " must be available on the test host");
  return result;
}

function docker(args, options) {
  const result = command("docker", args, options);
  // Output from database configuration is deliberately kept out of assertion errors.
  assert.equal(result.status, 0, "Docker operation failed: " + args[0]);
  return result.stdout.trim();
}

function compose(args, options) {
  return docker(["compose", "--env-file", ".env.example", ...args], options);
}

function prepare() {
  for (const name of ["Dockerfile", ".dockerignore", "docker-compose.yml"]) {
    assert.ok(existsSync(join(root, name)), name + " must exist");
  }
  const tracked = spawnSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" });
  assert.equal(tracked.status, 0);
  const paths = new Set([...tracked.stdout.split("\0").filter(Boolean),
    "Dockerfile", ".dockerignore", "docker-compose.yml"]);
  if (existsSync(join(root, ".env.example"))) paths.add(".env.example");
  for (const file of paths) {
    const destination = join(scratch, file);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(join(root, file), destination);
  }
}

function build() {
  if (built) return;
  prepare();
  docker(["build", "--tag", image, "."]);
  built = true;
}

function start() {
  build();
  assert.ok(existsSync(join(scratch, ".env.example")), "L5-2 root environment example must exist");
  if (started) return;
  compose(["up", "-d", "--no-build", "--wait", "--wait-timeout", "120"]);
  started = true;
}

function database(script) {
  return compose(["exec", "-T", "app", "node", "-e",
    "const {PrismaClient}=require('@prisma/client'); const db=new PrismaClient(); " +
    "(async()=>{" + script + "})().finally(()=>db.$disconnect()).catch(()=>process.exit(1));"]);
}

after(() => {
  if (existsSync(join(scratch, "docker-compose.yml"))) {
    command("docker", ["compose", "--env-file", ".env.example", "down", "--volumes", "--remove-orphans"]);
    command("docker", ["compose", "-p", project + "-failed", "--env-file", ".env.example",
      "-f", "docker-compose.yml", "-f", "failure.yml", "down", "--volumes", "--remove-orphans"]);
  }
  command("docker", ["image", "rm", image]);
  rmSync(scratch, { recursive: true, force: true });
});

test("L5-3-T1 builds a non-root image with the SPA, Prisma and seed tooling", () => {
  build();
  const uid = docker(["run", "--rm", "--entrypoint", "id", image, "-u"]);
  assert.notEqual(uid, "0");
  docker(["run", "--rm", "--entrypoint", "sh", image, "-ec",
    "test -f dist/index.js && test -f /app/client/dist/index.html && " +
    "test -f prisma/schema.prisma && test -d prisma/migrations && " +
    "test -x node_modules/.bin/prisma && test -x node_modules/.bin/tsx && " +
    "test -f src/lib/password.ts && node -e \"require('@prisma/client')\""]);

  // Exercise the actual Docker context filter, including nested secret files.
  for (const file of [".env", "server/.env.local", "client/node_modules/canary",
    "handoff/canary", "autopilot/canary", ".git/canary", "server/src/.env"]) {
    mkdirSync(dirname(join(scratch, file)), { recursive: true });
    writeFileSync(join(scratch, file), "public-build-context-canary");
  }
  const exported = join(scratch, "context-output");
  docker(["build", "--file", "-", "--output", "type=local,dest=" + exported, "."],
    { input: "FROM scratch\nCOPY . /context\n" });
  for (const file of [".env", "server/.env.local", "client/node_modules/canary",
    "handoff/canary", "autopilot/canary", ".git/canary", "server/src/.env"]) {
    assert.equal(existsSync(join(exported, "context", file)), false, file + " must be excluded");
  }
});

test("L5-3-T2 rejects missing settings and serves a runtime-selected port", () => {
  build();
  const missing = { ...environment, DATABASE_URL: "", SEED_PASSWORD: "" };
  writeFileSync(join(scratch, "empty.env"), "");
  assert.notEqual(command("docker", ["compose", "--env-file", "empty.env", "config", "--quiet"],
    { env: missing }).status, 0);
  start();
  const address = compose(["port", "app", "3100"]);
  assert.match(address, /^127\.0\.0\.1:\d+$/);
  compose(["exec", "-T", "app", "node", "-e",
    "fetch('http://127.0.0.1:3100/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]);
});

test("L5-3-T3 initializes seeded accounts and blocks serving on initialization failure", () => {
  start();
  assert.ok(Number(database("console.log(await db.user.count())")) >= 5);
  const app = compose(["ps", "--quiet", "app"]);
  const names = JSON.parse(docker(["inspect", app, "--format", "{{json .Config.Env}}"]));
  assert.equal(names.some(value => value.startsWith("SEED_PASSWORD=")), false);
  writeFileSync(join(scratch, "failure.yml"),
    "services:\n  migrate:\n    command: [sh, -c, 'exit 42']\n");
  const args = ["compose", "-p", project + "-failed", "--env-file", ".env.example",
    "-f", "docker-compose.yml", "-f", "failure.yml"];
  assert.notEqual(command("docker", [...args, "up", "-d", "--no-build", "--wait",
    "--wait-timeout", "60"]).status, 0);
  assert.equal(docker([...args, "ps", "--status", "running", "--services"]).split("\n").includes("app"), false);
});

test("L5-3-T4 serves the UI and retains a survey when the app is replaced", async () => {
  start();
  const address = compose(["port", "app", "3100"]);
  const page = await fetch("http://" + address + "/");
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<div id="root"/);
  const ready = await fetch("http://" + address + "/api/ready");
  assert.equal(ready.status, 200);
  assert.equal((await ready.json()).db, "connected");
  const id = Number(database("const c=await db.course.findFirstOrThrow(); " +
    "const s=await db.survey.create({data:{title:'Docker persistence fixture'," +
    "courseId:c.id,ownerId:c.ownerId,status:'DRAFT',mode:'IDENTIFIED'}}); console.log(s.id)"));
  assert.ok(Number.isSafeInteger(id), "The saved survey must have an integer ID");
  compose(["up", "-d", "--no-build", "--no-deps", "--force-recreate", "--wait",
    "--wait-timeout", "120", "app"]);
  assert.equal(database("console.log((await db.survey.findUniqueOrThrow({where:{id:" +
    JSON.stringify(id) + "}})).title)"), "Docker persistence fixture");
});
