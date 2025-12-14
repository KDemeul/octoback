package v1

import (
	"time"

	models "github.com/kiliandbigblue/octoback/gen/proto/go/octoback/mealplans/v1"
	store "github.com/kiliandbigblue/octoback/gen/store/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// parseTime parses a SQLite datetime string to time.Time.
func parseTime(s string) time.Time {
	t, _ := time.Parse("2006-01-02 15:04:05", s)
	return t
}

// translateMealPlan translates a store.MealPlan to a models.MealPlan.
func translateMealPlan(mp store.MealPlan) *models.MealPlan {
	var groceryListID int64
	if mp.GroceryListID.Valid {
		groceryListID = mp.GroceryListID.Int64
	}
	return &models.MealPlan{
		Id:            mp.ID,
		GroceryListId: groceryListID,
		CreateTime:    timestamppb.New(parseTime(mp.CreatedAt)),
		Version:       int32(mp.Version),
	}
}

// translateMealPlanEntry translates a store.MealPlanEntry to a models.MealPlanEntry.
func translateMealPlanEntry(entry store.MealPlanEntry) *models.MealPlanEntry {
	return &models.MealPlanEntry{
		Id:         entry.ID,
		MealPlanId: entry.MealPlanID,
		RecipeId:   entry.RecipeID,
		DayOfWeek:  int32(entry.DayOfWeek),
		CreateTime: timestamppb.New(parseTime(entry.CreatedAt)),
		Version:    int32(entry.Version),
	}
}

// translateVirtualGroceryItem translates a store.ListVirtualGroceryItemsRow to a models.VirtualGroceryItem.
func translateVirtualGroceryItem(row store.ListVirtualGroceryItemsRow) *models.VirtualGroceryItem {
	return &models.VirtualGroceryItem{
		MealPlanEntryId:    row.MealPlanEntryID,
		RecipeIngredientId: row.RecipeIngredientID,
		Name:               row.Name,
		Quantity:           int32(row.Quantity),
		Unit:               row.Unit,
		RecipeName:         row.RecipeName,
		DayOfWeek:          int32(row.DayOfWeek),
		Checked:            row.Checked != 0,
	}
}
