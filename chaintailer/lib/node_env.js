import dotenv from "dotenv-extended";

dotenv.load({
  silent: process.env.NODE_ENV === "production",
  errorOnMissing: !process.env.SUPPRESS_ENV_ERRORS,
  errorOnRegex: !process.env.SUPPRESS_ENV_ERRORS,
  errorOnExtra: !process.env.SUPPRESS_ENV_ERRORS,
  includeProcessEnv: true,
});
