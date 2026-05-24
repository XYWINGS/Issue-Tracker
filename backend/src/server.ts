import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./db.js";

async function main() {
  await connectDb();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Issue Tracker API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
