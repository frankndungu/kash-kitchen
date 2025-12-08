import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Info, Package, Save, X, Zap } from 'lucide-react';
import React from 'react';

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

interface Supplier {
    id: number;
    name: string;
    contact_person: string;
}

interface CreateProps {
    user: {
        name: string;
        email: string;
    };
    categories: Category[];
    suppliers: Supplier[];
}

export default function Create({ user, categories, suppliers }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        description: '',
        category_id: '',
        supplier_id: '',
        current_stock: '',
        minimum_stock: '',
        maximum_stock: '',
        unit_of_measure: 'kg',
        unit_cost: '',
        selling_price: '',
        track_stock: true,
        storage_requirements: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory');
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
    ];

    // Check if the item name matches auto-deduction items
    const getAutoDeductionInfo = (itemName: string) => {
        const name = itemName.toLowerCase();
        if (name.includes('chicken')) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for chicken dishes (1/4 Chicken, 1/2 Chicken, combos)',
                icon: '🍗',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (name.includes('potato')) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for chips and potato dishes (Chips, Garlic Chips, combos)',
                icon: '🥔',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (name.includes('wing')) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for wing dishes (2PCS Wings, 4PCS Wings, Lolipops)',
                icon: '🍗',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        if (
            name.includes('minced') ||
            name.includes('mince') ||
            name.includes('meat')
        ) {
            return {
                willAutoDeduct: true,
                description:
                    'Will auto-deduct for meat dishes (Samosas, Special Samosas)',
                icon: '🥩',
                color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            };
        }
        return {
            willAutoDeduct: false,
            description:
                'Manual stock tracking only - no automatic deduction configured',
            icon: '📝',
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

                                    <div>
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

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Supplier
                                        </label>
                                        <select
                                            value={data.supplier_id}
                                            onChange={(e) =>
                                                setData(
                                                    'supplier_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">
                                                Select Supplier
                                            </option>
                                            {suppliers.map((supplier) => (
                                                <option
                                                    key={supplier.id}
                                                    value={supplier.id}
                                                >
                                                    {supplier.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.supplier_id && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.supplier_id}
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
                                                    ? '🔥 Automatic Deduction Enabled'
                                                    : '📝 Manual Tracking Only'}
                                            </h3>
                                            <p className="text-sm font-medium">
                                                {autoDeductInfo.description}
                                            </p>
                                            {autoDeductInfo.willAutoDeduct && (
                                                <div className="mt-2 text-xs font-medium opacity-75">
                                                    ✨ When menu items using
                                                    this ingredient are sold in
                                                    POS, inventory will
                                                    automatically decrease!
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-2xl">
                                            {autoDeductInfo.icon}
                                        </span>
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
                                    Currently configured for:
                                </p>
                                <div className="space-y-1 text-xs">
                                    <div>
                                        🍗 <strong>Chicken</strong> -
                                        Auto-deducts for chicken dishes
                                    </div>
                                    <div>
                                        🥔 <strong>Potatoes</strong> -
                                        Auto-deducts for chips
                                    </div>
                                    <div>
                                        🍗 <strong>Wings</strong> - Auto-deducts
                                        for wing dishes
                                    </div>
                                    <div>
                                        🥩 <strong>Minced Meat</strong> -
                                        Auto-deducts for samosas
                                    </div>
                                </div>
                                <p className="mt-3 text-xs font-medium opacity-75">
                                    When POS orders are created, these items
                                    automatically decrease based on menu item
                                    sales!
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
                                <li>
                                    • Items with matching names get
                                    auto-deduction
                                </li>
                            </ul>
                        </div>

                        {/* Categories Available */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="font-bold text-gray-900 dark:text-white">
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
                                        <span className="font-medium text-gray-900 dark:text-white">
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
