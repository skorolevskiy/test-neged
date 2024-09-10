import { sql } from '@vercel/postgres'

export async function seed() {
  const createTable = await sql`
    CREATE TABLE IF NOT EXISTS hats (
      id SERIAL PRIMARY KEY,
      fid VARCHAR(255) NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      wallet VARCHAR(255),
      points INTEGER,
      "dailySpins" INTEGER,
      "lastSpin" TIMESTAMP,
      "refFid" VARCHAR(255) NOT NULL,
      "refCount" INTEGER,
      "refSpins" INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `

  console.log(`Created "users" table`)

  return {
    createTable,
  }
}