-- name: GetStapleList :one
SELECT *
FROM staple_list
WHERE id = ? AND tenant_id = ?
LIMIT 1;

-- name: CreateStapleList :one
INSERT INTO staple_list (tenant_id, name, grocery_list_id)
VALUES (?, ?, ?)
RETURNING *;

-- name: UpdateStapleList :one
UPDATE staple_list
SET name = ?, grocery_list_id = ?, version = version + 1
WHERE id = ? AND tenant_id = ? AND version = ?
RETURNING *;

-- name: DeleteStapleList :one
DELETE FROM staple_list
WHERE id = ? AND tenant_id = ?
RETURNING *;

-- name: ListStapleLists :many
SELECT *
FROM staple_list
WHERE tenant_id = ?;

-- name: GetStapleListByGroceryList :one
SELECT *
FROM staple_list
WHERE grocery_list_id = ? AND tenant_id = ?
LIMIT 1;

-- name: GetStapleItem :one
SELECT si.*
FROM staple_item si
JOIN staple_list sl ON si.staple_list_id = sl.id
WHERE si.id = ? AND sl.tenant_id = ?
LIMIT 1;

-- name: CreateStapleItem :one
INSERT INTO staple_item (staple_list_id, name, quantity)
VALUES (?, ?, ?)
RETURNING *;

-- name: UpdateStapleItem :one
UPDATE staple_item
SET name = ?, quantity = ?, version = version + 1
WHERE staple_item.id = ? AND staple_item.version = ?
RETURNING *;

-- name: DeleteStapleItem :one
DELETE FROM staple_item
WHERE staple_item.id = ?
RETURNING *;

-- name: ListStapleItemsByList :many
SELECT si.*
FROM staple_item si
WHERE si.staple_list_id = ?;

-- name: UpsertStapleItemCheck :one
INSERT INTO staple_item_check (grocery_list_id, staple_item_id, checked)
VALUES (?, ?, ?)
ON CONFLICT (grocery_list_id, staple_item_id) 
DO UPDATE SET checked = excluded.checked
RETURNING *;

-- name: GetStapleItemCheck :one
SELECT *
FROM staple_item_check
WHERE grocery_list_id = ? AND staple_item_id = ?
LIMIT 1;

-- name: ListStapleItemChecksByGroceryList :many
SELECT *
FROM staple_item_check
WHERE grocery_list_id = ?;

-- name: ResetStapleItemChecks :exec
DELETE FROM staple_item_check
WHERE grocery_list_id = ?;

-- name: ListVirtualStapleItems :many
SELECT 
    si.id AS staple_item_id,
    si.name,
    si.quantity,
    COALESCE(sic.checked, 0) AS checked
FROM staple_list sl
JOIN staple_item si ON si.staple_list_id = sl.id
LEFT JOIN staple_item_check sic 
    ON sic.staple_item_id = si.id 
    AND sic.grocery_list_id = sl.grocery_list_id
WHERE sl.grocery_list_id = ? AND sl.tenant_id = ?;

