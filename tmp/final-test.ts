import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

console.log("ENV CHECK:");
console.log("DIRECT_URL HOST:", process.env.DIRECT_URL?.split('@')[1]?.split('/')[0]);

async function test() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log("Bare PG connection: SUCCESS");
    const res = await client.query("SELECT count(*) FROM \"Product\"");
    console.log("Product count:", res.rows[0].count);
  } catch (err) {
    console.error("Bare PG connection: FAILED", err);
  } finally {
    await client.end();
  }
}

test();
