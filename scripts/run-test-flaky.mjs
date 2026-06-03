import { spawnSync } from "node:child_process";

const specPath = process.argv[2];

if (!specPath) {
  process.stderr.write(
    "test:flaky requires a spec path (does not run the full suite).\n" +
      "Usage: npm run test:flaky -- <path-to-spec>\n" +
      "Example: npm run test:flaky -- tests/ui/integration/login.spec.ts\n",
  );
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["playwright", "test", specPath, "--repeat-each=10", "--retries=0"],
  { stdio: "inherit", shell: true },
);

process.exit(result.status ?? 1);
