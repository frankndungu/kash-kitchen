import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Info, Package, Plus, Save, X, Zap } from 'lucide-react';
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

interface CreateProps {
    user: {
        name: string;
        email: string;
    };
    categories: Category[];
    newCategory?: {
        id: number;
        name: string;
        color: string;
    };
}

export default function Create({ user, categories, newCategory }: CreateProps) {
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

    // Handle new category from backend
    useEffect(() => {
        if (newCategory) {
            setCategoriesList([...categoriesList, newCategory]);
            setData('category_id', newCategory.id.toString());
            setShowCategoryModal(false);
            resetCategory();
        }
    }, [newCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
        if (name.includes('oil') || name.includes('cooking oil')) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for fried items: All chicken, chips, wings, bhajia, and fried foods',
                estimatedLinks: '25+ menu items',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (
            name.includes('spice') ||
            name.includes('salt') ||
            name.includes('pepper')
        ) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for seasoned dishes: Chicken, wings, masala chips, eggs, and seasoned foods',
                estimatedLinks: '10+ menu items',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (
            name.includes('beef') ||
            name.includes('minced') ||
            name.includes('meat')
        ) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for meat dishes: Burgers, samosas, and meat-based items',
                estimatedLinks: '5+ menu items',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (name.includes('egg')) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for egg dishes: Boiled Eggs, Fried Eggs, Special Eggs',
                estimatedLinks: '3 menu items',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (
            name.includes('milk') ||
            name.includes('soda') ||
            name.includes('tea') ||
            name.includes('coffee')
        ) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for beverages: Tea, coffee, smoothies, milkshakes, or sodas as applicable',
                estimatedLinks: '3-5 menu items',
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
                                            placeholder="e.g., Chicken Breast, Potatoes, Cooking Oil"
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
                                                        When menu items using
                                                        this ingredient are sold
                                                        in POS, inventory will
                                                        automatically decrease
                                                        with precise quantities
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                        {processing ? 'Saving...' : 'Save Item'}
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
                        {/* Auto-Deduction Info */}
                        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-700 dark:bg-blue-900/20">
                            <h3 className="flex items-center font-bold text-blue-900 dark:text-blue-200">
                                <Zap className="mr-2 h-5 w-5" />
                                Automatic Deduction
                            </h3>
                            <div className="mt-2 space-y-2 text-sm text-blue-800 dark:text-blue-300">
                                <p className="font-medium">
                                    System automatically detects ingredients:
                                </p>
                                <div className="space-y-1 text-xs">
                                    <div>
                                        <strong>Chicken</strong> - Auto-deducts
                                        for chicken dishes
                                    </div>
                                    <div>
                                        <strong>Potatoes</strong> - Auto-deducts
                                        for chips and bhajia
                                    </div>
                                    <div>
                                        <strong>Wings</strong> - Auto-deducts
                                        for wing dishes
                                    </div>
                                    <div>
                                        <strong>Cooking Oil</strong> -
                                        Auto-deducts for fried items
                                    </div>
                                    <div>
                                        <strong>Spices & Seasonings</strong> -
                                        Auto-deducts for seasoned dishes
                                    </div>
                                </div>
                                <p className="mt-3 text-xs font-medium opacity-75">
                                    Categories can be created on-the-fly using
                                    the + button
                                </p>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                Quick Tips
                            </h3>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <li>
                                    • Use descriptive names for easy searching
                                </li>
                                <li>• Set minimum stock to avoid shortages</li>
                                <li>• Choose the correct unit of measure</li>
                                <li>
                                    • SKU will be auto-generated if left empty
                                </li>
                                <li>• Click + to create new categories</li>
                                <li>
                                    • Auto-deduction works regardless of
                                    category
                                </li>
                            </ul>
                        </div>

                        {/* Categories Available */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                Categories Available
                            </h3>
                            <div className="mt-2 space-y-1">
                                {categoriesList.map((category) => (
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
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {category.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Creation Modal */}
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
