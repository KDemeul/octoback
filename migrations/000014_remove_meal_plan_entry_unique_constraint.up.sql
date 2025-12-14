-- SQLite doesn't support DROP CONSTRAINT, so we need to recreate the table
-- First, preserve the data
CREATE TABLE meal_plan_entry_backup AS SELECT * FROM meal_plan_entry;

-- Drop the old table (this will also drop the indexes)
DROP TABLE meal_plan_entry;

-- Recreate without the UNIQUE constraint on (meal_plan_id, day_of_week)
CREATE TABLE meal_plan_entry (
    id INTEGER PRIMARY KEY,
    meal_plan_id INTEGER NOT NULL REFERENCES meal_plan (id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipe (id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    version INTEGER NOT NULL DEFAULT 1
);

-- Restore the data
INSERT INTO meal_plan_entry (id, meal_plan_id, recipe_id, day_of_week, created_at, version)
SELECT id, meal_plan_id, recipe_id, day_of_week, created_at, version FROM meal_plan_entry_backup;

-- Drop the backup table
DROP TABLE meal_plan_entry_backup;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_meal_plan_entry_meal_plan_id ON meal_plan_entry (meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_entry_recipe_id ON meal_plan_entry (recipe_id);

