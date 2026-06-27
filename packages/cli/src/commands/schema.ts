/**
 * `aetherself schema` — Export JSON schemas.
 */
import { getJsonSchemas } from "@aetherself/protocol";
import { writeFileSync } from "node:fs";

export function schemaCmd(options: { output?: string }): void {
  const schemas = getJsonSchemas();
  const json = JSON.stringify(schemas, null, 2);

  if (options.output) {
    writeFileSync(options.output, json);
    console.log(`✅ Schemas exported to ${options.output}`);
  } else {
    console.log(json);
  }
}
