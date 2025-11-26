import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Building,
    Calendar,
    Edit,
    Package,
    Plus,
    TrendingDown,
    TrendingUp,
    User,
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
    is_active: boolean;
    track_stock: boolean;
    last_restocked: string;
    created_at: string;
    updated_at: string;
    category: {
        id: number;
        name: string;
        color: string;
    };
    supplier: {
        id: number;
        name: string;
        contact_person: string;
        phone: string;
    } | null;
    creator: {
        name: string;
    };
}

interface StockMovement {
    id: number;
    movement_type: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    previous_stock: number;
    new_stock: number;
    reason: string;
    notes: string;
    movement_date: string;
    creator: {
        name: string;
    };
    supplier: {
        name: string;
    } | null;
}

interface ShowProps {
    user: {
        name: string;
        email: string;
    };
    inventoryItem: InventoryItem;
    stockMovements: {
        data: StockMovement[];
        current_page: number;
        last_page: number;
    };
    movementStats: {
        total_movements: number;
        total_stock_in: number;
        total_stock_out: number;
        this_month_movements: number;
    };
}

export default function Show({
    user,
    inventoryItem,
    stockMovements,
    movementStats,
}: ShowProps) {
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);

    const {
        data: addStockData,
        setData: setAddStockData,
        post: postAddStock,
        processing: addingStock,
    } = useForm({
        quantity: '',
        unit_cost: inventoryItem.unit_cost.toString(),
        supplier_id: inventoryItem.supplier?.id?.toString() || '',
        notes: '',
    });

    const {
        data: adjustData,
        setData: setAdjustData,
        post: postAdjust,
        processing: adjusting,
    } = useForm({
        new_quantity: inventoryItem.current_stock.toString(),
        reason: 'manual_adjustment',
        notes: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inventory Management',
            href: '/inventory',
        },
        {
            title: inventoryItem.name,
            href: '#',
        },
    ];

    const formatCurrency = (amount: number | null | undefined) => {
        const numericAmount = Number(amount) || 0;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStockStatus = () => {
        if (inventoryItem.current_stock <= 0) {
            return {
                status: 'Out of Stock',
                color: 'text-red-600 bg-red-100',
                icon: AlertTriangle,
            };
        } else if (inventoryItem.current_stock <= inventoryItem.minimum_stock) {
            return {
                status: 'Low Stock',
                color: 'text-orange-600 bg-orange-100',
                icon: AlertTriangle,
            };
        } else {
            return {
                status: 'In Stock',
                color: 'text-green-600 bg-green-100',
                icon: Package,
            };
        }
    };

    const getStockPercentage = () => {
        if (!inventoryItem.maximum_stock || inventoryItem.maximum_stock <= 0)
            return 50;
        return Math.min(
            (inventoryItem.current_stock / inventoryItem.maximum_stock) * 100,
            100,
        );
    };

    const handleAddStock = (e: React.FormEvent) => {
        e.preventDefault();
        postAddStock(`/inventory/${inventoryItem.id}/add-stock`, {
            onSuccess: () => {
                setShowAddStockModal(false);
                setAddStockData('quantity', '');
                setAddStockData('notes', '');
            },
        });
    };

    const handleAdjustStock = (e: React.FormEvent) => {
        e.preventDefault();
        postAdjust(`/inventory/${inventoryItem.id}/adjust-stock`, {
            onSuccess: () => {
                setShowAdjustModal(false);
            },
        });
    };

    const stockStatus = getStockStatus();
    const stockPercentage = getStockPercentage();
    const StockIcon = stockStatus.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${inventoryItem.name} - Inventory`} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="rounded-lg bg-blue-100 p-3">
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {inventoryItem.name}
                            </h1>
                            <p className="text-gray-600">
                                SKU: {inventoryItem.sku} •{' '}
                                {inventoryItem.category.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowAddStockModal(true)}
                            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Stock</span>
                        </button>
                        <button
                            onClick={() => setShowAdjustModal(true)}
                            className="flex items-center space-x-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span>Adjust Stock</span>
                        </button>
                        <Link
                            href={`/inventory/${inventoryItem.id}/edit`}
                            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <Edit className="h-4 w-4" />
                            <span>Edit Item</span>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Stock Overview */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Stock Overview
                            </h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {inventoryItem.current_stock}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Current Stock (
                                        {inventoryItem.unit_of_measure})
                                    </div>
                                    <div className="mt-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${stockStatus.color}`}
                                        >
                                            <StockIcon className="mr-1 h-3 w-3" />
                                            {stockStatus.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {inventoryItem.minimum_stock}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Minimum Stock (
                                        {inventoryItem.unit_of_measure})
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatCurrency(
                                            inventoryItem.current_stock *
                                                inventoryItem.unit_cost,
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Stock Value
                                    </div>
                                </div>
                            </div>

                            {/* Stock Level Bar */}
                            <div className="mt-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Stock Level</span>
                                    <span>{Math.round(stockPercentage)}%</span>
                                </div>
                                <div className="mt-1 h-3 rounded-full bg-gray-200">
                                    <div
                                        className={`h-3 rounded-full ${
                                            stockPercentage > 50
                                                ? 'bg-green-500'
                                                : stockPercentage > 20
                                                  ? 'bg-yellow-500'
                                                  : 'bg-red-500'
                                        }`}
                                        style={{
                                            width: `${Math.max(stockPercentage, 5)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Movement Stats */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Total Movements
                                        </p>
                                        <p className="text-xl font-bold">
                                            {movementStats.total_movements}
                                        </p>
                                    </div>
                                    <BarChart3 className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Stock In
                                        </p>
                                        <p className="text-xl font-bold text-green-600">
                                            {movementStats.total_stock_in}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Stock Out
                                        </p>
                                        <p className="text-xl font-bold text-red-600">
                                            {movementStats.total_stock_out}
                                        </p>
                                    </div>
                                    <TrendingDown className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            This Month
                                        </p>
                                        <p className="text-xl font-bold">
                                            {movementStats.this_month_movements}
                                        </p>
                                    </div>
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Stock Movements */}
                        <div className="rounded-lg border border-gray-200 bg-white">
                            <div className="border-b p-4">
                                <h2 className="text-lg font-semibold">
                                    Recent Stock Movements
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Quantity
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Reason
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                User
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {stockMovements.data.map((movement) => (
                                            <tr
                                                key={movement.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-900">
                                                    {formatDate(
                                                        movement.movement_date,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                            movement.movement_type ===
                                                            'in'
                                                                ? 'bg-green-100 text-green-800'
                                                                : movement.movement_type ===
                                                                    'out'
                                                                  ? 'bg-red-100 text-red-800'
                                                                  : 'bg-blue-100 text-blue-800'
                                                        }`}
                                                    >
                                                        {movement.movement_type ===
                                                            'in' && (
                                                            <TrendingUp className="mr-1 h-3 w-3" />
                                                        )}
                                                        {movement.movement_type ===
                                                            'out' && (
                                                            <TrendingDown className="mr-1 h-3 w-3" />
                                                        )}
                                                        {movement.movement_type ===
                                                            'adjustment' && (
                                                            <BarChart3 className="mr-1 h-3 w-3" />
                                                        )}
                                                        {movement.movement_type
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            movement.movement_type.slice(
                                                                1,
                                                            )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-900">
                                                    {movement.movement_type ===
                                                    'out'
                                                        ? '-'
                                                        : '+'}
                                                    {movement.quantity}{' '}
                                                    {
                                                        inventoryItem.unit_of_measure
                                                    }
                                                </td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                                                    {movement.reason ||
                                                        'No reason provided'}
                                                </td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                                                    {movement.creator.name}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Item Details */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <h3 className="mb-4 font-semibold">Item Details</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-600">
                                        Category:
                                    </span>
                                    <span
                                        className="ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
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
                                <div>
                                    <span className="text-gray-600">
                                        Unit Cost:
                                    </span>
                                    <span className="ml-2 font-medium">
                                        {formatCurrency(
                                            inventoryItem.unit_cost,
                                        )}
                                    </span>
                                </div>
                                {inventoryItem.selling_price && (
                                    <div>
                                        <span className="text-gray-600">
                                            Selling Price:
                                        </span>
                                        <span className="ml-2 font-medium">
                                            {formatCurrency(
                                                inventoryItem.selling_price,
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-600">
                                        Unit of Measure:
                                    </span>
                                    <span className="ml-2 font-medium">
                                        {inventoryItem.unit_of_measure}
                                    </span>
                                </div>
                                {inventoryItem.description && (
                                    <div>
                                        <span className="text-gray-600">
                                            Description:
                                        </span>
                                        <p className="mt-1 text-gray-900">
                                            {inventoryItem.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Supplier Info */}
                        {inventoryItem.supplier && (
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <h3 className="mb-4 flex items-center font-semibold">
                                    <Building className="mr-2 h-4 w-4" />
                                    Supplier
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">
                                            {inventoryItem.supplier.name}
                                        </span>
                                    </div>
                                    {inventoryItem.supplier.contact_person && (
                                        <div className="flex items-center text-gray-600">
                                            <User className="mr-2 h-4 w-4" />
                                            {
                                                inventoryItem.supplier
                                                    .contact_person
                                            }
                                        </div>
                                    )}
                                    {inventoryItem.supplier.phone && (
                                        <div className="text-gray-600">
                                            📞 {inventoryItem.supplier.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Audit Info */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <h3 className="mb-4 font-semibold">
                                Audit Information
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div>
                                    Created:{' '}
                                    {formatDate(inventoryItem.created_at)}
                                </div>
                                <div>By: {inventoryItem.creator.name}</div>
                                <div>
                                    Updated:{' '}
                                    {formatDate(inventoryItem.updated_at)}
                                </div>
                                {inventoryItem.last_restocked && (
                                    <div>
                                        Last Restocked:{' '}
                                        {formatDate(
                                            inventoryItem.last_restocked,
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Stock Modal */}
            {showAddStockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                        <h3 className="mb-4 text-lg font-semibold">
                            Add Stock
                        </h3>
                        <form onSubmit={handleAddStock} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Quantity to Add
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={addStockData.quantity}
                                    onChange={(e) =>
                                        setAddStockData(
                                            'quantity',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Unit Cost (KES)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={addStockData.unit_cost}
                                    onChange={(e) =>
                                        setAddStockData(
                                            'unit_cost',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Notes
                                </label>
                                <textarea
                                    value={addStockData.notes}
                                    onChange={(e) =>
                                        setAddStockData('notes', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    rows={2}
                                    placeholder="Optional notes..."
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={addingStock}
                                    className="flex-1 rounded-lg bg-green-600 py-2 text-white hover:bg-green-700"
                                >
                                    {addingStock ? 'Adding...' : 'Add Stock'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddStockModal(false)}
                                    className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Adjust Stock Modal */}
            {showAdjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                        <h3 className="mb-4 text-lg font-semibold">
                            Adjust Stock
                        </h3>
                        <form
                            onSubmit={handleAdjustStock}
                            className="space-y-4"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    New Quantity
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={adjustData.new_quantity}
                                    onChange={(e) =>
                                        setAdjustData(
                                            'new_quantity',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Current: {inventoryItem.current_stock}{' '}
                                    {inventoryItem.unit_of_measure}
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Reason
                                </label>
                                <select
                                    value={adjustData.reason}
                                    onChange={(e) =>
                                        setAdjustData('reason', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="manual_adjustment">
                                        Manual Adjustment
                                    </option>
                                    <option value="count_correction">
                                        Count Correction
                                    </option>
                                    <option value="damage">Damage/Loss</option>
                                    <option value="expiry">
                                        Expired Items
                                    </option>
                                    <option value="theft">Theft</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Notes
                                </label>
                                <textarea
                                    value={adjustData.notes}
                                    onChange={(e) =>
                                        setAdjustData('notes', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    rows={2}
                                    placeholder="Reason for adjustment..."
                                    required
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={adjusting}
                                    className="flex-1 rounded-lg bg-orange-600 py-2 text-white hover:bg-orange-700"
                                >
                                    {adjusting
                                        ? 'Adjusting...'
                                        : 'Adjust Stock'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAdjustModal(false)}
                                    className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
