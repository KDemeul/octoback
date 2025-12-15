package v1

import (
	"context"
	"database/sql"
	"errors"

	"connectrpc.com/connect"
	models "github.com/kiliandbigblue/octoback/gen/proto/go/octoback/staples/v1"
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

// GetStapleList returns a staple list by ID.
func (s *Service) GetStapleList(ctx context.Context, r *connect.Request[models.GetStapleListRequest]) (*connect.Response[models.GetStapleListResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("GetStapleList")

	sl, err := s.querier.GetStapleList(ctx, store.GetStapleListParams{
		ID:       r.Msg.GetId(),
		TenantID: tenantIDFromContext(ctx),
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("staple list not found"))
		}
		panic(err)
	}

	return connect.NewResponse(&models.GetStapleListResponse{
		StapleList: translateStapleList(sl),
	}), nil
}

// CreateStapleList creates a new staple list.
func (s *Service) CreateStapleList(ctx context.Context, r *connect.Request[models.CreateStapleListRequest]) (*connect.Response[models.CreateStapleListResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("CreateStapleList")

	var groceryListID sql.NullInt64
	if r.Msg.GetGroceryListId() > 0 {
		groceryListID = sql.NullInt64{Int64: r.Msg.GetGroceryListId(), Valid: true}
	}

	sl, err := s.querier.CreateStapleList(ctx, store.CreateStapleListParams{
		TenantID:      tenantIDFromContext(ctx),
		Name:          r.Msg.GetName(),
		GroceryListID: groceryListID,
	})
	if err != nil {
		panic(err)
	}

	return connect.NewResponse(&models.CreateStapleListResponse{
		StapleList: translateStapleList(sl),
	}), nil
}

// UpdateStapleList updates a staple list.
func (s *Service) UpdateStapleList(ctx context.Context, r *connect.Request[models.UpdateStapleListRequest]) (*connect.Response[models.UpdateStapleListResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("UpdateStapleList")

	tenantID := tenantIDFromContext(ctx)

	var groceryListID sql.NullInt64
	if r.Msg.GetGroceryListId() > 0 {
		groceryListID = sql.NullInt64{Int64: r.Msg.GetGroceryListId(), Valid: true}
	}

	sl, err := s.querier.UpdateStapleList(ctx, store.UpdateStapleListParams{
		ID:            r.Msg.GetId(),
		TenantID:      tenantID,
		Name:          r.Msg.GetName(),
		GroceryListID: groceryListID,
		Version:       int64(r.Msg.GetVersion()),
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("staple list not found or version mismatch"))
		}
		panic(err)
	}

	return connect.NewResponse(&models.UpdateStapleListResponse{
		StapleList: translateStapleList(sl),
	}), nil
}

// DeleteStapleList deletes a staple list.
func (s *Service) DeleteStapleList(ctx context.Context, r *connect.Request[models.DeleteStapleListRequest]) (*connect.Response[models.DeleteStapleListResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("DeleteStapleList")

	_, err := s.querier.DeleteStapleList(ctx, store.DeleteStapleListParams{
		ID:       r.Msg.GetId(),
		TenantID: tenantIDFromContext(ctx),
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("staple list not found"))
		}
		panic(err)
	}

	return connect.NewResponse(&models.DeleteStapleListResponse{}), nil
}

// ListStapleLists returns all staple lists for the current tenant.
func (s *Service) ListStapleLists(ctx context.Context, _ *connect.Request[models.ListStapleListsRequest]) (*connect.Response[models.ListStapleListsResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("ListStapleLists")

	lists, err := s.querier.ListStapleLists(ctx, tenantIDFromContext(ctx))
	if err != nil {
		panic(err)
	}

	result := make([]*models.StapleList, len(lists))
	for i, list := range lists {
		result[i] = translateStapleList(list)
	}

	return connect.NewResponse(&models.ListStapleListsResponse{
		StapleLists: result,
	}), nil
}

// CreateStapleItem creates a new staple item.
func (s *Service) CreateStapleItem(ctx context.Context, r *connect.Request[models.CreateStapleItemRequest]) (*connect.Response[models.CreateStapleItemResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("CreateStapleItem")

	tenantID := tenantIDFromContext(ctx)

	// Verify the staple list belongs to this tenant
	_, err := s.querier.GetStapleList(ctx, store.GetStapleListParams{
		ID:       r.Msg.GetStapleListId(),
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("staple list not found"))
		}
		panic(err)
	}

	si, err := s.querier.CreateStapleItem(ctx, store.CreateStapleItemParams{
		StapleListID: r.Msg.GetStapleListId(),
		Name:         r.Msg.GetName(),
		Quantity:     int64(r.Msg.GetQuantity()),
	})
	if err != nil {
		panic(err)
	}

	return connect.NewResponse(&models.CreateStapleItemResponse{
		StapleItem: translateStapleItem(si),
	}), nil
}

// UpdateStapleItem updates an existing staple item.
func (s *Service) UpdateStapleItem(ctx context.Context, r *connect.Request[models.UpdateStapleItemRequest]) (*connect.Response[models.UpdateStapleItemResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("UpdateStapleItem")

	tenantID := tenantIDFromContext(ctx)

	// Verify the item belongs to this tenant
	_, err := s.querier.GetStapleItem(ctx, store.GetStapleItemParams{
		ID:       r.Msg.GetId(),
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("staple item not found"))
		}
		panic(err)
	}

	si, err := s.querier.UpdateStapleItem(ctx, store.UpdateStapleItemParams{
		ID:       r.Msg.GetId(),
		Name:     r.Msg.GetName(),
		Quantity: int64(r.Msg.GetQuantity()),
		Version:  int64(r.Msg.GetVersion()),
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeFailedPrecondition, errors.New("version mismatch"))
		}
		panic(err)
	}

	return connect.NewResponse(&models.UpdateStapleItemResponse{
		StapleItem: translateStapleItem(si),
	}), nil
}

// DeleteStapleItem deletes a staple item.
func (s *Service) DeleteStapleItem(ctx context.Context, r *connect.Request[models.DeleteStapleItemRequest]) (*connect.Response[models.DeleteStapleItemResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("DeleteStapleItem")

	tenantID := tenantIDFromContext(ctx)

	// Verify the item belongs to this tenant
	_, err := s.querier.GetStapleItem(ctx, store.GetStapleItemParams{
		ID:       r.Msg.GetId(),
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("staple item not found"))
		}
		panic(err)
	}

	_, err = s.querier.DeleteStapleItem(ctx, r.Msg.GetId())
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		panic(err)
	}

	return connect.NewResponse(&models.DeleteStapleItemResponse{}), nil
}

// ListStapleItems returns all staple items for a staple list.
func (s *Service) ListStapleItems(ctx context.Context, r *connect.Request[models.ListStapleItemsRequest]) (*connect.Response[models.ListStapleItemsResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("ListStapleItems")

	tenantID := tenantIDFromContext(ctx)

	// Verify the staple list belongs to this tenant
	_, err := s.querier.GetStapleList(ctx, store.GetStapleListParams{
		ID:       r.Msg.GetStapleListId(),
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("staple list not found"))
		}
		panic(err)
	}

	items, err := s.querier.ListStapleItemsByList(ctx, r.Msg.GetStapleListId())
	if err != nil {
		panic(err)
	}

	result := make([]*models.StapleItem, len(items))
	for i, item := range items {
		result[i] = translateStapleItem(item)
	}

	return connect.NewResponse(&models.ListStapleItemsResponse{
		StapleItems: result,
	}), nil
}

// SetStapleItemCheck toggles the checked state for a staple item in a grocery list.
func (s *Service) SetStapleItemCheck(ctx context.Context, r *connect.Request[models.SetStapleItemCheckRequest]) (*connect.Response[models.SetStapleItemCheckResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("SetStapleItemCheck")

	tenantID := tenantIDFromContext(ctx)

	// Verify the staple item belongs to this tenant
	_, err := s.querier.GetStapleItem(ctx, store.GetStapleItemParams{
		ID:       r.Msg.GetStapleItemId(),
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("staple item not found"))
		}
		panic(err)
	}

	// Verify the grocery list belongs to this tenant
	_, err = s.querier.GetGroceryList(ctx, store.GetGroceryListParams{
		ID:       r.Msg.GetGroceryListId(),
		TenantID: sql.NullInt64{Int64: tenantID, Valid: true},
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("grocery list not found"))
		}
		panic(err)
	}

	var checked int64
	if r.Msg.GetChecked() {
		checked = 1
	}

	_, err = s.querier.UpsertStapleItemCheck(ctx, store.UpsertStapleItemCheckParams{
		GroceryListID: r.Msg.GetGroceryListId(),
		StapleItemID:  r.Msg.GetStapleItemId(),
		Checked:       checked,
	})
	if err != nil {
		panic(err)
	}

	return connect.NewResponse(&models.SetStapleItemCheckResponse{}), nil
}

// ListVirtualStapleItems returns the virtual staple items for a grocery list.
func (s *Service) ListVirtualStapleItems(ctx context.Context, r *connect.Request[models.ListVirtualStapleItemsRequest]) (*connect.Response[models.ListVirtualStapleItemsResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("ListVirtualStapleItems")

	tenantID := tenantIDFromContext(ctx)

	items, err := s.querier.ListVirtualStapleItems(ctx, store.ListVirtualStapleItemsParams{
		GroceryListID: sql.NullInt64{Int64: r.Msg.GetGroceryListId(), Valid: true},
		TenantID:      tenantID,
	})
	if err != nil {
		panic(err)
	}

	result := make([]*models.VirtualStapleItem, len(items))
	for i, item := range items {
		result[i] = translateVirtualStapleItem(item)
	}

	return connect.NewResponse(&models.ListVirtualStapleItemsResponse{
		Items: result,
	}), nil
}

// ResetStapleItemChecks resets all staple item checks for a grocery list.
func (s *Service) ResetStapleItemChecks(ctx context.Context, r *connect.Request[models.ResetStapleItemChecksRequest]) (*connect.Response[models.ResetStapleItemChecksResponse], error) {
	log, _ := cloudzap.GetLogger(ctx)
	log.Info("ResetStapleItemChecks")

	tenantID := tenantIDFromContext(ctx)

	// Verify the grocery list belongs to this tenant
	_, err := s.querier.GetGroceryList(ctx, store.GetGroceryListParams{
		ID:       r.Msg.GetGroceryListId(),
		TenantID: sql.NullInt64{Int64: tenantID, Valid: true},
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, connect.NewError(connect.CodeNotFound, errors.New("grocery list not found"))
		}
		panic(err)
	}

	err = s.querier.ResetStapleItemChecks(ctx, r.Msg.GetGroceryListId())
	if err != nil {
		panic(err)
	}

	return connect.NewResponse(&models.ResetStapleItemChecksResponse{}), nil
}
