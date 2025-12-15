-- SQLite doesn't support ALTER TABLE ADD COLUMN with constraints well
-- So we recreate the table with the new schema

-- Create temporary table with new schema
CREATE TABLE staple_list_new (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant (id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
    grocery_list_id INTEGER REFERENCES grocery_list (id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    version INTEGER NOT NULL DEFAULT 1
);

-- Copy existing data (with default name)
INSERT INTO staple_list_new (id, tenant_id, name, created_at, version)
SELECT id, tenant_id, 'Ma liste de base', created_at, version FROM staple_list;

-- Drop old table
DROP TABLE staple_list;

-- Rename new table
ALTER TABLE staple_list_new RENAME TO staple_list;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_staple_list_tenant_id ON staple_list (tenant_id);
CREATE INDEX IF NOT EXISTS idx_staple_list_grocery_list_id ON staple_list (grocery_list_id);


