import { resolve } from "node:path";
import { config } from "dotenv";

export function configureTestDatabase(): void {
  config({ path: resolve(process.cwd(), ".env.test"), override: true });
  const url = process.env.DATABASE_URL;
  if (!url || new URL(url).pathname !== "/classpulse_test") {
    throw new Error("Tests require DATABASE_URL pointing to the separate classpulse_test database");
  }
}

configureTestDatabase();
