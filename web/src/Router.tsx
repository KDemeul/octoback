import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { SettingsPage } from './pages/Settings.page';
import { GroceryListsPage } from './pages/GroceryLists.page';
import { GroceryListDetailPage } from './pages/GroceryListDetail.page';
import { RecipesPage } from './pages/Recipes.page';
import { RecipeDetailPage } from './pages/RecipeDetail.page';
import { MealPlanPage } from './pages/MealPlan.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/groceries',
    element: <GroceryListsPage />,
  },
  {
    path: '/groceries/:id',
    element: <GroceryListDetailPage />,
  },
  {
    path: '/recipes',
    element: <RecipesPage />,
  },
  {
    path: '/recipes/:id',
    element: <RecipeDetailPage />,
  },
  {
    path: '/mealplan',
    element: <MealPlanPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
