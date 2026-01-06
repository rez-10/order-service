// import axios from "axios";
// import { logger } from "../../shared/index.js";

// export class SchemaRegistryClient {
//   constructor({ baseUrl, timeoutMs }) {
//     this.baseUrl = baseUrl;
//     this.http = axios.create({
//       baseURL: baseUrl,
//       timeout: timeoutMs
//     });

//     // in-memory cache: subject:version -> schema
//     this.cache = new Map();
//   }

//   /**
//    * Fetch schema by subject + version
//    * Cached aggressively (schemas are immutable)
//    */
//   async getSchema(subject, version = "latest") {
//     const cacheKey = `${subject}:${version}`;

//     if (this.cache.has(cacheKey)) {
//       return this.cache.get(cacheKey);
//     }

//     const response = await this.http.get(
//       `/subjects/${subject}/versions/${version}`
//     );

//     const schema = JSON.parse(response.data.schema);

//     this.cache.set(cacheKey, schema);

//     logger.info(
//       { subject, version },
//       "Schema loaded into registry cache"
//     );

//     return schema;
//   }

//   /**
//    * Validate payload against schema
//    * Throws on incompatibility
//    */
//   validate(schema, payload) {
//     // JSON Schema assumed here
//     // (Avro/Protobuf adapters can be added later)
//     const Ajv = require("ajv");
//     const ajv = new Ajv({ allErrors: true, strict: false });

//     const validate = ajv.compile(schema);
//     const valid = validate(payload);

//     if (!valid) {
//       const error = new Error("Schema validation failed");
//       error.details = validate.errors;
//       throw error;
//     }
//   }
// }

import fetch from "node-fetch";

export function createSchemaRegistryClient({
  baseUrl,
  timeoutMs,
  cacheTtlMs,
  allowBypass,
  logger,
}) {
  return {
    async validate(schemaId, payload) {
      if (allowBypass) return;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(`${baseUrl}/schemas/${schemaId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Schema registry validation failed");
        }
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
