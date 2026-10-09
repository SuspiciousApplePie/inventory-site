import { Pool } from "pg";
import process from "node:process";

export default new Pool({
  connectionString: process.env.DATABASE_URL,
});
