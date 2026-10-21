import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Load the TypeScript providers with isolated browser state for each scenario.
function createSession(respond, { authenticated = true } = {}) {
  const values = new Map(authenticated
    ? [["auth", '{"id":1}'], ["role", "ADMIN_ROLE"], ["fullName", "Admin"]]
    : []);
  const calls = [];
  class HttpError extends Error {
    constructor(message, status, body) {
      super(message);
      this.status = status;
      this.body = body;
    }
  }
  const context = vm.createContext({
    Headers, FormData, Error,
    document: { cookie: "XSRF-TOKEN=csrf-test" },
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key),
    },
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      return respond(url, options);
    },
  });
  const load = (path, dependencies) => {
    const source = readFileSync(new URL(path, import.meta.url), "utf8")
      .replace('import.meta.env.VITE_BACKEND_URL', '""');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
      fileName: path,
    });
    const exports = {};
    const execute = vm.runInContext(`(function(require, exports) { ${outputText}\n})`, context);
    execute(name => {
      assert.ok(name in dependencies, `Unexpected import: ${name}`);
      return dependencies[name];
    }, exports);
    return exports;
  };
  const http = load("../src/http-client.ts", { "react-admin": { HttpError } });
  const auth = load("../src/auth-provider.tsx", { "./http-client": http }).default;
  return { auth, http, calls, values };
}

const response = (status, body = null) => new Response(
  body === null ? null : JSON.stringify(body), { status },
);

test("expired session still completes logout so React Admin can redirect", async () => {
  const { auth, calls, values } = createSession(() => response(401));
  values.set("preferences", "keep");
  await auth.logout({});
  assert.deepEqual(calls.map(call => call.url), ["/api/logout"]);
  assert.deepEqual([...values], [["preferences", "keep"]]);
});

test("network failure during logout still clears authentication and resolves", async () => {
  const { auth, values } = createSession(() => { throw new TypeError("Offline"); });
  await auth.logout({});
  assert.equal(values.size, 0);
});

test("successful logout clears authentication", async () => {
  const { auth, values } = createSession(() => response(200));
  await auth.logout({});
  assert.equal(values.size, 0);
});

test("missing local authentication rejects without calling the API", async () => {
  const { auth, calls } = createSession(() => response(200), { authenticated: false });
  await assert.rejects(auth.checkAuth({}));
  assert.equal(calls.length, 0);
});

test("checkAuth validates the session with the server", async () => {
  const { auth, calls, values } = createSession(() => response(200, { id: 1 }));
  await auth.checkAuth({});
  assert.deepEqual(calls.map(call => call.url), ["/api/me"]);
  assert.ok(values.has("auth"));
});

test("expired access token refreshes and retries without logging out", async () => {
  let attempts = 0;
  const { auth, calls, values } = createSession(url => {
    if (url === "/api/refresh") return response(200);
    return response(++attempts === 1 ? 401 : 200);
  });
  await auth.checkAuth({});
  assert.deepEqual(calls.map(call => call.url), ["/api/me", "/api/refresh", "/api/me"]);
  assert.ok(values.has("auth"));
});

test("expired refresh token rejects authentication and allows logout to complete", async () => {
  const { auth, calls, values } = createSession(() => response(401));
  await assert.rejects(auth.checkAuth({}), { status: 401 });
  assert.equal(values.size, 0);
  await auth.logout({});
  assert.deepEqual(calls.map(call => call.url), ["/api/me", "/api/refresh", "/api/logout"]);
});

test("a retry that is still unauthorized clears the session", async () => {
  const { auth, values } = createSession(url => response(url === "/api/refresh" ? 200 : 401));
  await assert.rejects(auth.checkAuth({}), { status: 401 });
  assert.equal(values.size, 0);
});

test("resource authorization errors trigger logout only for 401", async () => {
  const { auth, values } = createSession(() => response(200));
  await auth.checkError({ status: 403 });
  assert.ok(values.has("auth"));
  await assert.rejects(auth.checkError({ status: 401 }));
  assert.equal(values.size, 0);
});
