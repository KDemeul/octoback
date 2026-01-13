import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Menu,
  Paper,
  Stack,
  Text,
  TextInput,
  Transition,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout/AppLayout';
import {
  useGroceryList,
  useGroceryItems,
  useCreateGroceryItem,
  useUpdateGroceryItem,
  useDeleteGroceryItem,
} from '../hooks/use-groceries';
import { useVirtualGroceryItems, useSetMealPlanItemCheck } from '../hooks/use-mealplans';
import { useVirtualStapleItems, useSetStapleItemCheck, useResetStapleItemChecks } from '../hooks/use-staples';
import { GroceryItem } from '../gen/octoback/groceries/v1/groceries_pb';
import { VirtualGroceryItem } from '../gen/octoback/mealplans/v1/mealplans_pb';
import { VirtualStapleItem } from '../gen/octoback/staples/v1/staples_pb';
import { useQueryClient } from '@tanstack/react-query';
import { FieldMask } from '@bufbuild/protobuf';
import classes from './GroceryListDetail.module.css';

type GroupingMode = 'alphabetical' | 'category' | 'recipe';

const GROUPING_STORAGE_KEY = 'grocery-list-grouping-mode';
const SHOW_CHECKED_STORAGE_KEY_PREFIX = 'grocery-list-show-checked:';

function getStoredGroupingMode(): GroupingMode {
  try {
    const stored = localStorage.getItem(GROUPING_STORAGE_KEY);
    if (stored === 'alphabetical' || stored === 'category' || stored === 'recipe') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'alphabetical';
}

function setStoredGroupingMode(mode: GroupingMode) {
  try {
    localStorage.setItem(GROUPING_STORAGE_KEY, mode);
  } catch {
    // localStorage not available
  }
}

function getStoredShowChecked(key: string): boolean {
  try {
    const stored = localStorage.getItem(key);
    if (stored === 'true') {
      return true;
    }
    if (stored === 'false') {
      return false;
    }
  } catch {
    // localStorage not available
  }
  return false;
}

function setStoredShowChecked(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? 'true' : 'false');
  } catch {
    // localStorage not available
  }
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: checked ? 1 : 0, transition: 'opacity 0.2s ease' }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CartEmptyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function MoreVerticalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function CheckSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EmptyState() {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box className={classes.emptyState} data-theme={colorScheme}>
      <Box className={classes.emptyIcon}>
        <CartEmptyIcon />
      </Box>
      <Text className={classes.emptyTitle}>Liste vide</Text>
      <Text c="dimmed" size="md" maw={320} ta="center" lh={1.6}>
        Ajoutez des articles à votre liste pour ne rien oublier lors de vos courses.
      </Text>
    </Box>
  );
}

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggle: (item: GroceryItem) => void;
  onDelete: (id: bigint) => void;
  delay: number;
}

// Hook to detect touch devices
function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    const hasTouch = window.matchMedia('(hover: none)').matches;
    setIsTouchDevice(hasTouch);
  }, []);
  
  return isTouchDevice;
}

function GroceryItemRow({ item, onToggle, onDelete, delay }: GroceryItemRowProps) {
  const { colorScheme } = useMantineColorScheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isTouchDevice = useIsTouchDevice();

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
    onToggle(item);
  };

  const showDelete = isHovered || isTouchDevice;

  return (
    <Paper
      className={classes.itemRow}
      data-theme={colorScheme}
      data-checked={item.checked || undefined}
      data-animating={isAnimating || undefined}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Group className={classes.itemRowGroup} wrap="nowrap">
        <UnstyledButton
          className={classes.checkbox}
          data-checked={item.checked || undefined}
          onClick={handleToggle}
        >
          <CheckIcon checked={item.checked} />
        </UnstyledButton>

        <Box className={classes.itemContent} onClick={handleToggle} style={{ cursor: 'pointer', flex: 1 }}>
          <Text className={classes.itemName} data-checked={item.checked || undefined}>
            {item.name}
          </Text>
          {item.quantity > 1 && (
            <Text className={classes.itemQuantity} data-checked={item.checked || undefined}>
              × {item.quantity}
            </Text>
          )}
        </Box>

        <Transition mounted={showDelete} transition="fade" duration={150}>
          {(styles) => (
            <ActionIcon
              variant="subtle"
              color="red"
              size="md"
              style={{ ...styles, opacity: isTouchDevice && !isHovered ? 0.6 : styles.opacity }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className={classes.deleteButton}
            >
              <TrashIcon />
            </ActionIcon>
          )}
        </Transition>
      </Group>

      {item.checked && <Box className={classes.strikethrough} />}
    </Paper>
  );
}

interface VirtualItemRowProps {
  item: VirtualGroceryItem;
  onToggle: (item: VirtualGroceryItem) => void;
  delay: number;
  showRecipeBadge?: boolean;
}

function VirtualItemRow({ item, onToggle, delay, showRecipeBadge = true }: VirtualItemRowProps) {
  const { colorScheme } = useMantineColorScheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
    onToggle(item);
  };

  const quantityDisplay = item.quantity > 0 
    ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`
    : item.unit;

  return (
    <Paper
      className={classes.itemRow}
      data-theme={colorScheme}
      data-checked={item.checked || undefined}
      data-animating={isAnimating || undefined}
      data-virtual="true"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Group className={classes.itemRowGroup} wrap="nowrap">
        <UnstyledButton
          className={classes.checkbox}
          data-checked={item.checked || undefined}
          onClick={handleToggle}
        >
          <CheckIcon checked={item.checked} />
        </UnstyledButton>

        <Box className={classes.itemContent} onClick={handleToggle} style={{ cursor: 'pointer', flex: 1 }}>
          <Group gap="xs" wrap="nowrap">
            <Text className={classes.itemName} data-checked={item.checked || undefined}>
              {item.name}
            </Text>
            {showRecipeBadge && (
              <Badge size="xs" variant="light" color="sage" className={classes.recipeBadge}>
                {item.recipeName}
              </Badge>
            )}
          </Group>
          {quantityDisplay && (
            <Text className={classes.itemQuantity} data-checked={item.checked || undefined}>
              {quantityDisplay}
            </Text>
          )}
        </Box>
      </Group>

      {item.checked && <Box className={classes.strikethrough} />}
    </Paper>
  );
}

interface StapleItemRowProps {
  item: VirtualStapleItem;
  onToggle: (item: VirtualStapleItem) => void;
  delay: number;
}

function StapleItemRow({ item, onToggle, delay }: StapleItemRowProps) {
  const { colorScheme } = useMantineColorScheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
    onToggle(item);
  };

  return (
    <Paper
      className={classes.itemRow}
      data-theme={colorScheme}
      data-checked={item.checked || undefined}
      data-animating={isAnimating || undefined}
      data-staple="true"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Group className={classes.itemRowGroup} wrap="nowrap">
        <UnstyledButton
          className={classes.checkbox}
          data-checked={item.checked || undefined}
          onClick={handleToggle}
        >
          <CheckIcon checked={item.checked} />
        </UnstyledButton>

        <Box className={classes.itemContent} onClick={handleToggle} style={{ cursor: 'pointer', flex: 1 }}>
          <Group gap="xs" wrap="nowrap">
            <Text className={classes.itemName} data-checked={item.checked || undefined}>
              {item.name}
            </Text>
            <Badge size="xs" variant="light" color="amber" className={classes.stapleBadge}>
              Base
            </Badge>
          </Group>
          {item.quantity > 1 && (
            <Text className={classes.itemQuantity} data-checked={item.checked || undefined}>
              × {item.quantity}
            </Text>
          )}
        </Box>
      </Group>

      {item.checked && <Box className={classes.strikethrough} />}
    </Paper>
  );
}

// Unified item type for sorting/rendering
type UnifiedItem = 
  | { type: 'grocery'; item: GroceryItem }
  | { type: 'recipe'; item: VirtualGroceryItem }
  | { type: 'staple'; item: VirtualStapleItem };

function getItemName(unified: UnifiedItem): string {
  return unified.item.name;
}

function isItemChecked(unified: UnifiedItem): boolean {
  return unified.item.checked;
}

function getRecipeName(unified: UnifiedItem): string {
  if (unified.type === 'recipe') {
    return unified.item.recipeName;
  }
  return '';
}

export function GroceryListDetailPage() {
  const { colorScheme } = useMantineColorScheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [groupingMode, setGroupingMode] = useState<GroupingMode>(getStoredGroupingMode);
  const showCheckedStorageKey = useMemo(
    () => `${SHOW_CHECKED_STORAGE_KEY_PREFIX}${id ?? '0'}`,
    [id]
  );
  const [showChecked, setShowChecked] = useState(false);

  useEffect(() => {
    setShowChecked(getStoredShowChecked(showCheckedStorageKey));
  }, [showCheckedStorageKey]);

  const handleGroupingChange = (value: string) => {
    const mode = value as GroupingMode;
    setGroupingMode(mode);
    setStoredGroupingMode(mode);
  };

  const handleToggleShowChecked = () => {
    setShowChecked((prev) => {
      const next = !prev;
      setStoredShowChecked(showCheckedStorageKey, next);
      return next;
    });
  };

  const listId = BigInt(id ?? '0');

  const { data: listData, isLoading: listLoading } = useGroceryList(listId);
  const { data: itemsData, isLoading: itemsLoading } = useGroceryItems(listId);
  const { data: virtualItemsData, isLoading: virtualItemsLoading } = useVirtualGroceryItems(listId);
  const { data: stapleItemsData, isLoading: stapleItemsLoading } = useVirtualStapleItems(listId);
  const createMutation = useCreateGroceryItem();
  const updateMutation = useUpdateGroceryItem();
  const deleteMutation = useDeleteGroceryItem();
  const setMealPlanItemCheckMutation = useSetMealPlanItemCheck();
  const setStapleItemCheckMutation = useSetStapleItemCheck();
  const resetStapleItemChecksMutation = useResetStapleItemChecks();

  const list = listData?.groceryList;
  const items = itemsData?.groceryItems ?? [];
  const virtualItems = virtualItemsData?.items ?? [];
  const stapleItems = stapleItemsData?.items ?? [];

  // Create unified items list
  const unifiedItems = useMemo((): UnifiedItem[] => {
    const all: UnifiedItem[] = [
      ...items.map((item): UnifiedItem => ({ type: 'grocery', item })),
      ...virtualItems.map((item): UnifiedItem => ({ type: 'recipe', item })),
      ...stapleItems.map((item): UnifiedItem => ({ type: 'staple', item })),
    ];
    return all;
  }, [items, virtualItems, stapleItems]);

  // Group and sort items based on grouping mode
  const groupedItems = useMemo(() => {
    const sortAlpha = (a: UnifiedItem, b: UnifiedItem) => 
      getItemName(a).localeCompare(getItemName(b), 'fr');
    
    const sortByCheckedThenAlpha = (a: UnifiedItem, b: UnifiedItem) => {
      if (isItemChecked(a) !== isItemChecked(b)) {
        return isItemChecked(a) ? 1 : -1;
      }
      return sortAlpha(a, b);
    };

    if (groupingMode === 'alphabetical') {
      // All items sorted alphabetically, unchecked first
      const sorted = [...unifiedItems].sort(sortByCheckedThenAlpha);
      return [{ label: null, items: sorted }];
    }

    if (groupingMode === 'category') {
      // Group by type: grocery, recipe, staple
      const groceries = unifiedItems.filter(u => u.type === 'grocery').sort(sortByCheckedThenAlpha);
      const recipes = unifiedItems.filter(u => u.type === 'recipe').sort(sortByCheckedThenAlpha);
      const staples = unifiedItems.filter(u => u.type === 'staple').sort(sortByCheckedThenAlpha);
      
      const groups = [];
      if (groceries.length > 0) {
        groups.push({ label: 'Mes articles', items: groceries, color: 'gray' });
      }
      if (recipes.length > 0) {
        groups.push({ label: 'Recettes', items: recipes, color: 'sage' });
      }
      if (staples.length > 0) {
        groups.push({ label: 'Produits de base', items: staples, color: 'amber' });
      }
      return groups;
    }

    if (groupingMode === 'recipe') {
      // Group by recipe name, then groceries, then staples
      const recipeGroups = new Map<string, UnifiedItem[]>();
      const groceries: UnifiedItem[] = [];
      const staples: UnifiedItem[] = [];

      for (const u of unifiedItems) {
        if (u.type === 'recipe') {
          const name = getRecipeName(u);
          if (!recipeGroups.has(name)) {
            recipeGroups.set(name, []);
          }
          recipeGroups.get(name)!.push(u);
        } else if (u.type === 'grocery') {
          groceries.push(u);
        } else {
          staples.push(u);
        }
      }

      const groups = [];
      
      // Add recipe groups sorted by recipe name
      const sortedRecipeNames = [...recipeGroups.keys()].sort((a, b) => a.localeCompare(b, 'fr'));
      for (const name of sortedRecipeNames) {
        const items = recipeGroups.get(name)!.sort(sortByCheckedThenAlpha);
        groups.push({ label: name, items, color: 'sage' });
      }
      
      if (groceries.length > 0) {
        groups.push({ label: 'Mes articles', items: groceries.sort(sortByCheckedThenAlpha), color: 'gray' });
      }
      if (staples.length > 0) {
        groups.push({ label: 'Produits de base', items: staples.sort(sortByCheckedThenAlpha), color: 'amber' });
      }
      
      return groups;
    }

    return [{ label: null, items: unifiedItems }];
  }, [unifiedItems, groupingMode]);

  const totalCount = items.length + virtualItems.length + stapleItems.length;
  const checkedCount = items.filter((i) => i.checked).length + virtualItems.filter((i) => i.checked).length + stapleItems.filter((i) => i.checked).length;
  const hasStapleItems = stapleItems.length > 0;

  useEffect(() => {
    if (!listLoading && !list) {
      navigate('/groceries');
    }
  }, [listLoading, list, navigate]);

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      return;
    }

    const tempId = BigInt(Date.now());
    const newItem = {
      id: tempId,
      groceryList: listId,
      name: newItemName.trim(),
      quantity: newItemQuantity,
      checked: false,
    };

    // Optimistic update: add the item immediately
    queryClient.setQueryData(
      ['octoback.groceries.v1.Service', 'ListGroceryItems', { groceryList: `${listId.toString()}n` }],
      (old: { groceryItems: GroceryItem[] } | undefined) => ({
        groceryItems: [...(old?.groceryItems ?? []), newItem],
      })
    );

    setNewItemName('');
    setNewItemQuantity(1);
    inputRef.current?.focus();

    try {
      await createMutation.mutateAsync({
        groceryList: listId,
        name: newItem.name,
        quantity: newItem.quantity,
        checked: false,
      });
    } finally {
      // Refetch to get the real ID from server
      queryClient.invalidateQueries({
        queryKey: ['octoback.groceries.v1.Service', 'ListGroceryItems'],
      });
    }
  };

  const handleToggleItem = async (item: GroceryItem) => {
    const newChecked = !item.checked;

    // Optimistic update: toggle immediately
    queryClient.setQueryData(
      ['octoback.groceries.v1.Service', 'ListGroceryItems', { groceryList: `${listId.toString()}n` }],
      (old: { groceryItems: GroceryItem[] } | undefined) => ({
        groceryItems: (old?.groceryItems ?? []).map((i) =>
          i.id === item.id ? { ...i, checked: newChecked } : i
        ),
      })
    );

    try {
      await updateMutation.mutateAsync({
        groceryItem: {
          ...item,
          checked: newChecked,
        },
        updateMask: new FieldMask({ paths: ['checked'] }),
      });
    } catch {
      // Revert on error
      queryClient.invalidateQueries({
        queryKey: ['octoback.groceries.v1.Service', 'ListGroceryItems'],
      });
    }
  };

  const handleToggleVirtualItem = async (item: VirtualGroceryItem) => {
    const newChecked = !item.checked;

    // Optimistic update: toggle immediately
    queryClient.setQueryData(
      ['octoback.mealplans.v1.Service', 'ListVirtualGroceryItems', { groceryListId: `${listId.toString()}n` }],
      (old: { items: VirtualGroceryItem[] } | undefined) => ({
        items: (old?.items ?? []).map((i) =>
          i.mealPlanEntryId === item.mealPlanEntryId && i.recipeIngredientId === item.recipeIngredientId
            ? { ...i, checked: newChecked }
            : i
        ),
      })
    );

    try {
      await setMealPlanItemCheckMutation.mutateAsync({
        mealPlanEntryId: item.mealPlanEntryId,
        recipeIngredientId: item.recipeIngredientId,
        checked: newChecked,
      });
    } catch {
      // Revert on error
      queryClient.invalidateQueries({
        queryKey: ['octoback.mealplans.v1.Service', 'ListVirtualGroceryItems'],
      });
    }
  };

  const handleToggleStapleItem = async (item: VirtualStapleItem) => {
    const newChecked = !item.checked;

    // Optimistic update: toggle immediately
    queryClient.setQueryData(
      ['octoback.staples.v1.Service', 'ListVirtualStapleItems', { groceryListId: `${listId.toString()}n` }],
      (old: { items: VirtualStapleItem[] } | undefined) => ({
        items: (old?.items ?? []).map((i) =>
          i.stapleItemId === item.stapleItemId
            ? { ...i, checked: newChecked }
            : i
        ),
      })
    );

    try {
      await setStapleItemCheckMutation.mutateAsync({
        groceryListId: listId,
        stapleItemId: item.stapleItemId,
        checked: newChecked,
      });
    } catch {
      // Revert on error
      queryClient.invalidateQueries({
        queryKey: ['octoback.staples.v1.Service', 'ListVirtualStapleItems'],
      });
    }
  };

  const handleResetStapleItems = async () => {
    // Optimistic update: uncheck all staple items immediately
    queryClient.setQueryData(
      ['octoback.staples.v1.Service', 'ListVirtualStapleItems', { groceryListId: `${listId.toString()}n` }],
      (old: { items: VirtualStapleItem[] } | undefined) => ({
        items: (old?.items ?? []).map((i) => ({ ...i, checked: false })),
      })
    );

    try {
      await resetStapleItemChecksMutation.mutateAsync({
        groceryListId: listId,
      });
    } catch {
      // Revert on error
      queryClient.invalidateQueries({
        queryKey: ['octoback.staples.v1.Service', 'ListVirtualStapleItems'],
      });
    }
  };

  const handleDeleteItem = async (itemId: bigint) => {
    // Optimistic update: remove immediately
    queryClient.setQueryData(
      ['octoback.groceries.v1.Service', 'ListGroceryItems', { groceryList: `${listId.toString()}n` }],
      (old: { groceryItems: GroceryItem[] } | undefined) => ({
        groceryItems: (old?.groceryItems ?? []).filter((i) => i.id !== itemId),
      })
    );

    try {
      await deleteMutation.mutateAsync({ id: itemId });
    } catch {
      // Revert on error
      queryClient.invalidateQueries({
        queryKey: ['octoback.groceries.v1.Service', 'ListGroceryItems'],
      });
    }
  };

  const isLoading = listLoading || itemsLoading || virtualItemsLoading || stapleItemsLoading;

  const uncheckedCount = useMemo(() => unifiedItems.filter((i) => !isItemChecked(i)).length, [unifiedItems]);

  const progressSeparator = totalCount > 0 ? (
    <Box className={classes.progressSeparator} data-theme={colorScheme}>
      <Box className={classes.progressMetaRow}>
        <Text className={classes.progressSeparatorText}>
          {checkedCount} / {totalCount} articles
        </Text>
      </Box>
      <Box className={classes.progressSeparatorBar}>
        <Box
          className={classes.progressSeparatorFill}
          style={{ width: `${(checkedCount / totalCount) * 100}%` }}
        />
      </Box>
    </Box>
  ) : undefined;

  const headerAction = (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size="lg">
          <MoreVerticalIcon />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {checkedCount > 0 && (
          <>
            <Menu.Item onClick={handleToggleShowChecked}>
              {showChecked ? 'Masquer les articles cochés' : 'Afficher les articles cochés'}
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        <Menu.Label>Trier par</Menu.Label>
        <Menu.Item
          onClick={() => handleGroupingChange('alphabetical')}
          rightSection={groupingMode === 'alphabetical' ? <CheckSmallIcon /> : null}
        >
          A-Z
        </Menu.Item>
        <Menu.Item
          onClick={() => handleGroupingChange('category')}
          rightSection={groupingMode === 'category' ? <CheckSmallIcon /> : null}
        >
          Catégorie
        </Menu.Item>
        <Menu.Item
          onClick={() => handleGroupingChange('recipe')}
          rightSection={groupingMode === 'recipe' ? <CheckSmallIcon /> : null}
        >
          Recette
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <AppLayout title={list?.name ?? 'Chargement...'} backTo="/groceries" headerSeparator={progressSeparator} action={headerAction}>
      <Box className={classes.wrapper} data-theme={colorScheme}>
        {/* Add item form */}
        <Paper className={classes.addForm} data-theme={colorScheme}>
          <Group className={classes.addFormGroup} wrap="nowrap">
            <TextInput
              ref={inputRef}
              placeholder="Ajouter un article..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                }
              }}
              className={classes.addInput}
              size="md"
              radius="md"
              styles={{
                input: {
                  border: 'none',
                  background: 'transparent',
                },
              }}
            />
            <TextInput
              type="number"
              min={1}
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.currentTarget.value, 10) || 1))}
              className={classes.quantityInput}
              size="md"
              radius="md"
              w={70}
              styles={{
                input: {
                  textAlign: 'center',
                },
              }}
            />
            <Button
              color="coral"
              radius="md"
              onClick={handleAddItem}
              loading={createMutation.isPending}
              className={classes.addButton}
            >
              <PlusIcon />
            </Button>
          </Group>
        </Paper>

        {/* Items list */}
        {isLoading ? (
          <Box className={classes.loadingState}>
            <Loader color="coral" size="lg" />
          </Box>
        ) : totalCount === 0 ? (
          <EmptyState />
        ) : !showChecked && checkedCount > 0 && uncheckedCount === 0 ? (
          <Stack gap="sm" className={classes.itemsList}>
            <Paper className={classes.allCheckedState} data-theme={colorScheme}>
              <Text fw={600}>Tout est coché</Text>
              <Text size="sm" c="dimmed">
                Les articles cochés sont masqués pour gagner de la place.
              </Text>
              <UnstyledButton className={classes.allCheckedToggle} onClick={handleToggleShowChecked}>
                Afficher les articles cochés
              </UnstyledButton>
            </Paper>
          </Stack>
        ) : (
          <Stack gap="sm" className={classes.itemsList}>
            {groupedItems.map((group, groupIndex) => {
              const uncheckedItems = group.items.filter(u => !isItemChecked(u));
              const checkedItems = group.items.filter(u => isItemChecked(u));
              const hasChecked = checkedItems.length > 0;
              const hasUnchecked = uncheckedItems.length > 0;
              let itemIndex = 0;

              // When checked items are hidden, skip groups that would render empty.
              if (!showChecked && !hasUnchecked) {
                return null;
              }

              return (
                <Box key={group.label ?? 'all'}>
                  {/* Category header */}
                  {group.label && (
                    <Box className={classes.categoryHeader} data-theme={colorScheme}>
                      <Box 
                        className={classes.categoryDot} 
                        style={{ 
                          background: `var(--mantine-color-${group.color}-5)` 
                        }} 
                      />
                      <Text className={classes.categoryLabel}>{group.label}</Text>
                      <Text className={classes.categoryCount}>
                        {uncheckedItems.length}/{group.items.length}
                      </Text>
                    </Box>
                  )}

                  {/* Unchecked items */}
                  {uncheckedItems.map((unified) => {
                    const delay = (groupIndex * 10 + itemIndex++) * 20;
                    
                    if (unified.type === 'grocery') {
                      return (
                        <GroceryItemRow
                          key={`grocery-${unified.item.id.toString()}`}
                          item={unified.item}
                          onToggle={handleToggleItem}
                          onDelete={handleDeleteItem}
                          delay={delay}
                        />
                      );
                    }
                    if (unified.type === 'recipe') {
                      return (
                        <VirtualItemRow
                          key={`recipe-${unified.item.mealPlanEntryId}-${unified.item.recipeIngredientId}`}
                          item={unified.item}
                          onToggle={handleToggleVirtualItem}
                          delay={delay}
                          showRecipeBadge={groupingMode !== 'recipe'}
                        />
                      );
                    }
                    return (
                      <StapleItemRow
                        key={`staple-${unified.item.stapleItemId}`}
                        item={unified.item}
                        onToggle={handleToggleStapleItem}
                        delay={delay}
                      />
                    );
                  })}

                  {/* Separator within group */}
                  {showChecked && hasChecked && hasUnchecked && (
                    <Box className={classes.separator}>
                      <Box className={classes.separatorLine} />
                      <Text size="xs" c="dimmed" px="md">
                        ✓ {checkedItems.length}
                      </Text>
                      <Box className={classes.separatorLine} />
                    </Box>
                  )}

                  {/* Checked items */}
                  {showChecked &&
                    checkedItems.map((unified) => {
                      const delay = (groupIndex * 10 + itemIndex++) * 20;

                      if (unified.type === 'grocery') {
                        return (
                          <GroceryItemRow
                            key={`grocery-${unified.item.id.toString()}`}
                            item={unified.item}
                            onToggle={handleToggleItem}
                            onDelete={handleDeleteItem}
                            delay={delay}
                          />
                        );
                      }
                      if (unified.type === 'recipe') {
                        return (
                          <VirtualItemRow
                            key={`recipe-${unified.item.mealPlanEntryId}-${unified.item.recipeIngredientId}`}
                            item={unified.item}
                            onToggle={handleToggleVirtualItem}
                            delay={delay}
                            showRecipeBadge={groupingMode !== 'recipe'}
                          />
                        );
                      }
                      return (
                        <StapleItemRow
                          key={`staple-${unified.item.stapleItemId}`}
                          item={unified.item}
                          onToggle={handleToggleStapleItem}
                          delay={delay}
                        />
                      );
                    })}
                </Box>
              );
            })}

            {/* Reset staple items button */}
            {hasStapleItems && (
              <Button
                variant="subtle"
                color="amber"
                size="xs"
                onClick={handleResetStapleItems}
                loading={resetStapleItemChecksMutation.isPending}
                className={classes.resetButton}
              >
                Réinitialiser les produits de base
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </AppLayout>
  );
}

