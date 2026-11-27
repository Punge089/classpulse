import json, os, secrets, socket, subprocess, tempfile
from pathlib import Path
root = Path.cwd()
pg = Path(r"C:/Program Files/PostgreSQL/18/bin")
npm = Path(r"C:/Program Files/nodejs/npm.cmd")
port = 5547
with socket.socket() as listener:
    listener.bind(("127.0.0.1", port))
with tempfile.TemporaryDirectory(prefix="classpulse-f14-") as directory:
    target = Path(directory)
    if target.resolve().parent != Path(tempfile.gettempdir()).resolve():
        raise SystemExit("unexpected temporary path")
    pgdata = target / "data"
    pwfile = target / "init-password.txt"
    password = secrets.token_hex(24)
    pwfile.write_text(password + "\n", encoding="ascii")
    env = dict(os.environ)
    env.pop("PGPASSWORD", None)
    env["DATABASE_URL"] = f"postgresql://postgres:{password}@127.0.0.1:{port}/classpulse_test?schema=public"
    env["BENCH_DB_PORT"] = str(port)
    env["NODE_ENV"] = "production"
    env["NO_COLOR"] = "1"
    def step(label, args, cwd=root, extra=None):
        with tempfile.TemporaryFile() as stdout, tempfile.TemporaryFile() as stderr:
            result = subprocess.run([str(x) for x in args], cwd=cwd, env=extra or env, stdout=stdout, stderr=stderr, timeout=105)
            stdout.seek(0)
            stderr.seek(0)
            if result.returncode:
                print(label + " failed", flush=True)
                if label == "benchmark":
                    print(stderr.read().decode("utf-8", "replace").strip(), flush=True)
                raise SystemExit(result.returncode)
            value = stdout.read().decode("utf-8", "replace").strip()
        print(label + " completed", flush=True)
        return value
    running = False
    try:
        step("initdb", [pg / "initdb.exe", "-D", pgdata, "-U", "postgres", "--auth-host=scram-sha-256", "--auth-local=trust", "--encoding=UTF8", "--pwfile=" + str(pwfile)])
        pwfile.unlink()
        step("start", [pg / "pg_ctl.exe", "-w", "-D", pgdata, "-l", target / "postgres.log", "-o", f"-h 127.0.0.1 -p {port}", "start"])
        running = True
        step("create dedicated DB", [pg / "createdb.exe", "-h", "127.0.0.1", "-p", str(port), "-U", "postgres", "classpulse_test"], extra=dict(env, PGPASSWORD=password))
        step("prisma generate", [npm, "exec", "--", "prisma", "generate"], root / "server")
        step("migrate disposable DB", [npm, "exec", "--", "prisma", "migrate", "deploy"], root / "server")
        step("server build", [npm, "run", "build"], root / "server")
        measured = json.loads(step("benchmark", ["node", "autopilot/benchmark-disposable-run.mjs"]))
        measured["sourceCommit"] = step("source", ["git", "rev-parse", "HEAD"])
        measured["postgres"] = step("PostgreSQL version", [pg / "postgres.exe", "--version"])
        measured["appMode"] = "production, loopback"
        (root / "autopilot/benchmark-disposable-result.json").write_text(json.dumps(measured, indent=2) + "\n", encoding="utf-8")
        print(f"Real HTTP sample p95 {measured['p95Ms']} ms; {len(measured['samplesMs'])} samples; access {measured['statuses']}; cleanup {measured['afterCleanup']}")
    finally:
        if running or (pgdata / "postmaster.pid").exists():
            step("stop disposable DB", [pg / "pg_ctl.exe", "-w", "-D", pgdata, "-m", "fast", "stop"])
