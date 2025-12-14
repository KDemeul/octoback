-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table
-- Step 1: Create new table with INTEGER quantity
CREATE TABLE recipe_ingredient_new (
    id INTEGER PRIMARY KEY,
    recipe_id INTEGER NOT NULL,
    name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit TEXT NOT NULL DEFAULT '' CHECK (length(unit) <= 50),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    version INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON DELETE CASCADE
);

-- Step 2: Copy data, converting TEXT quantity to INTEGER (default to 1 if conversion fails)
INSERT INTO recipe_ingredient_new (id, recipe_id, name, quantity, unit, created_at, version)
SELECT 
    id, 
    recipe_id, 
    name, 
    CASE 
        WHEN quantity = '' THEN 1
        WHEN CAST(quantity AS INTEGER) > 0 THEN CAST(quantity AS INTEGER)
        ELSE 1
    END,
    unit, 
    created_at, 
    version
FROM recipe_ingredient;

-- Step 3: Drop old table
DROP TABLE recipe_ingredient;

-- Step 4: Rename new table
ALTER TABLE recipe_ingredient_new RENAME TO recipe_ingredient;

-- Step 5: Recreate index if needed
CREATE INDEX IF NOT EXISTS idx_recipe_ingredient_recipe_id ON recipe_ingredient (recipe_id);

