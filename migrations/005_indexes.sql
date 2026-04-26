-- Orders
CREATE INDEX idx_orders_session_id
ON orders(session_id);

-- Order items
CREATE INDEX idx_order_items_order_id
ON order_items(order_id);

-- Outbox polling
CREATE INDEX idx_outbox_unpublished
ON outbox(published, id);
