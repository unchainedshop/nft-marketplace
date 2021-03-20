import hash from "object-hash";

export default async ({ db, lastMeaningfulEvents }) => {
  const Events = db.collection("unchained_events");

  // For every last update or insert history item emit DELETE if product does not exist in db

  const excludeAuthorization = function (key) {
    if (key === "Authorization" || key === "updated" || key === "created") {
      return true;
    }
    return false;
  };

  const lastPayloadHashes = Object.fromEntries(
    lastMeaningfulEvents
      .filter((event) => event.last.operation !== "REMOVE")
      .map((event) => {
        return [
          event._id.payloadId,
          hash(event.last.payload, { excludeKeys: excludeAuthorization }),
        ];
      })
  );

  const newEvents = await Events.find({ operation: "UPDATE" }).toArray();
  for (const newEvent of newEvents) {
    const hashedPayload = hash(newEvent.payload, {
      excludeKeys: excludeAuthorization,
    });
    if (lastPayloadHashes[newEvent.payload._id] === hashedPayload) {
      // Remove Event because not needed
      await Events.removeOne({ _id: newEvent._id });
    }
  }
};
