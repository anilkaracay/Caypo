/**
 * Canton MPP method definition.
 *
 * Defines the "canton" payment method using the mppx Method.from() pattern.
 * The method specifies the request and credential schemas that both
 * client (agent) and server (gateway) use.
 */

import { Method } from "mppx";
import { credentialPayloadSchema, requestSchema } from "./schemas.js";

export const cantonMethod = Method.from({
  intent: "charge",
  name: "canton",
  schema: {
    credential: {
      payload: credentialPayloadSchema,
    },
    request: requestSchema,
  },
});
