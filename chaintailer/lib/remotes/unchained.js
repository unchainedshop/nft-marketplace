import fetch from "node-fetch";
import AbortController from "abort-controller";

const authenticate = async function authenticate({
  email,
  password,
  endpoint,
}) {
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({
    operationName: "login",
    variables: { email, password },
    query:
      "mutation login($email: String!, $password: String) {\n  loginWithPassword(email: $email, plainPassword: $password) {\n    token\n  }\n}\n",
  });
  const result = await fetch(`${endpoint}/graphql`, {
    method: "POST",
    headers,
    body,
  });
  const { data } = await result.json();
  return (
    (data && data.loginWithPassword && data.loginWithPassword.token) ||
    undefined
  );
};

const UnchainedAPI = function UnchainedAPI(options) {
  const endpoint = options?.unchainedEndpoint || process.env.UNCHAINED_ENDPOINT;
  console.log("Endpoint: " + endpoint);
  if (!endpoint) {
    throw new Error("Endpoint empty");
  }
  const tokenPromise = authenticate({
    email: options?.unchainedEmail || process.env.UNCHAINED_EMAIL,
    password: options?.unchainedPassword || process.env.UNCHAINED_PASSWORD,
    endpoint: endpoint,
  });

  return {
    async getToken() {
      return tokenPromise;
    },
    async fetch(path, params, options) {
      const token = await this.getToken();
      const url = new URL(`${endpoint}${path}`);
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key])
      );
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      try {
        const result = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options ? options.headers : {}),
          },
          signal: controller.signal,
        });
        return result.json();
      } finally {
        clearTimeout(timeout);
      }
    },
    async submitEvents(events) {
      if (!(events && events.length)) return;
      return this.fetch(
        "/bulk-import",
        {},
        {
          method: "POST",
          body: JSON.stringify({ events }),
        }
      );
    },
  };
};

export default UnchainedAPI;
