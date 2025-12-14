package v1

import (
	"context"
	"database/sql"
	"errors"

	"connectrpc.com/connect"
	models "github.com/kiliandbigblue/octoback/gen/proto/go/octoback/mealplans/v1"
	store "github.com/kiliandbigblue/octoback/gen/store/v1"
	"github.com/kiliandbigblue/octoback/internal/x/cloudzap"
	"github.com/kiliandbigblue/octoback/internal/x/tenant"
)

type Service struct {
	querier store.Querier
}

func NewService(querier store.Querier) *Service {
	return &Service{
		querier: querier,
	}
}

// tenantIDFromContext extracts tenant_id from context.
func tenantIDFromContext(ctx context.Context) int64 {
	return tenant.MustTenantIDFromContext(ctx)
}

// GetMealPlan returns the current tenant's meal plan.
func (s *Service) GetMealPlan(ctx context.Context, _ *connect.Request[models.GetMealPlanRequest]) (*connect.Response[models.GetMealPlanResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("GetMealPlan")

	mp, err := s.querier.GetMealPlan(ctx, tenantIDFromContext(ctx))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Return empty response if no meal plan exists
			return connect.NewResponse(&models.GetMealPlanResponse{}), nil
		}
		panic(err)
	}

	return connect.NewResponse(&models.GetMealPlanResponse{
		MealPlan: translateMealPlan(mp),
	}), nil
}

// CreateMealPlan creates a new meal plan for the current tenant.
func (s *Service) CreateMealPlan(ctx context.Context, r *connect.Request[models.CreateMealPlanRequest]) (*connect.Response[models.CreateMealPlanResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("CreateMealPlan")

	var groceryListID sql.NullInt64
	if r.Msg.GetGroceryListId() > 0 {
		groceryListID = sql.NullInt64{Int64: r.Msg.GetGroceryListId(), Valid: true}
	}

	mp, err := s.querier.CreateMealPlan(ctx, store.CreateMealPlanParams{
		TenantID:      tenantIDFromContext(ctx),
		GroceryListID: groceryListID,
	})
	if err != nil {
		panic(err)
	}

	return connect.NewResponse(&models.CreateMealPlanResponse{
		MealPlan: translateMealPlan(mp),
	}), nil
}

// UpdateMealPlan updates a meal plan (e.g., to change the linked grocery list).
func (s *Service) UpdateMealPlan(ctx context.Context, r *connect.Request[models.UpdateMealPlanRequest]) (*connect.Response[models.UpdateMealPlanResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("UpdateMealPlan")

	var groceryListID sql.NullInt64
	if r.Msg.GetGroceryListId() > 0 {
		groceryListID = sql.NullInt64{Int64: r.Msg.GetGroceryListId(), Valid: true}
	}

	mp, err := s.querier.UpdateMealPlan(ctx, store.UpdateMealPlanParams{
		ID:            r.Msg.GetId(),
		TenantID:      tenantIDFromContext(ctx),
		GroceryListID: groceryListID,
		Version:       int64(r.Msg.GetVersion()),
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("meal plan not found or version mismatch"))
		}
		panic(err)
	}

	return connect.NewResponse(&models.UpdateMealPlanResponse{
		MealPlan: translateMealPlan(mp),
	}), nil
}

// SetMealPlanEntry adds a recipe for a specific day (multiple recipes allowed per day).
func (s *Service) SetMealPlanEntry(ctx context.Context, r *connect.Request[models.SetMealPlanEntryRequest]) (*connect.Response[models.SetMealPlanEntryResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("SetMealPlanEntry")

	tenantID := tenantIDFromContext(ctx)

	// Get or create meal plan
	mp, err := s.querier.GetMealPlan(ctx, tenantID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Create a new meal plan if none exists
			mp, err = s.querier.CreateMealPlan(ctx, store.CreateMealPlanParams{
				TenantID: tenantID,
			})
			if err != nil {
				panic(err)
			}
		} else {
			panic(err)
		}
	}

	// Create new entry (no longer deletes existing entries for the same day)
	entry, err := s.querier.CreateMealPlanEntry(ctx, store.CreateMealPlanEntryParams{
		MealPlanID: mp.ID,
		RecipeID:   r.Msg.GetRecipeId(),
		DayOfWeek:  int64(r.Msg.GetDayOfWeek()),
	})
	if err != nil {
		panic(err)
	}

	return connect.NewResponse(&models.SetMealPlanEntryResponse{
		Entry: translateMealPlanEntry(entry),
	}), nil
}

// ClearMealPlanEntry removes a specific meal plan entry by ID.
func (s *Service) ClearMealPlanEntry(ctx context.Context, r *connect.Request[models.ClearMealPlanEntryRequest]) (*connect.Response[models.ClearMealPlanEntryResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("ClearMealPlanEntry")

	tenantID := tenantIDFromContext(ctx)

	// Verify the entry belongs to this tenant before deleting
	_, err := s.querier.GetMealPlanEntry(ctx, store.GetMealPlanEntryParams{
		ID:       r.Msg.GetEntryId(),
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("meal plan entry not found"))
		}
		panic(err)
	}

	// Delete the entry (this will cascade delete any checked states)
	_, err = s.querier.DeleteMealPlanEntry(ctx, r.Msg.GetEntryId())
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		panic(err)
	}

	return connect.NewResponse(&models.ClearMealPlanEntryResponse{}), nil
}

// ListMealPlanEntries returns all entries for the current meal plan.
func (s *Service) ListMealPlanEntries(ctx context.Context, _ *connect.Request[models.ListMealPlanEntriesRequest]) (*connect.Response[models.ListMealPlanEntriesResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("ListMealPlanEntries")

	tenantID := tenantIDFromContext(ctx)

	mp, err := s.querier.GetMealPlan(ctx, tenantID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return connect.NewResponse(&models.ListMealPlanEntriesResponse{}), nil
		}
		panic(err)
	}

	entries, err := s.querier.ListMealPlanEntries(ctx, store.ListMealPlanEntriesParams{
		MealPlanID: mp.ID,
		TenantID:   tenantID,
	})
	if err != nil {
		panic(err)
	}

	result := make([]*models.MealPlanEntry, len(entries))
	for i, entry := range entries {
		result[i] = translateMealPlanEntry(entry)
	}

	return connect.NewResponse(&models.ListMealPlanEntriesResponse{
		Entries: result,
	}), nil
}

// SetMealPlanItemCheck toggles the checked state for a virtual grocery item.
func (s *Service) SetMealPlanItemCheck(ctx context.Context, r *connect.Request[models.SetMealPlanItemCheckRequest]) (*connect.Response[models.SetMealPlanItemCheckResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("SetMealPlanItemCheck")

	tenantID := tenantIDFromContext(ctx)

	// Verify the entry belongs to this tenant
	_, err := s.querier.GetMealPlanEntry(ctx, store.GetMealPlanEntryParams{
		ID:       r.Msg.GetMealPlanEntryId(),
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("meal plan entry not found"))
		}
		panic(err)
	}

	var checked int64
	if r.Msg.GetChecked() {
		checked = 1
	}

	_, err = s.querier.UpsertMealPlanItemCheck(ctx, store.UpsertMealPlanItemCheckParams{
		MealPlanEntryID:    r.Msg.GetMealPlanEntryId(),
		RecipeIngredientID: r.Msg.GetRecipeIngredientId(),
		Checked:            checked,
	})
	if err != nil {
		panic(err)
	}

	return connect.NewResponse(&models.SetMealPlanItemCheckResponse{}), nil
}

// ListVirtualGroceryItems returns the virtual grocery items for a grocery list.
func (s *Service) ListVirtualGroceryItems(ctx context.Context, r *connect.Request[models.ListVirtualGroceryItemsRequest]) (*connect.Response[models.ListVirtualGroceryItemsResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("ListVirtualGroceryItems")

	tenantID := tenantIDFromContext(ctx)

	items, err := s.querier.ListVirtualGroceryItems(ctx, store.ListVirtualGroceryItemsParams{
		GroceryListID: sql.NullInt64{Int64: r.Msg.GetGroceryListId(), Valid: true},
		TenantID:      tenantID,
	})
	if err != nil {
		panic(err)
	}

	result := make([]*models.VirtualGroceryItem, len(items))
	for i, item := range items {
		result[i] = translateVirtualGroceryItem(item)
	}

	return connect.NewResponse(&models.ListVirtualGroceryItemsResponse{
		Items: result,
	}), nil
}
