import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const connectionString = process.env.DATABASE_URL;
  console.log('Testing connection to:', connectionString?.split('@')[1]); // Log host part only for safety
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

test();
