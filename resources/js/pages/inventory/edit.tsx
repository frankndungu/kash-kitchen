import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Save, X } from 'lucide-react';
import React from 'react';

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
    supplier: {
        id: number;
        name: string;
    } | null;
}

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

interface EditProps {
    user: {
        name: string;
        email: string;
    };
    inventoryItem: InventoryItem;
    categories: Category[];
    suppliers: Supplier[];
}

export default function Edit({
    user,
    inventoryItem,
    categories,
    suppliers,
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
        supplier_id: inventoryItem.supplier?.id?.toString() || '',
        minimum_stock: inventoryItem.minimum_stock.toString(),
        maximum_stock: inventoryItem.maximum_stock?.toString() || '',
        unit_of_measure: inventoryItem.unit_of_measure,
        unit_cost: inventoryItem.unit_cost.toString(),
        selling_price: inventoryItem.selling_price?.toString() || '',
        track_stock: inventoryItem.track_stock,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/inventory/${inventoryItem.id}`);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${inventoryItem.name} - Inventory`} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-3xl font-bold text-gray-900">
                            <Package className="mr-3 h-8 w-8 text-blue-600" />
                            Edit {inventoryItem.name}
                        </h1>
                        <p className="text-gray-600">
                            Update inventory item details and settings
                        </p>
                    </div>
                    <a
                        href={`/inventory/${inventoryItem.id}`}
                        className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
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
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Basic Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Item Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="e.g., Chicken Breast"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            SKU
                                        </label>
                                        <input
                                            type="text"
                                            value={data.sku}
                                            onChange={(e) =>
                                                setData('sku', e.target.value)
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            disabled
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            SKU cannot be changed after creation
                                        </p>
                                        {errors.sku && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.sku}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="Brief description of the item..."
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.category_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.supplier_id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stock Settings */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Stock Settings
                                </h2>
                                <div className="space-y-4">
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>Note:</strong> Current stock
                                            level ({inventoryItem.current_stock}{' '}
                                            {inventoryItem.unit_of_measure})
                                            cannot be changed here. Use "Add
                                            Stock" or "Adjust Stock" on the item
                                            view page.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                                placeholder="0.00"
                                                required
                                            />
                                            {errors.minimum_stock && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.minimum_stock}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                Alert threshold for low stock
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                                placeholder="Optional"
                                            />
                                            {errors.maximum_stock && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.maximum_stock}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
                                                <p className="mt-1 text-sm text-red-600">
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
                                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                Track stock levels for this item
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Cost Information */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Cost Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors.unit_cost && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.unit_cost}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Cost per unit of measure
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="Optional"
                                        />
                                        {errors.selling_price && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.selling_price}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
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
                                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </span>
                                </button>

                                <a
                                    href={`/inventory/${inventoryItem.id}`}
                                    className="flex items-center space-x-2 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </a>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Current Item Info */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <h3 className="font-semibold text-gray-900">
                                Current Item Status
                            </h3>
                            <div className="mt-2 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Current Stock:
                                    </span>
                                    <span className="font-medium">
                                        {inventoryItem.current_stock}{' '}
                                        {inventoryItem.unit_of_measure}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Stock Value:
                                    </span>
                                    <span className="font-medium">
                                        KSh{' '}
                                        {(
                                            inventoryItem.current_stock *
                                            inventoryItem.unit_cost
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Current Category:
                                    </span>
                                    <span
                                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
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
                            </div>
                        </div>

                        {/* Edit Notes */}
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <h3 className="font-semibold text-yellow-900">
                                Edit Guidelines
                            </h3>
                            <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                                <li>• SKU cannot be changed after creation</li>
                                <li>• Current stock is managed separately</li>
                                <li>
                                    • Cost changes affect future calculations
                                </li>
                                <li>• Category changes may affect reports</li>
                            </ul>
                        </div>

                        {/* Categories Available */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <h3 className="font-semibold text-gray-900">
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
                                        {category.name}
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
