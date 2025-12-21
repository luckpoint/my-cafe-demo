CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,                    -- Stripe session ID
    user_id TEXT NOT NULL,                  -- Auth0 user ID (sub)
    user_email TEXT NOT NULL,
    stripe_payment_intent_id TEXT,
    total_amount INTEGER NOT NULL,          -- JPY
    currency TEXT DEFAULT 'jpy',
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
