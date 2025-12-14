CREATE TABLE IF NOT EXISTS meal_plan_entry (
    id INTEGER PRIMARY KEY,
    meal_plan_id INTEGER NOT NULL REFERENCES meal_plan (id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipe (id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    version INTEGER NOT NULL DEFAULT 1,
    UNIQUE(meal_plan_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_entry_meal_plan_id ON meal_plan_entry (meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_entry_recipe_id ON meal_plan_entry (recipe_id);

