import { useState, useRef, useEffect } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
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
  useStapleList,
  useStapleItems,
  useCreateStapleItem,
  useUpdateStapleItem,
  useDeleteStapleItem,
  useUpdateStapleList,
} from '../hooks/use-staples';
import { useGroceryLists } from '../hooks/use-groceries';
import { StapleItem } from '../gen/octoback/staples/v1/staples_pb';
import { useQueryClient } from '@tanstack/react-query';
import classes from './StapleListDetail.module.css';

function SaltIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L8 6h8l-4-4z" />
      <rect x="6" y="6" width="12" height="16" rx="2" />
      <circle cx="10" cy="12" r="0.5" fill="currentColor" />
      <circle cx="14" cy="14" r="0.5" fill="currentColor" />
      <circle cx="11" cy="16" r="0.5" fill="currentColor" />
      <circle cx="13" cy="10" r="0.5" fill="currentColor" />
    </svg>
  );
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

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function EmptyState() {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box className={classes.emptyState} data-theme={colorScheme}>
      <Box className={classes.emptyIcon}>
        <SaltIcon size={64} />
      </Box>
      <Text className={classes.emptyTitle}>Liste vide</Text>
      <Text c="dimmed" size="md" maw={320} ta="center" lh={1.6}>
        Ajoutez vos produits essentiels pour qu'ils apparaissent dans votre liste de courses.
      </Text>
    </Box>
  );
}

interface StapleItemRowProps {
  item: StapleItem;
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

function StapleItemRow({ item, onDelete, delay }: StapleItemRowProps) {
  const { colorScheme } = useMantineColorScheme();
  const [isHovered, setIsHovered] = useState(false);
  const isTouchDevice = useIsTouchDevice();

  const showDelete = isHovered || isTouchDevice;

  return (
    <Paper
      className={classes.itemRow}
      data-theme={colorScheme}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Group className={classes.itemRowGroup} wrap="nowrap">
        <Box className={classes.itemIcon}>
          <SaltIcon size={20} />
        </Box>

        <Box className={classes.itemContent} style={{ flex: 1 }}>
          <Text className={classes.itemName}>
            {item.name}
          </Text>
          {item.quantity > 1 && (
            <Text className={classes.itemQuantity}>
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
    </Paper>
  );
}

export function StapleListDetailPage() {
  const { colorScheme } = useMantineColorScheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const listId = BigInt(id ?? '0');

  const { data: listData, isLoading: listLoading } = useStapleList(listId);
  const { data: itemsData, isLoading: itemsLoading } = useStapleItems(listId);
  const { data: groceryListsData } = useGroceryLists();
  const createMutation = useCreateStapleItem();
  const deleteMutation = useDeleteStapleItem();
  const updateListMutation = useUpdateStapleList();

  const list = listData?.stapleList;
  const items = itemsData?.stapleItems ?? [];
  const groceryLists = groceryListsData?.groceryLists ?? [];

  const linkedGroceryList = list?.groceryListId
    ? groceryLists.find(gl => gl.id === list.groceryListId)
    : undefined;

  const groceryListOptions = groceryLists.map(gl => ({
    value: gl.id.toString(),
    label: gl.name,
  }));

  useEffect(() => {
    if (!listLoading && !list) {
      navigate('/staples');
    }
  }, [listLoading, list, navigate]);

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    const tempId = BigInt(Date.now());
    const newItem = {
      id: tempId,
      stapleListId: listId,
      name: newItemName.trim(),
      quantity: newItemQuantity,
    };

    // Optimistic update: add the item immediately
    queryClient.setQueryData(
      ['octoback.staples.v1.Service', 'ListStapleItems', { stapleListId: listId.toString() + 'n' }],
      (old: { stapleItems: StapleItem[] } | undefined) => ({
        stapleItems: [...(old?.stapleItems ?? []), newItem],
      })
    );

    setNewItemName('');
    setNewItemQuantity(1);
    inputRef.current?.focus();

    try {
      await createMutation.mutateAsync({
        stapleListId: listId,
        name: newItem.name,
        quantity: newItem.quantity,
      });
    } finally {
      // Refetch to get the real ID from server
      queryClient.invalidateQueries({
        queryKey: ['octoback.staples.v1.Service', 'ListStapleItems'],
      });
    }
  };

  const handleDeleteItem = async (itemId: bigint) => {
    // Optimistic update: remove immediately
    queryClient.setQueryData(
      ['octoback.staples.v1.Service', 'ListStapleItems', { stapleListId: listId.toString() + 'n' }],
      (old: { stapleItems: StapleItem[] } | undefined) => ({
        stapleItems: (old?.stapleItems ?? []).filter((i) => i.id !== itemId),
      })
    );

    try {
      await deleteMutation.mutateAsync({ id: itemId });
    } catch {
      // Revert on error
      queryClient.invalidateQueries({
        queryKey: ['octoback.staples.v1.Service', 'ListStapleItems'],
      });
    }
  };

  const handleLinkGroceryList = async (groceryListId: string | null) => {
    if (!list) return;

    try {
      await updateListMutation.mutateAsync({
        id: listId,
        name: list.name,
        groceryListId: groceryListId ? BigInt(groceryListId) : BigInt(0),
        version: list.version,
      });
      queryClient.invalidateQueries({
        queryKey: ['octoback.staples.v1.Service', 'GetStapleList'],
      });
      queryClient.invalidateQueries({
        queryKey: ['octoback.staples.v1.Service', 'ListStapleLists'],
      });
    } catch {
      // Handle error
    }
  };

  const isLoading = listLoading || itemsLoading;

  return (
    <AppLayout title={list?.name ?? 'Chargement...'} backTo="/staples">
      <Box className={classes.wrapper} data-theme={colorScheme}>
        {/* Link to grocery list */}
        <Paper className={classes.linkSection} data-theme={colorScheme}>
          <Group gap="sm" align="center">
            <LinkIcon />
            <Text size="sm" fw={500}>Liste de courses associée</Text>
          </Group>
          <Select
            placeholder="Sélectionner une liste"
            data={groceryListOptions}
            value={linkedGroceryList?.id.toString() ?? null}
            onChange={handleLinkGroceryList}
            size="sm"
            radius="md"
            clearable
            searchable
            className={classes.linkSelect}
          />
          {linkedGroceryList && (
            <Badge variant="light" color="coral" size="sm">
              Les produits apparaissent dans "{linkedGroceryList.name}"
            </Badge>
          )}
        </Paper>

        {/* Add item form */}
        <Paper className={classes.addForm} data-theme={colorScheme}>
          <Group className={classes.addFormGroup} wrap="nowrap">
            <TextInput
              ref={inputRef}
              placeholder="Ajouter un produit..."
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
              color="amber"
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
            <Loader color="amber" size="lg" />
          </Box>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <Stack gap="sm" className={classes.itemsList}>
            {items.map((item, index) => (
              <StapleItemRow
                key={item.id.toString()}
                item={item}
                onDelete={handleDeleteItem}
                delay={index * 30}
              />
            ))}
          </Stack>
        )}
      </Box>
    </AppLayout>
  );
}

