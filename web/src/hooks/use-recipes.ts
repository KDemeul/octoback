import { useMutation, useQuery, useTransport } from '@connectrpc/connect-query';
import { useQuery as useTanstackQuery } from '@tanstack/react-query';
import { createClient } from '@connectrpc/connect';
import { useMemo, useCallback } from 'react';
import {
  createRecipe,
  createRecipeIngredient,
  deleteRecipe,
  deleteRecipeIngredient,
  getRecipe,
  getRecipeIngredient,
  importRecipeFromWeb,
  listRecipeIngredients,
  listRecipes,
  updateRecipe,
  updateRecipeIngredient,
} from '../gen/octoback/recipes/v1/service-Service_connectquery';
import { Service } from '../gen/octoback/recipes/v1/service_connect';
import { Recipe } from '../gen/octoback/recipes/v1/recipes_pb';

// ============ Query Hooks ============

/**
 * Fetch a single recipe by ID
 */
export function useRecipe(id: bigint) {
  return useQuery(getRecipe, { id });
}

/**
 * Fetch recipes with optional search and pagination
 */
export function useRecipes(query?: string, pageSize?: number, pageToken?: string) {
  return useQuery(listRecipes, {
    query: query ?? '',
    pageSize: pageSize ?? 20,
    pageToken: pageToken ?? '',
  });
}

/**
 * Fetch ALL recipes by paginating through all pages
 * Useful when you need access to the complete recipe list (e.g., meal plan selector)
 */
export function useAllRecipes() {
  const transport = useTransport();
  const client = useMemo(() => createClient(Service, transport), [transport]);

  const fetchAllRecipes = useCallback(async (): Promise<Recipe[]> => {
    const allRecipes: Recipe[] = [];
    let pageToken = '';
    const pageSize = 100; // Max page size

    do {
      const response = await client.listRecipes({
        query: '',
        pageSize,
        pageToken,
      });
      allRecipes.push(...response.recipes);
      pageToken = response.nextPageToken;
    } while (pageToken);

    return allRecipes;
  }, [client]);

  return useTanstackQuery({
    queryKey: ['octoback.recipes.v1.Service', 'ListRecipes', 'all'],
    queryFn: fetchAllRecipes,
  });
}

/**
 * Fetch a single recipe ingredient by ID
 */
export function useRecipeIngredient(id: bigint) {
  return useQuery(getRecipeIngredient, { id });
}

/**
 * Fetch all ingredients for a specific recipe
 */
export function useRecipeIngredients(recipeId: bigint) {
  return useQuery(listRecipeIngredients, { recipe: recipeId });
}

// ============ Mutation Hooks ============

/**
 * Create a new recipe
 */
export function useCreateRecipe() {
  return useMutation(createRecipe);
}

/**
 * Update an existing recipe
 */
export function useUpdateRecipe() {
  return useMutation(updateRecipe);
}

/**
 * Delete a recipe
 */
export function useDeleteRecipe() {
  return useMutation(deleteRecipe);
}

/**
 * Create a new recipe ingredient
 */
export function useCreateRecipeIngredient() {
  return useMutation(createRecipeIngredient);
}

/**
 * Update an existing recipe ingredient
 */
export function useUpdateRecipeIngredient() {
  return useMutation(updateRecipeIngredient);
}

/**
 * Delete a recipe ingredient
 */
export function useDeleteRecipeIngredient() {
  return useMutation(deleteRecipeIngredient);
}

/**
 * Import a recipe from a web URL using AI extraction
 */
export function useImportRecipeFromWeb() {
  return useMutation(importRecipeFromWeb);
}

