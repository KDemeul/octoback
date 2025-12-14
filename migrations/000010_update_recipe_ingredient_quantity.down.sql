-- Revert quantity back to TEXT
CREATE TABLE recipe_ingredient_new (
    id INTEGER PRIMARY KEY,
    recipe_id INTEGER NOT NULL,
    name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
    quantity TEXT NOT NULL DEFAULT '' CHECK (length(quantity) <= 50),
    unit TEXT NOT NULL DEFAULT '' CHECK (length(unit) <= 50),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    version INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON DELETE CASCADE
);

INSERT INTO recipe_ingredient_new (id, recipe_id, name, quantity, unit, created_at, version)
SELECT 
    id, 
    recipe_id, 
    name, 
    CAST(quantity AS TEXT),
    unit, 
    created_at, 
    version
FROM recipe_ingredient;

DROP TABLE recipe_ingredient;

ALTER TABLE recipe_ingredient_new RENAME TO recipe_ingredient;

CREATE INDEX IF NOT EXISTS idx_recipe_ingredient_recipe_id ON recipe_ingredient (recipe_id);

