import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Building,
    Calendar,
    Edit,
    Minus,
    Package,
    Phone,
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
    const [showUseStockModal, setShowUseStockModal] = useState(false);

    // Add Stock Form
    const {
        data: addStockData,
        setData: setAddStockData,
        post: postAddStock,
        processing: addingStock,
        errors: addStockErrors,
        reset: resetAddStock,
    } = useForm({
        quantity: '',
        unit_cost: inventoryItem.unit_cost.toString(),
        supplier_id: inventoryItem.supplier?.id?.toString() || '',
        notes: '',
    });

    // Use Stock Form
    const {
        data: useStockData,
        setData: setUseStockData,
        post: postUseStock,
        processing: usingStock,
        errors: useStockErrors,
        reset: resetUseStock,
    } = useForm({
        quantity: '',
        reason: 'daily_usage',
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
                resetAddStock();
            },
        });
    };

    const handleUseStock = (e: React.FormEvent) => {
        e.preventDefault();
        postUseStock(`/inventory/${inventoryItem.id}/use-stock`, {
            onSuccess: () => {
                setShowUseStockModal(false);
                resetUseStock();
            },
        });
    };

    const getMovementTypeBadge = (type: string) => {
        switch (type) {
            case 'in':
                return 'bg-green-100 text-green-800';
            case 'out':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getMovementTypeLabel = (type: string) => {
        switch (type) {
            case 'in':
                return 'Stock In';
            case 'out':
                return 'Stock Out';
            default:
                return type;
        }
    };

    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            purchase: 'Purchase',
            initial_stock: 'Initial Stock',
            daily_usage: 'Daily Usage',
            cooking: 'Cooking/Preparation',
            waste: 'Waste/Spoilage',
            sale: 'Sale',
            transfer: 'Transfer',
            damaged: 'Damaged',
            expired: 'Expired',
            other: 'Other',
        };
        return labels[reason] || reason;
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
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowAddStockModal(true)}
                            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Stock</span>
                        </button>
                        <button
                            onClick={() => setShowUseStockModal(true)}
                            className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            <Minus className="h-4 w-4" />
                            <span>Use Stock</span>
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
                                        {Number(
                                            inventoryItem.current_stock,
                                        ).toFixed(2)}
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
                                        {Number(
                                            inventoryItem.minimum_stock,
                                        ).toFixed(2)}
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
                                            {Number(
                                                movementStats.total_stock_in,
                                            ).toFixed(2)}
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
                                            {Number(
                                                movementStats.total_stock_out,
                                            ).toFixed(2)}
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

                        {/* Stock Movements Table */}
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
                                        {stockMovements.data.length > 0 ? (
                                            stockMovements.data.map(
                                                (movement) => (
                                                    <tr
                                                        key={movement.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900">
                                                            {formatDate(
                                                                movement.movement_date,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getMovementTypeBadge(movement.movement_type)}`}
                                                            >
                                                                {movement.movement_type ===
                                                                    'in' && (
                                                                    <TrendingUp className="mr-1 h-3 w-3" />
                                                                )}
                                                                {movement.movement_type ===
                                                                    'out' && (
                                                                    <TrendingDown className="mr-1 h-3 w-3" />
                                                                )}
                                                                {getMovementTypeLabel(
                                                                    movement.movement_type,
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                            <span
                                                                className={
                                                                    movement.movement_type ===
                                                                    'in'
                                                                        ? 'font-medium text-green-600'
                                                                        : 'font-medium text-red-600'
                                                                }
                                                            >
                                                                {movement.movement_type ===
                                                                'in'
                                                                    ? '+'
                                                                    : '-'}
                                                                {Number(
                                                                    movement.quantity,
                                                                ).toFixed(
                                                                    2,
                                                                )}{' '}
                                                                {
                                                                    inventoryItem.unit_of_measure
                                                                }
                                                            </span>
                                                            <div className="text-xs text-gray-500">
                                                                {Number(
                                                                    movement.previous_stock,
                                                                ).toFixed(
                                                                    2,
                                                                )}{' '}
                                                                →{' '}
                                                                {Number(
                                                                    movement.new_stock,
                                                                ).toFixed(2)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            <div>
                                                                {getReasonLabel(
                                                                    movement.reason,
                                                                )}
                                                            </div>
                                                            {movement.notes && (
                                                                <div className="text-xs text-gray-500">
                                                                    {
                                                                        movement.notes
                                                                    }
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500">
                                                            {movement.creator
                                                                ?.name ||
                                                                'System'}
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-8 text-center text-gray-500"
                                                >
                                                    No stock movements recorded
                                                    yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Item Details */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Item Details
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Category
                                    </span>
                                    <span
                                        className="rounded-full px-2 py-1 text-xs font-medium"
                                        style={{
                                            backgroundColor: `${inventoryItem.category.color}20`,
                                            color: inventoryItem.category.color,
                                        }}
                                    >
                                        {inventoryItem.category.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Unit Cost
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            inventoryItem.unit_cost,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Unit of Measure
                                    </span>
                                    <span className="font-medium">
                                        {inventoryItem.unit_of_measure}
                                    </span>
                                </div>
                                {inventoryItem.description && (
                                    <div className="border-t pt-3">
                                        <p className="text-sm text-gray-600">
                                            {inventoryItem.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Supplier */}
                        {inventoryItem.supplier && (
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 flex items-center text-lg font-semibold">
                                    <Building className="mr-2 h-5 w-5" />
                                    Supplier
                                </h2>
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-900">
                                        {inventoryItem.supplier.name}
                                    </p>
                                    {inventoryItem.supplier.contact_person && (
                                        <p className="flex items-center text-sm text-gray-600">
                                            <User className="mr-2 h-4 w-4" />
                                            {
                                                inventoryItem.supplier
                                                    .contact_person
                                            }
                                        </p>
                                    )}
                                    {inventoryItem.supplier.phone && (
                                        <p className="flex items-center text-sm text-gray-600">
                                            <Phone className="mr-2 h-4 w-4" />
                                            {inventoryItem.supplier.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Audit Information */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Audit Information
                            </h2>
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
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-green-700">
                            <Plus className="mr-2 h-5 w-5" />
                            Add Stock
                        </h3>
                        <p className="mb-4 text-sm text-gray-600">
                            Record new stock received from supplier or purchase.
                        </p>
                        <form onSubmit={handleAddStock} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Quantity to Add (
                                    {inventoryItem.unit_of_measure})
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
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                                    placeholder="0.00"
                                    required
                                />
                                {addStockErrors.quantity && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {addStockErrors.quantity}
                                    </p>
                                )}
                                {addStockData.quantity && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        New total:{' '}
                                        {(
                                            inventoryItem.current_stock +
                                            Number(addStockData.quantity)
                                        ).toFixed(2)}{' '}
                                        {inventoryItem.unit_of_measure}
                                    </p>
                                )}
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
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={addStockData.notes}
                                    onChange={(e) =>
                                        setAddStockData('notes', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                                    rows={2}
                                    placeholder="e.g., Invoice #123, Delivery from supplier"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={addingStock}
                                    className="flex-1 rounded-lg bg-green-600 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {addingStock ? 'Adding...' : 'Add Stock'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddStockModal(false);
                                        resetAddStock();
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Use Stock Modal */}
            {showUseStockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-red-700">
                            <Minus className="mr-2 h-5 w-5" />
                            Use Stock
                        </h3>
                        <p className="mb-4 text-sm text-gray-600">
                            Record stock used for cooking, daily operations, or
                            other consumption.
                        </p>
                        <div className="mb-4 rounded-lg bg-gray-50 p-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Available Stock:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {Number(
                                        inventoryItem.current_stock,
                                    ).toFixed(2)}{' '}
                                    {inventoryItem.unit_of_measure}
                                </span>
                            </div>
                        </div>
                        <form onSubmit={handleUseStock} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Quantity to Use (
                                    {inventoryItem.unit_of_measure})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={inventoryItem.current_stock}
                                    value={useStockData.quantity}
                                    onChange={(e) =>
                                        setUseStockData(
                                            'quantity',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                                    placeholder="0.00"
                                    required
                                />
                                {useStockErrors.quantity && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {useStockErrors.quantity}
                                    </p>
                                )}
                                {useStockData.quantity && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Remaining after use:{' '}
                                        {(
                                            inventoryItem.current_stock -
                                            Number(useStockData.quantity)
                                        ).toFixed(2)}{' '}
                                        {inventoryItem.unit_of_measure}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Reason
                                </label>
                                <select
                                    value={useStockData.reason}
                                    onChange={(e) =>
                                        setUseStockData(
                                            'reason',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                                >
                                    <option value="daily_usage">
                                        Daily Usage
                                    </option>
                                    <option value="cooking">
                                        Cooking/Preparation
                                    </option>
                                    <option value="waste">
                                        Waste/Spoilage
                                    </option>
                                    <option value="damaged">Damaged</option>
                                    <option value="expired">Expired</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={useStockData.notes}
                                    onChange={(e) =>
                                        setUseStockData('notes', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                                    rows={2}
                                    placeholder="e.g., Used for lunch prep, Morning batch"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={
                                        usingStock ||
                                        Number(useStockData.quantity) >
                                            inventoryItem.current_stock
                                    }
                                    className="flex-1 rounded-lg bg-red-600 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {usingStock ? 'Recording...' : 'Use Stock'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUseStockModal(false);
                                        resetUseStock();
                                    }}
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
