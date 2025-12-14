import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppLayout } from '../components/AppLayout/AppLayout';
import {
  useMealPlan,
  useMealPlanEntries,
  useCreateMealPlan,
  useUpdateMealPlan,
  useSetMealPlanEntry,
  useClearMealPlanEntry,
} from '../hooks/use-mealplans';
import { useGroceryLists } from '../hooks/use-groceries';
import { useRecipes } from '../hooks/use-recipes';
import { useQueryClient } from '@tanstack/react-query';
import { MealPlanEntry } from '../gen/octoback/mealplans/v1/mealplans_pb';
import { Recipe } from '../gen/octoback/recipes/v1/recipes_pb';
import classes from './MealPlan.module.css';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChefHatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6.6a5.11 5.11 0 0 1 1.05-1.11 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6.6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

interface DayCardProps {
  dayIndex: number;
  entry: MealPlanEntry | undefined;
  recipes: Recipe[];
  onAddRecipe: (dayIndex: number) => void;
  onRemoveRecipe: (dayIndex: number) => void;
}

function DayCard({ dayIndex, entry, recipes, onAddRecipe, onRemoveRecipe }: DayCardProps) {
  const { colorScheme } = useMantineColorScheme();
  
  const recipe = entry ? recipes.find(r => r.id === entry.recipeId) : undefined;
  const totalTime = recipe ? recipe.prepTimeMinutes + recipe.cookTimeMinutes : 0;

  return (
    <Box className={classes.dayCard} data-theme={colorScheme}>
      <Box className={classes.dayHeader}>
        <Text className={classes.dayName}>{DAY_NAMES[dayIndex]}</Text>
      </Box>
      <Box className={classes.dayContent}>
        {!entry || !recipe ? (
          <UnstyledButton 
            className={classes.emptyDay}
            onClick={() => onAddRecipe(dayIndex)}
          >
            <Box className={classes.addRecipeIcon}>
              <PlusIcon />
            </Box>
            <Text size="sm">Ajouter</Text>
          </UnstyledButton>
        ) : (
          <Box className={classes.recipeInDay}>
            <Box className={classes.recipeCard}>
              <Group justify="space-between" align="flex-start" mb="xs">
                <ThemeIcon size={32} radius="xl" variant="light" color="sage" className={classes.recipeIcon}>
                  <ChefHatIcon size={18} />
                </ThemeIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  className={classes.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecipe(dayIndex);
                  }}
                >
                  <CloseIcon />
                </ActionIcon>
              </Group>
              <Text className={classes.recipeName} lineClamp={2}>
                {recipe.name}
              </Text>
              {totalTime > 0 && (
                <Group gap={4} mt="xs">
                  <ClockIcon />
                  <Text size="xs" c="dimmed">
                    {totalTime} min
                  </Text>
                </Group>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface RecipeSelectorModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (recipeId: bigint) => void;
  recipes: Recipe[];
  dayIndex: number | null;
}

function RecipeSelectorModal({ opened, onClose, onSelect, recipes, dayIndex }: RecipeSelectorModalProps) {
  const { colorScheme } = useMantineColorScheme();

  if (dayIndex === null) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Choisir une recette pour ${DAY_NAMES[dayIndex]}`}
      centered
      radius="lg"
      size="lg"
      classNames={{
        title: classes.modalTitle,
        content: classes.modalContent,
      }}
    >
      {recipes.length === 0 ? (
        <Box className={classes.noRecipes}>
          <ThemeIcon size={64} radius="xl" variant="light" color="sage" mb="md">
            <ChefHatIcon size={32} />
          </ThemeIcon>
          <Text fw={600} mb="xs">Aucune recette disponible</Text>
          <Text size="sm" c="dimmed">
            Créez d'abord des recettes pour pouvoir les ajouter à votre planning.
          </Text>
        </Box>
      ) : (
        <Box className={classes.recipeGrid}>
          {recipes.map((recipe) => {
            const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
            return (
              <UnstyledButton
                key={recipe.id.toString()}
                className={classes.recipeOption}
                data-theme={colorScheme}
                onClick={() => {
                  onSelect(recipe.id);
                  onClose();
                }}
              >
                <Text className={classes.recipeOptionName} lineClamp={2}>
                  {recipe.name}
                </Text>
                {totalTime > 0 && (
                  <Group gap={4} className={classes.recipeOptionMeta}>
                    <ClockIcon />
                    <Text size="xs">{totalTime} min</Text>
                  </Group>
                )}
              </UnstyledButton>
            );
          })}
        </Box>
      )}
    </Modal>
  );
}

export function MealPlanPage() {
  const { colorScheme } = useMantineColorScheme();
  const queryClient = useQueryClient();
  const [selectorOpened, { open: openSelector, close: closeSelector }] = useDisclosure(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: mealPlanData, isLoading: mealPlanLoading } = useMealPlan();
  const { data: entriesData, isLoading: entriesLoading } = useMealPlanEntries();
  const { data: recipesData, isLoading: recipesLoading } = useRecipes();
  const { data: groceryListsData, isLoading: groceryListsLoading } = useGroceryLists();

  const createMealPlanMutation = useCreateMealPlan();
  const updateMealPlanMutation = useUpdateMealPlan();
  const setEntryMutation = useSetMealPlanEntry();
  const clearEntryMutation = useClearMealPlanEntry();

  const mealPlan = mealPlanData?.mealPlan;
  const entries = entriesData?.entries ?? [];
  const recipes = recipesData?.recipes ?? [];
  const groceryLists = groceryListsData?.groceryLists ?? [];

  const isLoading = mealPlanLoading || entriesLoading || recipesLoading || groceryListsLoading;

  const getEntryForDay = (dayIndex: number): MealPlanEntry | undefined => {
    return entries.find(e => e.dayOfWeek === dayIndex);
  };

  const handleGroceryListChange = async (value: string | null) => {
    const groceryListId = value ? BigInt(value) : BigInt(0);
    
    if (!mealPlan) {
      // Create new meal plan with grocery list
      await createMealPlanMutation.mutateAsync({ groceryListId });
    } else {
      // Update existing meal plan
      await updateMealPlanMutation.mutateAsync({
        id: mealPlan.id,
        groceryListId,
        version: mealPlan.version,
      });
    }
    
    queryClient.invalidateQueries({ queryKey: ['octoback.mealplans.v1.Service', 'GetMealPlan'] });
  };

  const handleAddRecipe = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    openSelector();
  };

  const handleSelectRecipe = async (recipeId: bigint) => {
    if (selectedDay === null) return;
    
    await setEntryMutation.mutateAsync({
      recipeId,
      dayOfWeek: selectedDay,
    });
    
    queryClient.invalidateQueries({ queryKey: ['octoback.mealplans.v1.Service'] });
    setSelectedDay(null);
  };

  const handleRemoveRecipe = async (dayIndex: number) => {
    await clearEntryMutation.mutateAsync({ dayOfWeek: dayIndex });
    queryClient.invalidateQueries({ queryKey: ['octoback.mealplans.v1.Service'] });
  };

  const groceryListOptions = groceryLists.map(list => ({
    value: list.id.toString(),
    label: list.name,
  }));

  return (
    <AppLayout title="Planning de la semaine">
      {isLoading ? (
        <Box className={classes.loadingState}>
          <Loader color="sage" size="lg" />
        </Box>
      ) : (
        <Box className={classes.wrapper} data-theme={colorScheme}>
          {/* Grocery list selector */}
          <Paper className={classes.groceryListSelector} data-theme={colorScheme}>
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text fw={600} size="sm">Liste de courses liée</Text>
                <Text size="xs" c="dimmed">
                  Les ingrédients des recettes seront ajoutés à cette liste
                </Text>
              </Stack>
              <Select
                placeholder="Sélectionner une liste"
                data={groceryListOptions}
                value={mealPlan?.groceryListId ? mealPlan.groceryListId.toString() : null}
                onChange={handleGroceryListChange}
                clearable
                w={250}
                radius="md"
              />
            </Group>
          </Paper>

          {/* Week grid */}
          <Box className={classes.weekGrid}>
            {DAY_NAMES.map((_, index) => (
              <DayCard
                key={index}
                dayIndex={index}
                entry={getEntryForDay(index)}
                recipes={recipes}
                onAddRecipe={handleAddRecipe}
                onRemoveRecipe={handleRemoveRecipe}
              />
            ))}
          </Box>
        </Box>
      )}

      <RecipeSelectorModal
        opened={selectorOpened}
        onClose={closeSelector}
        onSelect={handleSelectRecipe}
        recipes={recipes}
        dayIndex={selectedDay}
      />
    </AppLayout>
  );
}

