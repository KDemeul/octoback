CREATE TABLE IF NOT EXISTS staple_item_check (
    grocery_list_id INTEGER NOT NULL REFERENCES grocery_list (id) ON DELETE CASCADE,
    staple_item_id INTEGER NOT NULL REFERENCES staple_item (id) ON DELETE CASCADE,
    checked INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (grocery_list_id, staple_item_id)
);

CREATE INDEX IF NOT EXISTS idx_staple_item_check_grocery_list_id ON staple_item_check (grocery_list_id);
CREATE INDEX IF NOT EXISTS idx_staple_item_check_staple_item_id ON staple_item_check (staple_item_id);


