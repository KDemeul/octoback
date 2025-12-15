CREATE TABLE IF NOT EXISTS staple_list (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant (id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    version INTEGER NOT NULL DEFAULT 1,
    UNIQUE(tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_staple_list_tenant_id ON staple_list (tenant_id);


