CREATE TABLE command_dedup (
  command_id UUID PRIMARY KEY,
  command_type TEXT NOT NULL,
  aggregate_id UUID,
  processed_at TIMESTAMP NOT NULL
);
