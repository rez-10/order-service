export const requestContext = {
  fromHttp(req) {
    return { requestId: req.requestId };
  },

  fromMessage(headers = {}) {
    return { requestId: headers.requestId };
  },
};
/* const ctx = requestContext.fromHttp(req);

await createOrderCommand.execute(
  { orderId, items }, // ← command payload
  ctx                // ← execution context
);
Command Envelope:
CommandEnvelope {
  metadata: CommandMetadata
  command: CommandPayload
}
{
  "metadata": {
    "commandId": "8a8f2c8a-5e32-4e3a-bbfa-1c5e1d9b6b33",
    "requestId": "req-7fae9c",
    "source": "STAFF",
    "actorId": "user-123",
    "actorRole": "RECEPTION",
    "issuedAt": "2026-01-02T08:15:30.000Z",
    "service": "order-service",
    "version": 1
  },
  "command": {
    "type": "ConfirmOrder",
    "orderId": "order-456"
  }
}

Data model (minimal)
command_deduplication
---------------------
command_id    UUID  PRIMARY KEY
aggregate_id  UUID
command_type  TEXT
processed_at  TIMESTAMP

Analogy: 
HTTP → Envelope → Kafka
headers → metadata → kafka.headers
body    → command  → kafka.value

*/
