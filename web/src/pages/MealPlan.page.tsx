import { useState, useMemo, useEffect } from 'react';
import {
  ActionIcon,
  Box,
  Combobox,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
  useCombobox,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
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
import { useAllRecipes } from '../hooks/use-recipes';
import { useQueryClient } from '@tanstack/react-query';
import { MealPlanEntry } from '../gen/octoback/mealplans/v1/mealplans_pb';
import { Recipe } from '../gen/octoback/recipes/v1/recipes_pb';
import classes from './MealPlan.module.css';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    const hasTouch = window.matchMedia('(hover: none)').matches;
    setIsTouchDevice(hasTouch);
  }, []);
  
  return isTouchDevice;
}

// Get day indices starting from today
// JS Date: 0=Sunday, 1=Monday, ..., 6=Saturday
// App uses: 0=Monday, 1=Tuesday, ..., 6=Sunday
function getOrderedDayIndices(): number[] {
  const jsDay = new Date().getDay();
  // Convert JS day (0=Sunday) to app day (0=Monday)
  const todayIndex = (jsDay + 6) % 7;
  
  // Create array starting from today
  return Array.from({ length: 7 }, (_, i) => (todayIndex + i) % 7);
}

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

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

interface RecipeCardProps {
  entry: MealPlanEntry;
  recipe: Recipe;
  onRemove: (entryId: bigint) => void;
  onClick: (recipeId: bigint) => void;
}

function RecipeCard({ entry, recipe, onRemove, onClick }: RecipeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isTouchDevice = useIsTouchDevice();
  
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  const showRemoveButton = isHovered || isTouchDevice;

  return (
    <Box 
      className={classes.recipeCard}
      onClick={() => onClick(recipe.id)}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Group justify="space-between" align="flex-start" mb="xs">
        <ThemeIcon size={32} radius="xl" variant="light" color="sage" className={classes.recipeIcon}>
          <ChefHatIcon size={18} />
        </ThemeIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          className={classes.removeButton}
          style={{ opacity: showRemoveButton ? 1 : 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(entry.id);
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
  );
}

interface DayCardProps {
  dayIndex: number;
  entries: MealPlanEntry[];
  recipes: Recipe[];
  onAddRecipe: (dayIndex: number) => void;
  onRemoveRecipe: (entryId: bigint) => void;
  onRecipeClick: (recipeId: bigint) => void;
}

function DayCard({ dayIndex, entries, recipes, onAddRecipe, onRemoveRecipe, onRecipeClick }: DayCardProps) {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box className={classes.dayCard} data-theme={colorScheme}>
      <Box className={classes.dayHeader}>
        <Text className={classes.dayName}>{DAY_NAMES[dayIndex]}</Text>
      </Box>
      <Box className={classes.dayContent}>
        <Stack gap="xs" className={classes.recipeInDay}>
          {entries.map((entry) => {
            const recipe = recipes.find(r => r.id === entry.recipeId);
            if (!recipe) {
              return null;
            }
            return (
              <RecipeCard
                key={entry.id.toString()}
                entry={entry}
                recipe={recipe}
                onRemove={onRemoveRecipe}
                onClick={onRecipeClick}
              />
            );
          })}
          <UnstyledButton 
            className={classes.addRecipeButton}
            onClick={() => onAddRecipe(dayIndex)}
          >
            <Box className={classes.addRecipeIcon}>
              <PlusIcon />
            </Box>
            <Text size="sm">Ajouter</Text>
          </UnstyledButton>
        </Stack>
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
  const [search, setSearch] = useState('');
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const filteredRecipes = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) {
      return recipes.slice(0, 10); // Show first 10 when no search
    }
    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchLower)
    );
  }, [recipes, search]);

  const handleSelect = (recipeId: string) => {
    onSelect(BigInt(recipeId));
    setSearch('');
    combobox.closeDropdown();
    onClose();
  };

  // Reset search when modal opens/closes
  const handleClose = () => {
    setSearch('');
    combobox.closeDropdown();
    onClose();
  };

  if (dayIndex === null) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Choisir une recette pour ${DAY_NAMES[dayIndex]}`}
      centered
      radius="lg"
      size="md"
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
        <Combobox
          store={combobox}
          onOptionSubmit={handleSelect}
        >
          <Combobox.Target>
            <TextInput
              placeholder="Rechercher une recette..."
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                combobox.openDropdown();
                combobox.updateSelectedOptionIndex();
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
              leftSection={<SearchIcon />}
              radius="md"
              size="md"
              classNames={{ input: classes.searchInput }}
            />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              <ScrollArea.Autosize mah={300} type="scroll">
                {filteredRecipes.length === 0 ? (
                  <Combobox.Empty>
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      Aucune recette trouvée
                    </Text>
                  </Combobox.Empty>
                ) : (
                  filteredRecipes.map((recipe) => {
                    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
                    return (
                      <Combobox.Option
                        key={recipe.id.toString()}
                        value={recipe.id.toString()}
                        className={classes.recipeSearchOption}
                        data-theme={colorScheme}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="sm" fw={500} lineClamp={1}>
                            {recipe.name}
                          </Text>
                          {totalTime > 0 && (
                            <Group gap={4} wrap="nowrap">
                              <ClockIcon />
                              <Text size="xs" c="dimmed">
                                {totalTime} min
                              </Text>
                            </Group>
                          )}
                        </Group>
                      </Combobox.Option>
                    );
                  })
                )}
                {search === '' && recipes.length > 10 && (
                  <Text size="xs" c="dimmed" ta="center" py="xs">
                    Tapez pour rechercher parmi {recipes.length} recettes
                  </Text>
                )}
              </ScrollArea.Autosize>
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      )}
    </Modal>
  );
}

export function MealPlanPage() {
  const { colorScheme } = useMantineColorScheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectorOpened, { open: openSelector, close: closeSelector }] = useDisclosure(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: mealPlanData, isLoading: mealPlanLoading } = useMealPlan();
  const { data: entriesData, isLoading: entriesLoading } = useMealPlanEntries();
  const { data: allRecipes, isLoading: recipesLoading } = useAllRecipes();
  const { data: groceryListsData, isLoading: groceryListsLoading } = useGroceryLists();

  const createMealPlanMutation = useCreateMealPlan();
  const updateMealPlanMutation = useUpdateMealPlan();
  const setEntryMutation = useSetMealPlanEntry();
  const clearEntryMutation = useClearMealPlanEntry();

  const mealPlan = mealPlanData?.mealPlan;
  const entries = entriesData?.entries ?? [];
  const recipes = allRecipes ?? [];
  const groceryLists = groceryListsData?.groceryLists ?? [];

  const isLoading = mealPlanLoading || entriesLoading || recipesLoading || groceryListsLoading;

  const getEntriesForDay = (dayIndex: number): MealPlanEntry[] => {
    return entries.filter(e => e.dayOfWeek === dayIndex);
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
    if (selectedDay === null) {
      return;
    }
    
    await setEntryMutation.mutateAsync({
      recipeId,
      dayOfWeek: selectedDay,
    });
    
    queryClient.invalidateQueries({ queryKey: ['octoback.mealplans.v1.Service'] });
    setSelectedDay(null);
  };

  const handleRemoveRecipe = async (entryId: bigint) => {
    await clearEntryMutation.mutateAsync({ entryId });
    queryClient.invalidateQueries({ queryKey: ['octoback.mealplans.v1.Service'] });
  };

  const handleRecipeClick = (recipeId: bigint) => {
    navigate(`/recipes/${recipeId}`, { state: { from: '/mealplan' } });
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
            {getOrderedDayIndices().map((dayIndex) => (
              <DayCard
                key={dayIndex}
                dayIndex={dayIndex}
                entries={getEntriesForDay(dayIndex)}
                recipes={recipes}
                onAddRecipe={handleAddRecipe}
                onRemoveRecipe={handleRemoveRecipe}
                onRecipeClick={handleRecipeClick}
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

