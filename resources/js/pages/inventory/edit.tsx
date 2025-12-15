import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit3,
    Package,
    Plus,
    Save,
    Trash2,
    X,
    Zap,
} from 'lucide-react';
import React, { useState } from 'react';

interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    description: string;
    current_stock: number;
    minimum_stock: number;
    maximum_stock: number;
    unit_of_measure: string;
    unit_cost: number;
    selling_price: number;
    track_stock: boolean;
    category: {
        id: number;
        name: string;
        color: string;
    };
}

interface Category {
    id: number;
    name: string;
    color: string;
}

interface MenuItem {
    id: number;
    name: string;
    category_id: number | null;
}

interface ExistingMapping {
    id: number;
    menu_item_id: number;
    menu_item_name: string;
    quantity_used: number;
    unit: string;
}

interface IngredientMapping {
    id?: number;
    menu_item_id: number;
    menu_item_name: string;
    quantity_used: number;
    unit: string;
    action: 'create' | 'update' | 'delete';
}

// Helper type for mappings that are being updated (must have id)
interface UpdateIngredientMapping extends IngredientMapping {
    id: number;
    action: 'update';
}

interface EditProps {
    user: {
        name: string;
        email: string;
    };
    inventoryItem: InventoryItem;
    categories: Category[];
    menuItems: MenuItem[];
    existingMappings: ExistingMapping[];
}

export default function Edit({
    user,
    inventoryItem,
    categories,
    menuItems,
    existingMappings,
}: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inventory Management',
            href: '/inventory',
        },
        {
            title: inventoryItem.name,
            href: `/inventory/${inventoryItem.id}`,
        },
        {
            title: 'Edit',
            href: '#',
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: inventoryItem.name,
        sku: inventoryItem.sku,
        description: inventoryItem.description || '',
        category_id: inventoryItem.category.id.toString(),
        minimum_stock: inventoryItem.minimum_stock.toString(),
        maximum_stock: inventoryItem.maximum_stock?.toString() || '',
        unit_of_measure: inventoryItem.unit_of_measure,
        unit_cost: inventoryItem.unit_cost.toString(),
        selling_price: inventoryItem.selling_price?.toString() || '',
        track_stock: inventoryItem.track_stock,
        ingredient_mappings: [] as IngredientMapping[],
    });

    // State for ingredient mappings management
    const [currentMappings, setCurrentMappings] =
        useState<ExistingMapping[]>(existingMappings);
    const [newMappings, setNewMappings] = useState<IngredientMapping[]>([]);
    const [editingMappings, setEditingMappings] = useState<{
        [key: number]: boolean;
    }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare ingredient mappings for submission
        const allMappings: IngredientMapping[] = [
            ...newMappings,
            ...currentMappings
                .filter((mapping) => editingMappings[mapping.id]) // Only include edited mappings
                .map((mapping) => ({
                    id: mapping.id,
                    menu_item_id: mapping.menu_item_id,
                    menu_item_name: mapping.menu_item_name,
                    quantity_used: mapping.quantity_used,
                    unit: mapping.unit,
                    action: 'update' as const,
                })),
        ];

        setData('ingredient_mappings', allMappings);
        put(`/inventory/${inventoryItem.id}`);
    };

    const addNewMapping = () => {
        setNewMappings([
            ...newMappings,
            {
                menu_item_id: 0,
                menu_item_name: '',
                quantity_used: 0,
                unit: inventoryItem.unit_of_measure,
                action: 'create',
            },
        ]);
    };

    const updateNewMapping = (
        index: number,
        field: keyof IngredientMapping,
        value: string | number,
    ) => {
        const updated = [...newMappings];
        if (field === 'menu_item_id') {
            const menuItem = menuItems.find(
                (item) => item.id === Number(value),
            );
            updated[index].menu_item_id = Number(value);
            updated[index].menu_item_name = menuItem?.name || '';
        } else if (field === 'quantity_used') {
            updated[index].quantity_used = Number(value);
        } else if (
            field === 'unit' ||
            field === 'menu_item_name' ||
            field === 'action'
        ) {
            (updated[index] as any)[field] = value;
        }
        setNewMappings(updated);
    };

    const removeNewMapping = (index: number) => {
        setNewMappings(newMappings.filter((_, i) => i !== index));
    };

    const startEditingMapping = (mappingId: number) => {
        setEditingMappings({ ...editingMappings, [mappingId]: true });
    };

    const cancelEditingMapping = (mappingId: number) => {
        setEditingMappings({ ...editingMappings, [mappingId]: false });
        // Reset to original value
        const originalMapping = existingMappings.find(
            (m) => m.id === mappingId,
        );
        if (originalMapping) {
            const updated = currentMappings.map((m) =>
                m.id === mappingId ? { ...originalMapping } : m,
            );
            setCurrentMappings(updated);
        }
    };

    const updateCurrentMapping = (
        mappingId: number,
        field: keyof ExistingMapping,
        value: string | number,
    ) => {
        const updated = currentMappings.map((mapping) => {
            if (mapping.id === mappingId) {
                if (field === 'menu_item_id') {
                    const menuItem = menuItems.find(
                        (item) => item.id === Number(value),
                    );
                    return {
                        ...mapping,
                        menu_item_id: Number(value),
                        menu_item_name:
                            menuItem?.name || mapping.menu_item_name,
                    };
                } else if (field === 'quantity_used') {
                    return { ...mapping, quantity_used: Number(value) };
                } else {
                    return { ...mapping, [field]: value };
                }
            }
            return mapping;
        });
        setCurrentMappings(updated);
    };

    const deleteMapping = async (mappingId: number) => {
        if (
            confirm('Are you sure you want to delete this ingredient mapping?')
        ) {
            try {
                const response = await fetch(
                    `/inventory/${inventoryItem.id}/ingredient-mappings`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({
                            ingredient_mappings: [
                                {
                                    id: mappingId,
                                    menu_item_id: 0,
                                    quantity_used: 0,
                                    unit: '',
                                    action: 'delete',
                                },
                            ],
                        }),
                    },
                );

                if (response.ok) {
                    setCurrentMappings(
                        currentMappings.filter((m) => m.id !== mappingId),
                    );
                } else {
                    alert('Failed to delete mapping');
                }
            } catch (error) {
                console.error('Error deleting mapping:', error);
                alert('Error deleting mapping');
            }
        }
    };

    const unitOptions = [
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'g', label: 'Grams (g)' },
        { value: 'l', label: 'Liters (l)' },
        { value: 'ml', label: 'Milliliters (ml)' },
        { value: 'pcs', label: 'Pieces (pcs)' },
        { value: 'packets', label: 'Packets' },
        { value: 'boxes', label: 'Boxes' },
        { value: 'cans', label: 'Cans' },
        { value: 'bottles', label: 'Bottles' },
        { value: 'packs', label: 'Packs' },
    ];

    const totalMappings = currentMappings.length + newMappings.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${inventoryItem.name} - Inventory`} />

            <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-3xl font-bold text-black dark:text-white">
                            <Package className="mr-3 h-8 w-8 text-red-600 dark:text-red-400" />
                            Edit {inventoryItem.name}
                        </h1>
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                            Update inventory item details and ingredient
                            mappings
                        </p>
                    </div>
                    <a
                        href={`/inventory/${inventoryItem.id}`}
                        className="flex items-center space-x-2 rounded-lg border-2 border-gray-300 px-4 py-2 font-bold text-gray-700 shadow-md transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Item</span>
                    </a>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                    Basic Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Item Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="e.g., Chicken Breast"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            SKU
                                        </label>
                                        <input
                                            type="text"
                                            value={data.sku}
                                            onChange={(e) =>
                                                setData('sku', e.target.value)
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black opacity-50 focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            disabled
                                        />
                                        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            SKU cannot be changed after creation
                                        </p>
                                        {errors.sku && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.sku}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="Brief description of the item..."
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Category *
                                        </label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) =>
                                                setData(
                                                    'category_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="">
                                                Select Category
                                            </option>
                                            {categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.category_id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Ingredient Mappings Section */}
                            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 shadow-lg dark:border-blue-700 dark:bg-blue-900/20">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                                        <Zap className="mr-2 inline h-5 w-5" />
                                        Ingredient Mappings ({
                                            totalMappings
                                        }{' '}
                                        total)
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addNewMapping}
                                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                                    >
                                        <Plus className="mr-1 inline h-4 w-4" />
                                        Add Mapping
                                    </button>
                                </div>

                                <p className="mb-4 text-sm font-medium text-blue-800 dark:text-blue-300">
                                    Dennis can edit these quantities! Change how
                                    much inventory is deducted when menu items
                                    are sold.
                                </p>

                                {/* Existing Mappings */}
                                {currentMappings.length > 0 && (
                                    <div className="mb-4 space-y-3">
                                        <h3 className="font-bold text-blue-900 dark:text-blue-200">
                                            Current Mappings:
                                        </h3>
                                        {currentMappings.map((mapping) => (
                                            <div
                                                key={mapping.id}
                                                className="rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-700 dark:bg-gray-800"
                                            >
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <div>
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            Menu Item:
                                                        </label>
                                                        {editingMappings[
                                                            mapping.id
                                                        ] ? (
                                                            <select
                                                                value={
                                                                    mapping.menu_item_id
                                                                }
                                                                onChange={(e) =>
                                                                    updateCurrentMapping(
                                                                        mapping.id,
                                                                        'menu_item_id',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded border-2 border-gray-300 px-2 py-1 text-black focus:border-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            >
                                                                {menuItems.map(
                                                                    (item) => (
                                                                        <option
                                                                            key={
                                                                                item.id
                                                                            }
                                                                            value={
                                                                                item.id
                                                                            }
                                                                        >
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        ) : (
                                                            <p className="font-medium text-black dark:text-white">
                                                                {
                                                                    mapping.menu_item_name
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            Quantity Used:
                                                        </label>
                                                        {editingMappings[
                                                            mapping.id
                                                        ] ? (
                                                            <input
                                                                type="number"
                                                                step="0.001"
                                                                min="0"
                                                                value={
                                                                    mapping.quantity_used
                                                                }
                                                                onChange={(e) =>
                                                                    updateCurrentMapping(
                                                                        mapping.id,
                                                                        'quantity_used',
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                className="w-full rounded border-2 border-gray-300 px-2 py-1 text-black focus:border-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            />
                                                        ) : (
                                                            <p className="font-medium text-black dark:text-white">
                                                                {
                                                                    mapping.quantity_used
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            Unit:
                                                        </label>
                                                        {editingMappings[
                                                            mapping.id
                                                        ] ? (
                                                            <select
                                                                value={
                                                                    mapping.unit
                                                                }
                                                                onChange={(e) =>
                                                                    updateCurrentMapping(
                                                                        mapping.id,
                                                                        'unit',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded border-2 border-gray-300 px-2 py-1 text-black focus:border-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            >
                                                                {unitOptions.map(
                                                                    (unit) => (
                                                                        <option
                                                                            key={
                                                                                unit.value
                                                                            }
                                                                            value={
                                                                                unit.value
                                                                            }
                                                                        >
                                                                            {
                                                                                unit.value
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        ) : (
                                                            <p className="font-medium text-black dark:text-white">
                                                                {mapping.unit}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        {editingMappings[
                                                            mapping.id
                                                        ] ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setEditingMappings(
                                                                            {
                                                                                ...editingMappings,
                                                                                [mapping.id]: false,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        cancelEditingMapping(
                                                                            mapping.id,
                                                                        )
                                                                    }
                                                                    className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        startEditingMapping(
                                                                            mapping.id,
                                                                        )
                                                                    }
                                                                    className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        deleteMapping(
                                                                            mapping.id,
                                                                        )
                                                                    }
                                                                    className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New Mappings */}
                                {newMappings.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-blue-900 dark:text-blue-200">
                                            New Mappings:
                                        </h3>
                                        {newMappings.map((mapping, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-700 dark:bg-gray-800"
                                            >
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <div>
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            Menu Item:
                                                        </label>
                                                        <select
                                                            value={
                                                                mapping.menu_item_id
                                                            }
                                                            onChange={(e) =>
                                                                updateNewMapping(
                                                                    index,
                                                                    'menu_item_id',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded border-2 border-gray-300 px-2 py-1 text-black focus:border-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        >
                                                            <option value="">
                                                                Select Menu Item
                                                            </option>
                                                            {menuItems.map(
                                                                (item) => (
                                                                    <option
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        value={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            Quantity:
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            min="0"
                                                            value={
                                                                mapping.quantity_used
                                                            }
                                                            onChange={(e) =>
                                                                updateNewMapping(
                                                                    index,
                                                                    'quantity_used',
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="w-full rounded border-2 border-gray-300 px-2 py-1 text-black focus:border-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            Unit:
                                                        </label>
                                                        <select
                                                            value={mapping.unit}
                                                            onChange={(e) =>
                                                                updateNewMapping(
                                                                    index,
                                                                    'unit',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded border-2 border-gray-300 px-2 py-1 text-black focus:border-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        >
                                                            {unitOptions.map(
                                                                (unit) => (
                                                                    <option
                                                                        key={
                                                                            unit.value
                                                                        }
                                                                        value={
                                                                            unit.value
                                                                        }
                                                                    >
                                                                        {
                                                                            unit.label
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeNewMapping(
                                                                    index,
                                                                )
                                                            }
                                                            className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Show message when no mappings */}
                                {currentMappings.length === 0 &&
                                    newMappings.length === 0 && (
                                        <div className="py-8 text-center">
                                            <p className="font-medium text-blue-800 dark:text-blue-300">
                                                No ingredient mappings
                                                configured. Click "Add Mapping"
                                                to link this item to menu items.
                                            </p>
                                        </div>
                                    )}
                            </div>

                            {/* Stock Settings */}
                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                    Stock Settings
                                </h2>
                                <div className="space-y-4">
                                    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                                        <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                                            <strong>Note:</strong> Current stock
                                            level ({inventoryItem.current_stock}{' '}
                                            {inventoryItem.unit_of_measure})
                                            cannot be changed here. Use "Add
                                            Stock" or "Use Stock" on the item
                                            view page.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Minimum Stock *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.minimum_stock}
                                                onChange={(e) =>
                                                    setData(
                                                        'minimum_stock',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="0.00"
                                                required
                                            />
                                            {errors.minimum_stock && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.minimum_stock}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Alert threshold for low stock
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Maximum Stock
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.maximum_stock}
                                                onChange={(e) =>
                                                    setData(
                                                        'maximum_stock',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Optional"
                                            />
                                            {errors.maximum_stock && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.maximum_stock}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Unit of Measure *
                                            </label>
                                            <select
                                                value={data.unit_of_measure}
                                                onChange={(e) =>
                                                    setData(
                                                        'unit_of_measure',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                required
                                            >
                                                {unitOptions.map((unit) => (
                                                    <option
                                                        key={unit.value}
                                                        value={unit.value}
                                                    >
                                                        {unit.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.unit_of_measure && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.unit_of_measure}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.track_stock}
                                                onChange={(e) =>
                                                    setData(
                                                        'track_stock',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="mr-2 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Track stock levels for this item
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Cost Information */}
                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                    Cost Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Unit Cost (KES) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.unit_cost}
                                            onChange={(e) =>
                                                setData(
                                                    'unit_cost',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors.unit_cost && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.unit_cost}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Cost per unit of measure
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Selling Price (KES)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.selling_price}
                                            onChange={(e) =>
                                                setData(
                                                    'selling_price',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="Optional"
                                        />
                                        {errors.selling_price && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.selling_price}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            If sold directly to customers
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center space-x-2 rounded-lg bg-red-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes & Mappings'}
                                    </span>
                                </button>

                                <a
                                    href={`/inventory/${inventoryItem.id}`}
                                    className="flex items-center space-x-2 rounded-lg border-2 border-gray-300 px-6 py-3 font-bold text-gray-700 shadow-md transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </a>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Ingredient Mapping Guide */}
                        <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 shadow-lg dark:border-green-700 dark:bg-green-900/20">
                            <h3 className="flex items-center font-bold text-green-900 dark:text-green-200">
                                <Edit3 className="mr-2 h-5 w-5" />
                                Control Panel
                            </h3>
                            <div className="mt-2 space-y-2 text-sm text-green-800 dark:text-green-300">
                                <p className="font-medium">
                                    Edit ingredient quantities:
                                </p>
                                <div className="space-y-1 text-xs">
                                    <div>
                                        <strong>Edit existing</strong> - Click
                                        pencil icon to modify quantities
                                    </div>
                                    <div>
                                        <strong>Add new links</strong> - Connect
                                        to any menu item
                                    </div>
                                    <div>
                                        <strong>Delete unwanted</strong> -
                                        Remove links you don't need
                                    </div>
                                    <div>
                                        <strong>Perfect control</strong> - Set
                                        exact deduction amounts
                                    </div>
                                </div>
                                <p className="mt-3 text-xs font-medium opacity-75">
                                    Example: Change Andazi Flour from -0.050 kg
                                    to -0.075 kg for more accurate recipes!
                                </p>
                            </div>
                        </div>

                        {/* Current Item Info */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="font-bold text-black dark:text-white">
                                Current Item Status
                            </h3>
                            <div className="mt-2 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Current Stock:
                                    </span>
                                    <span className="font-bold text-black dark:text-white">
                                        {inventoryItem.current_stock}{' '}
                                        {inventoryItem.unit_of_measure}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Stock Value:
                                    </span>
                                    <span className="font-bold text-black dark:text-white">
                                        KES{' '}
                                        {(
                                            inventoryItem.current_stock *
                                            inventoryItem.unit_cost
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Current Category:
                                    </span>
                                    <span
                                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-bold"
                                        style={{
                                            backgroundColor:
                                                inventoryItem.category.color +
                                                '20',
                                            color: inventoryItem.category.color,
                                        }}
                                    >
                                        {inventoryItem.category.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Active Mappings:
                                    </span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {totalMappings} linked
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Notes */}
                        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 shadow-lg dark:border-yellow-700 dark:bg-yellow-900/20">
                            <h3 className="font-bold text-yellow-900 dark:text-yellow-200">
                                Edit Guidelines
                            </h3>
                            <ul className="mt-2 space-y-1 text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                <li>• SKU cannot be changed after creation</li>
                                <li>• Current stock is managed separately</li>
                                <li>
                                    • Mapping changes apply to future orders
                                </li>
                                <li>
                                    • Use precise quantities for accurate
                                    costing
                                </li>
                            </ul>
                        </div>

                        {/* Categories Available */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="font-bold text-black dark:text-white">
                                Categories Available
                            </h3>
                            <div className="mt-2 space-y-1">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center text-sm"
                                    >
                                        <div
                                            className="mr-2 h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: category.color,
                                            }}
                                        />
                                        <span className="font-medium text-black dark:text-white">
                                            {category.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
