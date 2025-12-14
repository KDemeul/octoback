import { useMutation, useQuery } from '@connectrpc/connect-query';
import {
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  setMealPlanEntry,
  clearMealPlanEntry,
  listMealPlanEntries,
  setMealPlanItemCheck,
  listVirtualGroceryItems,
} from '../gen/octoback/mealplans/v1/service-Service_connectquery';

// Polling interval for real-time sync (1 seconds)
const SYNC_INTERVAL = 1000;

// ============ Query Hooks ============

/**
 * Fetch the current tenant's meal plan
 */
export function useMealPlan() {
  return useQuery(getMealPlan, {});
}

/**
 * Fetch all entries for the current meal plan
 */
export function useMealPlanEntries() {
  return useQuery(listMealPlanEntries, {});
}

/**
 * Fetch virtual grocery items for a specific grocery list
 */
export function useVirtualGroceryItems(groceryListId: bigint) {
  return useQuery(listVirtualGroceryItems, { groceryListId }, {
    refetchInterval: SYNC_INTERVAL,
  });
}

// ============ Mutation Hooks ============

/**
 * Create a new meal plan
 */
export function useCreateMealPlan() {
  return useMutation(createMealPlan);
}

/**
 * Update a meal plan (e.g., change linked grocery list)
 */
export function useUpdateMealPlan() {
  return useMutation(updateMealPlan);
}

/**
 * Set a recipe for a specific day
 */
export function useSetMealPlanEntry() {
  return useMutation(setMealPlanEntry);
}

/**
 * Clear a recipe from a specific day
 */
export function useClearMealPlanEntry() {
  return useMutation(clearMealPlanEntry);
}

/**
 * Toggle checked state for a virtual grocery item
 */
export function useSetMealPlanItemCheck() {
  return useMutation(setMealPlanItemCheck);
}

