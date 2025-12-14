import { useState, useRef, useEffect } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
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
import { GroceryItem } from '../gen/octoback/groceries/v1/groceries_pb';
import { VirtualGroceryItem } from '../gen/octoback/mealplans/v1/mealplans_pb';
import { useQueryClient } from '@tanstack/react-query';
import { FieldMask } from '@bufbuild/protobuf';
import classes from './GroceryListDetail.module.css';

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
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6L5 3H2" />
      <circle cx="9" cy="20" r="1" fill="currentColor" />
      <circle cx="18" cy="20" r="1" fill="currentColor" />
      <line x1="9" y1="10" x2="18" y2="10" />
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

function GroceryItemRow({ item, onToggle, onDelete, delay }: GroceryItemRowProps) {
  const { colorScheme } = useMantineColorScheme();
  const [isHovered, setIsHovered] = useState(false);
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

        <Transition mounted={isHovered} transition="fade" duration={150}>
          {(styles) => (
            <ActionIcon
              variant="subtle"
              color="red"
              size="md"
              style={styles}
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
}

function VirtualItemRow({ item, onToggle, delay }: VirtualItemRowProps) {
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
            <Badge size="xs" variant="light" color="sage" className={classes.recipeBadge}>
              {item.recipeName}
            </Badge>
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

export function GroceryListDetailPage() {
  const { colorScheme } = useMantineColorScheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const listId = BigInt(id ?? '0');

  const { data: listData, isLoading: listLoading } = useGroceryList(listId);
  const { data: itemsData, isLoading: itemsLoading } = useGroceryItems(listId);
  const { data: virtualItemsData, isLoading: virtualItemsLoading } = useVirtualGroceryItems(listId);
  const createMutation = useCreateGroceryItem();
  const updateMutation = useUpdateGroceryItem();
  const deleteMutation = useDeleteGroceryItem();
  const setMealPlanItemCheckMutation = useSetMealPlanItemCheck();

  const list = listData?.groceryList;
  const items = itemsData?.groceryItems ?? [];
  const virtualItems = virtualItemsData?.items ?? [];

  // Sort items: unchecked first, then checked
  const sortedItems = [...items].sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

  const sortedVirtualItems = [...virtualItems].sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

  const totalCount = items.length + virtualItems.length;
  const uncheckedCount = items.filter((i) => !i.checked).length + virtualItems.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length + virtualItems.filter((i) => i.checked).length;

  useEffect(() => {
    if (!listLoading && !list) {
      navigate('/groceries');
    }
  }, [listLoading, list, navigate]);

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    await createMutation.mutateAsync({
      groceryList: listId,
      name: newItemName.trim(),
      quantity: newItemQuantity,
      checked: false,
    });

    queryClient.invalidateQueries({
      queryKey: ['octoback.groceries.v1.Service', 'ListGroceryItems'],
    });

    setNewItemName('');
    setNewItemQuantity(1);
    inputRef.current?.focus();
  };

  const handleToggleItem = async (item: GroceryItem) => {
    await updateMutation.mutateAsync({
      groceryItem: {
        ...item,
        checked: !item.checked,
      },
      updateMask: new FieldMask({ paths: ['checked'] }),
    });

    queryClient.invalidateQueries({
      queryKey: ['octoback.groceries.v1.Service', 'ListGroceryItems'],
    });
  };

  const handleToggleVirtualItem = async (item: VirtualGroceryItem) => {
    await setMealPlanItemCheckMutation.mutateAsync({
      mealPlanEntryId: item.mealPlanEntryId,
      recipeIngredientId: item.recipeIngredientId,
      checked: !item.checked,
    });

    queryClient.invalidateQueries({
      queryKey: ['octoback.mealplans.v1.Service', 'ListVirtualGroceryItems'],
    });
  };

  const handleDeleteItem = async (itemId: bigint) => {
    await deleteMutation.mutateAsync({ id: itemId });
    queryClient.invalidateQueries({
      queryKey: ['octoback.groceries.v1.Service', 'ListGroceryItems'],
    });
  };

  const isLoading = listLoading || itemsLoading || virtualItemsLoading;

  return (
    <AppLayout title={list?.name ?? 'Chargement...'} backTo="/groceries">
      <Box className={classes.wrapper} data-theme={colorScheme}>
        {/* Progress indicator */}
        {totalCount > 0 && (
          <Box className={classes.progress}>
            <Box className={classes.progressBar}>
              <Box
                className={classes.progressFill}
                style={{ width: `${(checkedCount / totalCount) * 100}%` }}
              />
            </Box>
            <Text size="sm" c="dimmed">
              {checkedCount} / {totalCount} articles
            </Text>
          </Box>
        )}

        {/* Add item form */}
        <Paper className={classes.addForm} data-theme={colorScheme}>
          <Group className={classes.addFormGroup} wrap="nowrap">
            <TextInput
              ref={inputRef}
              placeholder="Ajouter un article..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
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
              onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.currentTarget.value) || 1))}
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
        ) : (
          <Stack gap="sm" className={classes.itemsList}>
            {/* Unchecked regular items */}
            {sortedItems
              .filter((item) => !item.checked)
              .map((item, index) => (
                <GroceryItemRow
                  key={`regular-${item.id.toString()}`}
                  item={item}
                  onToggle={handleToggleItem}
                  onDelete={handleDeleteItem}
                  delay={index * 30}
                />
              ))}

            {/* Unchecked virtual items (from meal plan) */}
            {sortedVirtualItems
              .filter((item) => !item.checked)
              .map((item, index) => (
                <VirtualItemRow
                  key={`virtual-${item.mealPlanEntryId}-${item.recipeIngredientId}`}
                  item={item}
                  onToggle={handleToggleVirtualItem}
                  delay={(sortedItems.filter(i => !i.checked).length + index) * 30}
                />
              ))}

            {/* Separator */}
            {checkedCount > 0 && uncheckedCount > 0 && (
              <Box className={classes.separator}>
                <Box className={classes.separatorLine} />
                <Text size="xs" c="dimmed" px="md">
                  Terminés ({checkedCount})
                </Text>
                <Box className={classes.separatorLine} />
              </Box>
            )}

            {/* Checked regular items */}
            {sortedItems
              .filter((item) => item.checked)
              .map((item, index) => (
                <GroceryItemRow
                  key={`regular-${item.id.toString()}`}
                  item={item}
                  onToggle={handleToggleItem}
                  onDelete={handleDeleteItem}
                  delay={(uncheckedCount + index) * 30}
                />
              ))}

            {/* Checked virtual items */}
            {sortedVirtualItems
              .filter((item) => item.checked)
              .map((item, index) => (
                <VirtualItemRow
                  key={`virtual-${item.mealPlanEntryId}-${item.recipeIngredientId}`}
                  item={item}
                  onToggle={handleToggleVirtualItem}
                  delay={(uncheckedCount + sortedItems.filter(i => i.checked).length + index) * 30}
                />
              ))}
          </Stack>
        )}
      </Box>
    </AppLayout>
  );
}

