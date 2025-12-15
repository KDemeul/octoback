-- Revert to old schema with unique tenant_id constraint

CREATE TABLE staple_list_old (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant (id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    version INTEGER NOT NULL DEFAULT 1,
    UNIQUE(tenant_id)
);

-- Copy data back (only keep one per tenant)
INSERT INTO staple_list_old (id, tenant_id, created_at, version)
SELECT id, tenant_id, created_at, version FROM staple_list
GROUP BY tenant_id;

DROP TABLE staple_list;

ALTER TABLE staple_list_old RENAME TO staple_list;

CREATE INDEX IF NOT EXISTS idx_staple_list_tenant_id ON staple_list (tenant_id);


