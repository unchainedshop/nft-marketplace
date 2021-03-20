export default async ({ db, lastMeaningfulEvents }) => {
  const Events = db.collection("unchained_events");

  // For every last update or insert history item emit DELETE if product does not exist in db

  const newEvents = await Events.find({}).toArray();
  const newEventIds = newEvents.map((event) => event.payload._id);

  for (const lastMeaningfulEvent of lastMeaningfulEvents) {
    const shallBeRemoved = !newEventIds.includes(
      lastMeaningfulEvent._id.payloadId
    );

    if (shallBeRemoved) {
      // Insert delete operation
      await Events.insertOne({
        entity: lastMeaningfulEvent.last.entity,
        operation: "REMOVE",
        payload: {
          _id: lastMeaningfulEvent._id.payloadId,
        },
      });
    }
  }
};
