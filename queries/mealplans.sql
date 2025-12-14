-- name: GetMealPlan :one
SELECT *
FROM meal_plan
WHERE tenant_id = ?
LIMIT 1;

-- name: CreateMealPlan :one
INSERT INTO meal_plan (tenant_id, grocery_list_id)
VALUES (?, ?)
RETURNING *;

-- name: UpdateMealPlan :one
UPDATE meal_plan
SET grocery_list_id = ?, version = version + 1
WHERE id = ? AND tenant_id = ? AND version = ?
RETURNING *;

-- name: DeleteMealPlan :one
DELETE FROM meal_plan
WHERE id = ? AND tenant_id = ?
RETURNING *;

-- name: GetMealPlanByGroceryList :one
SELECT *
FROM meal_plan
WHERE grocery_list_id = ?
LIMIT 1;

-- name: GetMealPlanEntry :one
SELECT mpe.*
FROM meal_plan_entry mpe
JOIN meal_plan mp ON mpe.meal_plan_id = mp.id
WHERE mpe.id = ? AND mp.tenant_id = ?
LIMIT 1;

-- name: GetMealPlanEntryByDay :one
SELECT mpe.*
FROM meal_plan_entry mpe
JOIN meal_plan mp ON mpe.meal_plan_id = mp.id
WHERE mpe.meal_plan_id = ? AND mpe.day_of_week = ? AND mp.tenant_id = ?
LIMIT 1;

-- name: CreateMealPlanEntry :one
INSERT INTO meal_plan_entry (meal_plan_id, recipe_id, day_of_week)
VALUES (?, ?, ?)
RETURNING *;

-- name: DeleteMealPlanEntry :one
DELETE FROM meal_plan_entry
WHERE id = ?
RETURNING *;

-- name: DeleteMealPlanEntryByDay :one
DELETE FROM meal_plan_entry
WHERE meal_plan_id = ? AND day_of_week = ?
RETURNING *;

-- name: ListMealPlanEntries :many
SELECT mpe.*
FROM meal_plan_entry mpe
JOIN meal_plan mp ON mpe.meal_plan_id = mp.id
WHERE mpe.meal_plan_id = ? AND mp.tenant_id = ?;

-- name: GetMealPlanItemCheck :one
SELECT *
FROM meal_plan_item_check
WHERE meal_plan_entry_id = ? AND recipe_ingredient_id = ?
LIMIT 1;

-- name: UpsertMealPlanItemCheck :one
INSERT INTO meal_plan_item_check (meal_plan_entry_id, recipe_ingredient_id, checked)
VALUES (?, ?, ?)
ON CONFLICT (meal_plan_entry_id, recipe_ingredient_id) 
DO UPDATE SET checked = excluded.checked
RETURNING *;

-- name: ListMealPlanItemChecksByEntry :many
SELECT *
FROM meal_plan_item_check
WHERE meal_plan_entry_id = ?;

-- name: ListMealPlanItemChecksByMealPlan :many
SELECT mpic.*
FROM meal_plan_item_check mpic
JOIN meal_plan_entry mpe ON mpic.meal_plan_entry_id = mpe.id
WHERE mpe.meal_plan_id = ?;

-- name: ListVirtualGroceryItems :many
SELECT 
    mpe.id AS meal_plan_entry_id,
    ri.id AS recipe_ingredient_id,
    ri.name,
    ri.quantity,
    ri.unit,
    r.name AS recipe_name,
    mpe.day_of_week,
    COALESCE(mpic.checked, 0) AS checked
FROM meal_plan_entry mpe
JOIN meal_plan mp ON mpe.meal_plan_id = mp.id
JOIN recipe r ON mpe.recipe_id = r.id
JOIN recipe_ingredient ri ON ri.recipe_id = r.id
LEFT JOIN meal_plan_item_check mpic 
    ON mpic.meal_plan_entry_id = mpe.id 
    AND mpic.recipe_ingredient_id = ri.id
WHERE mp.grocery_list_id = ? AND mp.tenant_id = ?;

