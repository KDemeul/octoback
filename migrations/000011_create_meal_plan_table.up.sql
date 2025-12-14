CREATE TABLE IF NOT EXISTS meal_plan (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant (id) ON DELETE CASCADE,
    grocery_list_id INTEGER REFERENCES grocery_list (id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    version INTEGER NOT NULL DEFAULT 1,
    UNIQUE(tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_tenant_id ON meal_plan (tenant_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_grocery_list_id ON meal_plan (grocery_list_id);

