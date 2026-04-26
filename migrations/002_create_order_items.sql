CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  item_id UUID NOT NULL,
  quantity INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL,

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
);
