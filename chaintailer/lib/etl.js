import util from "util";
import emitDeleteOperations from "./emitDeleteOperations.js";
import removeObsoleteUpdateEvents from "./removeObsoleteUpdateEvents.js";

const pipeIntoDatabase = async ({
  db,
  fetchFn,
  collectionName,
  ...options
}) => {
  const Collection = db.collection(collectionName);
  await Collection.deleteMany({});
  const entities = await fetchFn(options);
  console.log(`Insert ${entities.length} into ${collectionName}`);
  if (entities && entities.length) {
    if (options?.replace) {
      const BulkOp = Collection.initializeOrderedBulkOp();
      entities.forEach((entity) => {
        BulkOp.find({ _id: entity._id }).upsert().replaceOne(entity);
      });
      await BulkOp.execute();
    } else {
      await Collection.insertMany(entities);
    }
  }
};

export async function extract({ commServer, mongo, journalEntry }) {
  const db = mongo.db();
  const wrap = (fetchFn, collectionName, options) => {
    return pipeIntoDatabase({
      db,
      fetchFn,
      collectionName,
      ...options,
    });
  };

  return true;
}

export async function transform({ mongo, journalEntry, commServer }) {
  const db = mongo.db();
  const Events = db.collection("unchained_events");
  const SubmittedEvents = db.collection("unchained_submitted_events");

  await Events.deleteMany({});
  const lastMeaningfulEvents = await SubmittedEvents.aggregate([
    { $match: {} },
    { $sort: { emitted: 1 } },
    {
      $group: {
        _id: { payloadId: "$payload._id", entity: "$entity" },
        last: { $last: "$$ROOT" },
      },
    },
    { $match: { "last.operation": { $ne: "REMOVE" } } },
  ]).toArray();

  const transformContext = {
    db,
    referenceDate: new Date(journalEntry.since),
    commServer,
    lastMeaningfulEvents,
  };

  await emitDeleteOperations(transformContext);
  await removeObsoleteUpdateEvents(transformContext);
}

export async function load({ mongo, journalEntry, unchained }) {
  const db = mongo.db();
  const Events = db.collection("unchained_events");
  const SubmittedEvents = db.collection("unchained_submitted_events");

  const events = await Events.find({}, { _id: 0 }).toArray();
  if (events.length) {
    const emitted = new Date().getTime();
    await unchained.submitEvents(events);
    const { insertedIds } = await SubmittedEvents.insertMany(
      events.map((event) => {
        return {
          ...event,
          emitted,
        };
      })
    );
    console.log(util.inspect(events, false, null, true));
    return insertedIds;
  }
  return [];
}
