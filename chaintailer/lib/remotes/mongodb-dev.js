let mongod;

export const start = async function start() {
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  mongod = new MongoMemoryServer();

  const uri = await mongod.getUri();
  const port = await mongod.getPort();
  const dbPath = await mongod.getDbPath();
  const dbName = await mongod.getDbName();

  console.log("MongoDB InMemory Server started at: " + uri);
  return { uri, port, dbPath, dbName };
};

export const stop = async function stop() {
  if (mongod) {
    await mongod.stop();
  }
};
