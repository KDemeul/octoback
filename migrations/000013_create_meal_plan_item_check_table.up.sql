CREATE TABLE IF NOT EXISTS meal_plan_item_check (
    meal_plan_entry_id INTEGER NOT NULL REFERENCES meal_plan_entry (id) ON DELETE CASCADE,
    recipe_ingredient_id INTEGER NOT NULL REFERENCES recipe_ingredient (id) ON DELETE CASCADE,
    checked INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (meal_plan_entry_id, recipe_ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_item_check_entry_id ON meal_plan_item_check (meal_plan_entry_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_item_check_ingredient_id ON meal_plan_item_check (recipe_ingredient_id);

