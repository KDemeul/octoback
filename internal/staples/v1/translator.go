package v1

import (
	"time"

	models "github.com/kiliandbigblue/octoback/gen/proto/go/octoback/staples/v1"
	store "github.com/kiliandbigblue/octoback/gen/store/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// parseTime parses a SQLite datetime string to time.Time.
func parseTime(s string) time.Time {
	t, _ := time.Parse("2006-01-02 15:04:05", s)
	return t
}

// translateStapleList translates a store.StapleList to a models.StapleList.
func translateStapleList(sl store.StapleList) *models.StapleList {
	var groceryListID int64
	if sl.GroceryListID.Valid {
		groceryListID = sl.GroceryListID.Int64
	}
	return &models.StapleList{
		Id:            sl.ID,
		Name:          sl.Name,
		GroceryListId: groceryListID,
		CreateTime:    timestamppb.New(parseTime(sl.CreatedAt)),
		Version:       int32(sl.Version),
	}
}

// translateStapleItem translates a store.StapleItem to a models.StapleItem.
func translateStapleItem(si store.StapleItem) *models.StapleItem {
	return &models.StapleItem{
		Id:           si.ID,
		StapleListId: si.StapleListID,
		Name:         si.Name,
		Quantity:     int32(si.Quantity),
		CreateTime:   timestamppb.New(parseTime(si.CreatedAt)),
		Version:      int32(si.Version),
	}
}

// translateVirtualStapleItem translates a store.ListVirtualStapleItemsRow to a models.VirtualStapleItem.
func translateVirtualStapleItem(row store.ListVirtualStapleItemsRow) *models.VirtualStapleItem {
	return &models.VirtualStapleItem{
		StapleItemId: row.StapleItemID,
		Name:         row.Name,
		Quantity:     int32(row.Quantity),
		Checked:      row.Checked != 0,
	}
}
