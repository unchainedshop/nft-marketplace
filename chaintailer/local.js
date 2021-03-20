import { run } from "./index.js";
run()
  .then(() => {
    process.exit(0);
  })
  .catch((...args) => {
    console.error(...args);
    process.exit(1);
  });
