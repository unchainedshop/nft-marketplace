export const CompletionStatus = {
  INITIAL: "INITIAL",
  COMPLETE: "COMPLETE",
  FAILED_EXTRACT: "FAILED_EXTRACT",
  FAILED_TRANSFORM: "FAILED_TRANSFORM",
  FAILED_LOAD: "FAILED_LOAD",
};

export async function start({ reset, mongo }) {
  const db = mongo.db();
  const JournalCollection = db.collection("journal");
  const SubmittedEvents = db.collection("unchained_submitted_events");
  if (reset) {
    await SubmittedEvents.deleteMany({});
    await JournalCollection.deleteMany({});
  }
  const mostRecentJournalEntry = await JournalCollection.findOne(
    { status: CompletionStatus.COMPLETE },
    { sort: { started: -1 } }
  );
  const { insertedId } = await JournalCollection.insertOne({
    status: CompletionStatus.INITIAL,
    started: new Date(),
    differential: !!mostRecentJournalEntry,
    since:
      (mostRecentJournalEntry && mostRecentJournalEntry.started) || new Date(0),
  });
  const journalEntry = await JournalCollection.findOne({ _id: insertedId });
  console.log("New Journal entry", journalEntry);
  return journalEntry;
}

export async function reportFinalStatus(
  { status, eventIds },
  { mongo, journalEntry }
) {
  const db = mongo.db();
  const JournalCollection = db.collection("journal");
  await JournalCollection.updateOne(
    { _id: journalEntry._id },
    {
      $set: { status, eventIds, finished: new Date() },
    }
  );
  console.log(`Updated Journal entry with status ${status}`);
}
