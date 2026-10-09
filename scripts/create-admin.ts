/**
 * Create an admin or reset a password from the server's terminal:
 *   node scripts/create-admin.mjs --email ja@example.com [--name "Meno"]          (asks for the password)
 *   node scripts/create-admin.mjs --email ja@example.com --reset                   (new password, signs out everywhere)
 */
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { createUser, setPassword } from "../lib/admin/users";

async function main() {
  const { values } = parseArgs({
    options: { email: { type: "string" }, name: { type: "string" }, reset: { type: "boolean" } },
  });
  if (!values.email) throw new Error("Použitie: --email ja@example.com [--name Meno] [--reset]");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const password = process.env.ADMIN_PASSWORD ?? (await rl.question("Heslo (aspoň 12 znakov): "));
  rl.close();

  if (values.reset) {
    await setPassword(values.email, password);
    console.log(`Heslo pre ${values.email} je zmenené.`);
  } else {
    await createUser({ email: values.email, name: values.name ?? values.email, password });
    console.log(`Používateľ ${values.email} je vytvorený.`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
