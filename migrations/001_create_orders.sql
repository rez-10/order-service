CREATE TABLE orders (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);
