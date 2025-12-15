CREATE TABLE IF NOT EXISTS staple_item (
    id INTEGER PRIMARY KEY,
    staple_list_id INTEGER NOT NULL REFERENCES staple_list (id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_staple_item_staple_list_id ON staple_item (staple_list_id);


