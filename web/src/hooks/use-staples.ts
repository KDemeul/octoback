import { useMutation, useQuery } from '@connectrpc/connect-query';
import {
  getStapleList,
  listStapleLists,
  createStapleList,
  updateStapleList,
  deleteStapleList,
  listStapleItems,
  createStapleItem,
  updateStapleItem,
  deleteStapleItem,
  listVirtualStapleItems,
  setStapleItemCheck,
  resetStapleItemChecks,
} from '../gen/octoback/staples/v1/service-Service_connectquery';

// Polling interval for real-time sync (1 seconds)
const SYNC_INTERVAL = 1000;

// ============ Query Hooks ============

/**
 * Fetch a staple list by ID
 */
export function useStapleList(id: bigint) {
  return useQuery(getStapleList, { id }, {
    refetchInterval: SYNC_INTERVAL,
  });
}

/**
 * Fetch all staple lists for the current tenant
 */
export function useStapleLists() {
  return useQuery(listStapleLists, {}, {
    refetchInterval: SYNC_INTERVAL,
  });
}

/**
 * Fetch all staple items for a specific staple list
 */
export function useStapleItems(stapleListId: bigint) {
  return useQuery(listStapleItems, { stapleListId }, {
    refetchInterval: SYNC_INTERVAL,
  });
}

/**
 * Fetch virtual staple items for a specific grocery list
 */
export function useVirtualStapleItems(groceryListId: bigint) {
  return useQuery(listVirtualStapleItems, { groceryListId }, {
    refetchInterval: SYNC_INTERVAL,
  });
}

// ============ Mutation Hooks ============

/**
 * Create a new staple list
 */
export function useCreateStapleList() {
  return useMutation(createStapleList);
}

/**
 * Update an existing staple list
 */
export function useUpdateStapleList() {
  return useMutation(updateStapleList);
}

/**
 * Delete a staple list
 */
export function useDeleteStapleList() {
  return useMutation(deleteStapleList);
}

/**
 * Create a new staple item
 */
export function useCreateStapleItem() {
  return useMutation(createStapleItem);
}

/**
 * Update an existing staple item
 */
export function useUpdateStapleItem() {
  return useMutation(updateStapleItem);
}

/**
 * Delete a staple item
 */
export function useDeleteStapleItem() {
  return useMutation(deleteStapleItem);
}

/**
 * Toggle checked state for a staple item in a grocery list
 */
export function useSetStapleItemCheck() {
  return useMutation(setStapleItemCheck);
}

/**
 * Reset all staple item checks for a grocery list (uncheck all)
 */
export function useResetStapleItemChecks() {
  return useMutation(resetStapleItemChecks);
}
