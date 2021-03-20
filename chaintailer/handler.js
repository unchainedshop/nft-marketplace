import { run } from "./index.js";

exports.handler = async (event, context) => {
  console.log("starting run...");
  await run();
};
