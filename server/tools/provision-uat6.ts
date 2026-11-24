import type { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { inspectUsers, provisionUsers, type Snapshot } from "../src/lib/uat6Provisioner";
function secret(label: string): Promise<string> {
    if (!process.stdin.isTTY || !process.stdout.isTTY)
        return Promise.reject(new Error("INTERACTIVE_INPUT_REQUIRED"));
    return new Promise((resolve, reject) => {
        let value = "";
        process.stdout.write(label);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        const done = () => { process.stdin.off("data", onData); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n"); };
        const onData = (chunk: string) => {
            for (const c of chunk) {
                if (c === "\u0003") {
                    done();
                    reject(new Error("INPUT_CANCELLED"));
                    return;
                }
                if (c === "\r" || c === "\n") {
                    done();
                    resolve(value);
                    return;
                }
                if (c === "\u007f" || c === "\b") {
                    value = value.slice(0, -1);
                    continue;
                }
                if (c >= " " && c !== "\u001b")
                    value += c;
            }
        };
        process.stdin.on("data", onData);
    });
}
async function main() {
    const [mode = "inspect", baselineFile, ...extra] = process.argv.slice(2);
    if (!["inspect", "apply"].includes(mode) || extra.length || (mode === "inspect" && baselineFile) || (mode === "apply" && !baselineFile))
        throw new Error("USAGE_REJECTED");
    // No implicit .env load or cloud setup. Human supplies DATABASE_URL privately in the process environment.
    const url = process.env.DATABASE_URL;
    if (!url)
        throw new Error("PRIVATE_CONNECTION_REQUIRED");
    const parsed = new URL(url);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol) || parsed.pathname !== "/classpulse")
        throw new Error("TARGET_MISMATCH");
    const { PrismaClient } = await import("@prisma/client");
    if (mode === "inspect") {
        const db = new PrismaClient({ datasources: { db: { url } }, log: [] });
        try {
            console.log(JSON.stringify(await inspectUsers(db)));
        }
        finally {
            await db.$disconnect();
        }
        return;
    }
    if (!process.stdin.isTTY || !process.stdout.isTTY)
        throw new Error("INTERACTIVE_INPUT_REQUIRED");
    const approved = JSON.parse(await readFile(baselineFile!, "utf8")) as Snapshot | {
        baseline: Snapshot;
    };
    const baseline = "baseline" in approved ? approved.baseline : approved;
    const target = "cpe-334-en-034/classpulse-pg/classpulse";
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    let confirmed = "";
    try {
        confirmed = await rl.question("After verifying the exact project/instance/database in Console, type " + target + " to confirm: ");
    }
    finally {
        rl.close();
    }
    if (confirmed !== target)
        throw new Error("HUMAN_GATE_REQUIRED");
    const passwords: [
        string,
        string
    ] = [await secret("New extra account password (hidden): "), await secret("New inactive account password (hidden): ")];
    const db = new PrismaClient({ datasources: { db: { url } }, log: [] });
    try {
        console.log(JSON.stringify(await provisionUsers(db, { approved: baseline, confirmed: true, targetConfirmation: confirmed, passwords })));
    }
    finally {
        passwords[0] = "";
        passwords[1] = "";
        await db.$disconnect();
    }
}
main().catch(() => { console.error("PROVISIONER_STOPPED: no readiness/success is implied; confirm target and preflight before retry. Secret and database error details are suppressed."); process.exitCode = 1; });
