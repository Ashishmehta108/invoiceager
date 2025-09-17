import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

// Replace the database name with 'postgres' to connect to the default DB
const adminUrl = url.replace(/\/[^/]+$/, "/postgres");

async function main() {
  const dbName = (url.split("/").pop() ?? "").split("?")[0];
  if (!dbName) {
    console.error("Could not determine database name from DATABASE_URL");
    process.exit(1);
  }
  const sql = postgres(adminUrl, { max: 1 });
  try {
    await sql.unsafe(`CREATE DATABASE "${dbName}"`);
    console.log(`Database '${dbName}' created or already exists.`);
  } catch (err) {
    // If already exists, ignore
    if (err && typeof err === "object" && "code" in err && err.code === "42P04") {
      console.log(`Database '${dbName}' already exists.`);
    } else {
      console.error(err);
      process.exit(1);
    }
  } finally {
    await sql.end({ timeout: 1 });
  }
}

main();


