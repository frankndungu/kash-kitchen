import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Edit3, Info, Package, Plus, Save, Trash2, X, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/inventory',
    },
    {
        title: 'Add Item',
        href: '#',
    },
];

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

interface IngredientMapping {
    menu_item_id: number;
    menu_item_name: string;
    quantity_used: number;
    unit: string;
    suggested?: boolean;
}

interface CreateProps {
    user: {
        name: string;
        email: string;
    };
    categories: Category[];
    menuItems: MenuItem[];
    newCategory?: {
        id: number;
        name: string;
        color: string;
    };
}

export default function Create({
    user,
    categories,
    menuItems,
    newCategory,
}: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        description: '',
        category_id: '',
        current_stock: '',
        minimum_stock: '',
        maximum_stock: '',
        unit_of_measure: 'kg',
        unit_cost: '',
        selling_price: '',
        track_stock: true,
        storage_requirements: [],
        ingredient_mappings: [] as IngredientMapping[],
    });

    // Category creation form
    const {
        data: categoryData,
        setData: setCategoryData,
        post: postCategory,
        processing: categoryProcessing,
        errors: categoryErrors,
        reset: resetCategory,
    } = useForm({
        name: '',
        description: '',
        color: '#10B981',
    });

    // State for modals and dynamic data
    const [categoriesList, setCategoriesList] = useState(categories);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [suggestedMappings, setSuggestedMappings] = useState<
        IngredientMapping[]
    >([]);
    const [showMappingsModal, setShowMappingsModal] = useState(false);
    const [customMappings, setCustomMappings] = useState<IngredientMapping[]>(
        [],
    );

    // Handle new category from backend
    useEffect(() => {
        if (newCategory) {
            setCategoriesList([...categoriesList, newCategory]);
            setData('category_id', newCategory.id.toString());
            setShowCategoryModal(false);
            resetCategory();
        }
    }, [newCategory]);

    // Fetch suggested mappings when item name changes
    useEffect(() => {
        if (data.name && data.name.length > 2) {
            fetchSuggestedMappings(data.name);
        } else {
            setSuggestedMappings([]);
        }
    }, [data.name]);

    const fetchSuggestedMappings = async (itemName: string) => {
        try {
            const response = await fetch('/inventory/suggested-mappings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ item_name: itemName }),
            });

            if (response.ok) {
                const result = await response.json();
                setSuggestedMappings(result.suggestions || []);
            }
        } catch (error) {
            console.error('Failed to fetch suggested mappings:', error);
            setSuggestedMappings([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Include both suggested mappings (modified) and custom mappings
        const allMappings = [
            ...customMappings,
            ...suggestedMappings.filter(
                (m) => !m.suggested || m.quantity_used > 0,
            ),
        ];
        setData('ingredient_mappings', allMappings);
        post('/inventory');
    };

    // Create new category using Inertia
    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        postCategory('/inventory/create-category', {
            onSuccess: () => {
                // Modal will close and form will update via useEffect
            },
            onError: (errors) => {
                console.error('Category creation failed:', errors);
            },
        });
    };

    const addCustomMapping = () => {
        setCustomMappings([
            ...customMappings,
            {
                menu_item_id: 0,
                menu_item_name: '',
                quantity_used: 0,
                unit: data.unit_of_measure,
            },
        ]);
    };

    const updateCustomMapping = (
        index: number,
        field: keyof IngredientMapping,
        value: string | number,
    ) => {
        const updated = [...customMappings];
        if (field === 'menu_item_id') {
            const menuItem = menuItems.find(
                (item) => item.id === Number(value),
            );
            updated[index].menu_item_id = Number(value);
            updated[index].menu_item_name = menuItem?.name || '';
        } else {
            (updated[index] as any)[field] = value;
        }
        setCustomMappings(updated);
    };

    const removeCustomMapping = (index: number) => {
        setCustomMappings(customMappings.filter((_, i) => i !== index));
    };

    const updateSuggestedMapping = (index: number, quantity: number) => {
        const updated = [...suggestedMappings];
        updated[index].quantity_used = quantity;
        setSuggestedMappings(updated);
    };

    const colorOptions = [
        { value: '#DC2626', label: 'Red' },
        { value: '#10B981', label: 'Green' },
        { value: '#3B82F6', label: 'Blue' },
        { value: '#8B5CF6', label: 'Purple' },
        { value: '#F59E0B', label: 'Amber' },
        { value: '#EF4444', label: 'Orange' },
        { value: '#EC4899', label: 'Pink' },
        { value: '#6B7280', label: 'Gray' },
    ];

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

    // Check if the item name matches auto-deduction items
    const getAutoDeductionInfo = (itemName: string) => {
        const name = itemName.toLowerCase();

        if (name.includes('chicken')) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for chicken dishes: 1/4 Chicken, 1/2 Chicken, Full Chicken, and all chicken combos',
                estimatedLinks: '9+ menu items',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (name.includes('potato')) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for chips and potato dishes: All chips varieties, Bhajia, and combo meals with chips',
                estimatedLinks: '15+ menu items',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (name.includes('wing')) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for wing dishes: 2PCS Wings, 4PCS Wings, Lollipops, and all wing combos',
                estimatedLinks: '12+ menu items',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (
            name.includes('flour') ||
            name.includes('bread') ||
            name.includes('bun')
        ) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for flour-based items: Chapati, Bhajia, Samosas, Burgers, or baked goods',
                estimatedLinks: '4+ menu items',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }

        return {
            willAutoDeduct: false,
            description:
                "Manual stock tracking only - no automatic deduction configured. Item name doesn't match common ingredients.",
            estimatedLinks: '0 menu items',
            color: 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-300',
        };
    };

    const autoDeductInfo = getAutoDeductionInfo(data.name);
    const totalMappings =
        suggestedMappings.filter((m) => m.quantity_used > 0).length +
        customMappings.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Inventory Item" />

            <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-3xl font-bold text-black dark:text-white">
                            <Package className="mr-3 h-8 w-8 text-red-600 dark:text-red-400" />
                            Add Inventory Item
                        </h1>
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                            Add a new item to your restaurant's inventory system
                            with custom deduction quantities
                        </p>
                    </div>
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
                                            placeholder="e.g., Andazi Flour, Fresh Chicken, Potatoes"
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
                                            SKU (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.sku}
                                            onChange={(e) =>
                                                setData('sku', e.target.value)
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="Auto-generated if empty"
                                        />
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
                                        <div className="flex space-x-2">
                                            <select
                                                value={data.category_id}
                                                onChange={(e) =>
                                                    setData(
                                                        'category_id',
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                required
                                            >
                                                <option value="">
                                                    Select Category
                                                </option>
                                                {categoriesList.map(
                                                    (category) => (
                                                        <option
                                                            key={category.id}
                                                            value={category.id}
                                                        >
                                                            {category.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCategoryModal(true)
                                                }
                                                className="rounded-lg bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                                title="Create New Category"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {errors.category_id && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.category_id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Ingredient Mappings Section */}
                            {(suggestedMappings.length > 0 ||
                                customMappings.length > 0) && (
                                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 shadow-lg dark:border-blue-700 dark:bg-blue-900/20">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                                            <Zap className="mr-2 inline h-5 w-5" />
                                            Ingredient Mappings ({totalMappings}{' '}
                                            detected)
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={addCustomMapping}
                                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                                        >
                                            <Plus className="mr-1 inline h-4 w-4" />
                                            Add Manual Link
                                        </button>
                                    </div>

                                    <p className="mb-4 text-sm font-medium text-blue-800 dark:text-blue-300">
                                        Admin can edit these quantities! System
                                        detected these menu items - adjust the
                                        deduction amounts as needed.
                                    </p>

                                    {/* Suggested Mappings */}
                                    {suggestedMappings.length > 0 && (
                                        <div className="mb-4 space-y-3">
                                            <h3 className="font-bold text-blue-900 dark:text-blue-200">
                                                Auto-Detected Links:
                                            </h3>
                                            {suggestedMappings.map(
                                                (mapping, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-700 dark:bg-gray-800"
                                                    >
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <div>
                                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                                    Menu Item:
                                                                </label>
                                                                <p className="font-medium text-black dark:text-white">
                                                                    {
                                                                        mapping.menu_item_name
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                                    Quantity
                                                                    Used:
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.001"
                                                                    min="0"
                                                                    value={
                                                                        mapping.quantity_used
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateSuggestedMapping(
                                                                            index,
                                                                            Number(
                                                                                e
                                                                                    .target
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
                                                                <p className="font-medium text-black dark:text-white">
                                                                    {
                                                                        mapping.unit
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}

                                    {/* Custom Mappings */}
                                    {customMappings.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-blue-900 dark:text-blue-200">
                                                Manual Links:
                                            </h3>
                                            {customMappings.map(
                                                (mapping, index) => (
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
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateCustomMapping(
                                                                            index,
                                                                            'menu_item_id',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full rounded border-2 border-gray-300 px-2 py-1 text-black focus:border-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                >
                                                                    <option value="">
                                                                        Select
                                                                        Menu
                                                                        Item
                                                                    </option>
                                                                    {menuItems.map(
                                                                        (
                                                                            item,
                                                                        ) => (
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
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateCustomMapping(
                                                                            index,
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
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                                    Unit:
                                                                </label>
                                                                <select
                                                                    value={
                                                                        mapping.unit
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateCustomMapping(
                                                                            index,
                                                                            'unit',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full rounded border-2 border-gray-300 px-2 py-1 text-black focus:border-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                >
                                                                    {unitOptions.map(
                                                                        (
                                                                            unit,
                                                                        ) => (
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
                                                                        removeCustomMapping(
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
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Auto-Deduction Preview */}
                            {data.name && (
                                <div
                                    className={`rounded-lg border-2 p-4 shadow-lg ${autoDeductInfo.color}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-2xl">
                                            {autoDeductInfo.willAutoDeduct ? (
                                                <Zap className="h-6 w-6" />
                                            ) : (
                                                <Info className="h-6 w-6" />
                                            )}
                                        </span>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold">
                                                {autoDeductInfo.willAutoDeduct
                                                    ? 'Automatic Deduction Enabled'
                                                    : 'Manual Tracking Only'}
                                            </h3>
                                            <p className="text-sm font-medium">
                                                {autoDeductInfo.description}
                                            </p>
                                            {autoDeductInfo.willAutoDeduct && (
                                                <div className="mt-2 space-y-1">
                                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                        Estimated Links:{' '}
                                                        {
                                                            autoDeductInfo.estimatedLinks
                                                        }
                                                    </div>
                                                    <div className="text-xs font-medium opacity-75">
                                                        Admin can customize all
                                                        quantities above before
                                                        saving!
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rest of form sections remain the same... */}

                            {/* Stock Information */}
                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                    Stock Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Current Stock *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.current_stock}
                                            onChange={(e) =>
                                                setData(
                                                    'current_stock',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors.current_stock && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.current_stock}
                                            </p>
                                        )}
                                    </div>

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
                                            : 'Save Item with Custom Mappings'}
                                    </span>
                                </button>

                                <a
                                    href="/inventory"
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
                                Custom Control
                            </h3>
                            <div className="mt-2 space-y-2 text-sm text-green-800 dark:text-green-300">
                                <p className="font-medium">
                                    You can now edit ingredient quantities:
                                </p>
                                <div className="space-y-1 text-xs">
                                    <div>
                                        <strong>Change -0.050 kg</strong> to any
                                        amount you need
                                    </div>
                                    <div>
                                        <strong>Add manual links</strong> to
                                        other menu items
                                    </div>
                                    <div>
                                        <strong>Remove unwanted</strong>{' '}
                                        auto-detected links
                                    </div>
                                    <div>
                                        <strong>Perfect control</strong> over
                                        inventory deduction
                                    </div>
                                </div>
                                <p className="mt-3 text-xs font-medium opacity-75">
                                    Example: "Andazi Flour" auto-detects
                                    "Andazi" at -0.050 kg, but you can change it
                                    to -0.075 kg or any amount!
                                </p>
                            </div>
                        </div>

                        {/* Auto-Deduction Info */}
                        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-700 dark:bg-blue-900/20">
                            <h3 className="flex items-center font-bold text-blue-900 dark:text-blue-200">
                                <Zap className="mr-2 h-5 w-5" />
                                Automatic Detection
                            </h3>
                            <div className="mt-2 space-y-2 text-sm text-blue-800 dark:text-blue-300">
                                <p className="font-medium">
                                    System automatically detects ingredients:
                                </p>
                                <div className="space-y-1 text-xs">
                                    <div>
                                        <strong>Chicken</strong> - Auto-detects
                                        chicken dishes
                                    </div>
                                    <div>
                                        <strong>Potatoes</strong> - Auto-detects
                                        chips and bhajia
                                    </div>
                                    <div>
                                        <strong>Flour</strong> - Auto-detects
                                        andazi, chapati, etc.
                                    </div>
                                    <div>
                                        <strong>Wings</strong> - Auto-detects
                                        wing dishes
                                    </div>
                                    <div>
                                        <strong>Spices</strong> - Auto-detects
                                        seasoned dishes
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                Quick Tips
                            </h3>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <li>
                                    • Type ingredient name to see auto-detection
                                </li>
                                <li>• Edit quantities to match your recipes</li>
                                <li>
                                    • Add manual links for special ingredients
                                </li>
                                <li>• Use + button to create categories</li>
                                <li>• All mappings are fully customizable</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Category Creation Modal - Same as before */}
                {showCategoryModal && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-black dark:text-white">
                                    Create New Category
                                </h3>
                                <button
                                    onClick={() => setShowCategoryModal(false)}
                                    className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleCreateCategory}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={categoryData.name}
                                        onChange={(e) =>
                                            setCategoryData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g., Premium Ingredients"
                                        required
                                    />
                                    {categoryErrors.name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {categoryErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        value={categoryData.description}
                                        onChange={(e) =>
                                            setCategoryData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Brief description..."
                                    />
                                    {categoryErrors.description && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {categoryErrors.description}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Color
                                    </label>
                                    <select
                                        value={categoryData.color}
                                        onChange={(e) =>
                                            setCategoryData(
                                                'color',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        {colorOptions.map((color) => (
                                            <option
                                                key={color.value}
                                                value={color.value}
                                            >
                                                {color.label}
                                            </option>
                                        ))}
                                    </select>
                                    {categoryErrors.color && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {categoryErrors.color}
                                        </p>
                                    )}
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        disabled={categoryProcessing}
                                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {categoryProcessing
                                            ? 'Creating...'
                                            : 'Create Category'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCategoryModal(false)
                                        }
                                        className="rounded-lg border-2 border-gray-300 px-4 py-2 font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
