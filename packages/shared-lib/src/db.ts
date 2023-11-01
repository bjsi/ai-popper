import { Database, OPEN_READWRITE, OPEN_CREATE } from "sqlite3";
import { ResourceChunk } from "./types";
import path from "path";

const vectorExtensionPath = path.join(__dirname, "/lib/vector0.dylib");
const vssExtensionPathVSS = path.join(__dirname, "/lib/vss0.dylib");
const DB_PATH = path.join(__dirname, "vectors.sqlite");
let db: Database;

// create or open the chat.sqlite database
function openDatabase(): Promise<Database> {
  return new Promise((resolve, reject) => {
    const db = new Database(DB_PATH, OPEN_READWRITE | OPEN_CREATE, (err) => {
      if (err) reject(err);
      resolve(db);
    });
  });
}

// load a SQLite extension
function loadExtension(db: Database, path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadExtension(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function setupDatabase(): Promise<Database> {
  if (db) {
    return db;
  }
  db = await openDatabase();
  try {
    await loadExtension(db, vectorExtensionPath);
    console.log("vector extension loaded");
  } catch (err) {
    console.error("Failed to load vector extension", err);
    throw err;
  }

  try {
    // load the SQLite vector extension
    // https://github.com/asg017/sqlite-vss
    await loadExtension(db, vssExtensionPathVSS);
    console.log("vss extension loaded successfully");
  } catch (err) {
    console.error("Failed to load vss extension", err);
    throw err;
  }

  await new Promise<void>((resolve, reject) => {
    db.get(
      "SELECT vss_version() AS version",
      (err, row: { version: number }) => {
        if (err) {
          console.error("Error running vss_version()", err);
          reject();
        } else {
          console.log("vss_version:", row.version); // 'v0.0.1'
          resolve();
        }
      }
    );
  });
  return new Promise((resolve, reject) => {
    // we are storing our vectors as JSON in the "vector" column
    db.run(
      `CREATE TABLE IF NOT EXISTS vectors (
            data TEXT,
            vector TEXT
      );`,
      (creationError) => {
        if (creationError) {
          console.error("Error creating vectors table", creationError);
          reject(creationError);
          return;
        }

        console.log("Successfully created vectors table");
        db.run(
          `CREATE VIRTUAL TABLE IF NOT EXISTS vss_vectors using vss0(vector(1536));`,
          (creationError) => {
            if (creationError) {
              console.error("Error creating vss_vectors table", creationError);
              reject(creationError);
              return;
            }

            console.log("Successfully created vss_vectors virtual table");
            resolve(db);
          }
        );
      }
    );
  });
}

type VectorData = {
  type: string;
  url: string;
  start: number;
  end: number;
  text: string;
  title: string;
  distance: number;
};

export async function searchVectors(
  queryVector: number[],
  similarityThreshold?: number,
  limit?: number
): Promise<VectorData[]> {
  await setupDatabase();
  const maxDistance = similarityThreshold ? 1 - similarityThreshold : undefined;
  return new Promise((resolve, reject) => {
    let query = `with matches as (
        select rowid,
        distance
        from vss_vectors where vss_search(vector, (?))`;
    if (maxDistance !== undefined) {
      query += ` and distance <= ${maxDistance}`;
    }
    query += `
        limit ${limit ? limit : 5}
      )
      select
      vectors.data,
      matches.distance
      from matches 
      left join vectors on vectors.rowid = matches.rowid`;
    db.all(
      query,
      [JSON.stringify(queryVector)],
      function (err: any, result: any) {
        if (err) {
          return reject(err);
        }
        return resolve(
          result.map((row: any) => ({
            distance: row.distance,
            data: JSON.parse(row.data),
          }))
        );
      }
    );
  });
}

export async function addVector(
  data: ResourceChunk,
  vector: number[]
): Promise<void> {
  await setupDatabase();
  return new Promise<void>(async (resolve, reject) => {
    // Insert into our vectors table
    db.run(
      "INSERT INTO vectors (data, vector) VALUES (?, ?)",
      [JSON.stringify(data), JSON.stringify(vector)],
      function (err) {
        if (err) {
          console.error("Error inserting into vectors", err);
          db.run("ROLLBACK");
          reject(err);
          return;
        }

        const lastRowId = this.lastID;
        // Insert into our vss_vectors virtual table, keeping the rowid values in sync
        db.run(
          "INSERT INTO vss_vectors(rowid, vector) VALUES (?, ?)",
          [lastRowId, JSON.stringify(vector)],

          (err) => {
            if (err) {
              console.error("Error inserting into vss_vectors", err);
              reject(err);
              return;
            }
            return resolve();
          }
        );
      }
    );
  });
}
