import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Building,
    Edit,
    Info,
    Link as LinkIcon,
    Minus,
    Package,
    Phone,
    Plus,
    TrendingDown,
    TrendingUp,
    User,
    Zap,
} from 'lucide-react';
import React, { useState } from 'react';

interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    description: string;
    current_stock: number | string; // Allow both number and string
    minimum_stock: number | string; // Allow both number and string
    maximum_stock: number | string; // Allow both number and string
    unit_of_measure: string;
    unit_cost: number | string; // Allow both number and string
    selling_price: number | string; // Allow both number and string
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
    linked_menu_items?: {
        id: number;
        name: string;
        quantity_used: number;
        unit: string;
    }[];
}

interface StockMovement {
    id: number;
    movement_type: string;
    quantity: number | string;
    unit_cost: number | string;
    total_cost: number | string;
    previous_stock: number | string;
    new_stock: number | string;
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

    // Helper function to safely convert to number
    const toNumber = (value: number | string | null | undefined): number => {
        return Number(value) || 0;
    };

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
        unit_cost: toNumber(inventoryItem.unit_cost).toString(),
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

    const formatCurrency = (amount: number | string | null | undefined) => {
        const numericAmount = toNumber(amount);
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
        const currentStock = toNumber(inventoryItem.current_stock);
        const minimumStock = toNumber(inventoryItem.minimum_stock);

        if (currentStock <= 0) {
            return {
                status: 'Out of Stock',
                color: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200',
                icon: AlertTriangle,
            };
        } else if (currentStock <= minimumStock) {
            return {
                status: 'Low Stock',
                color: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200',
                icon: AlertTriangle,
            };
        } else {
            return {
                status: 'In Stock',
                color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200',
                icon: Package,
            };
        }
    };

    const getStockPercentage = () => {
        const currentStock = toNumber(inventoryItem.current_stock);
        const maximumStock = toNumber(inventoryItem.maximum_stock);

        if (!maximumStock || maximumStock <= 0) return 50;
        return Math.min((currentStock / maximumStock) * 100, 100);
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
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'out':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
            automatic_deduction: 'Automatic Deduction',
            other: 'Other',
        };
        return labels[reason] || reason;
    };

    const stockStatus = getStockStatus();
    const stockPercentage = getStockPercentage();
    const StockIcon = stockStatus.icon;
    const hasAutoDeduction =
        inventoryItem.linked_menu_items &&
        inventoryItem.linked_menu_items.length > 0;

    // Get numeric values for calculations
    const currentStockNum = toNumber(inventoryItem.current_stock);
    const minimumStockNum = toNumber(inventoryItem.minimum_stock);
    const unitCostNum = toNumber(inventoryItem.unit_cost);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${inventoryItem.name} - Inventory`} />

            <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/20">
                            <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-3xl font-bold text-black dark:text-white">
                                    {inventoryItem.name}
                                </h1>
                                {hasAutoDeduction && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        <Zap className="mr-1 h-4 w-4" />
                                        AUTO-DEDUCT
                                    </span>
                                )}
                            </div>
                            <p className="font-medium text-gray-600 dark:text-gray-400">
                                SKU: {inventoryItem.sku} •{' '}
                                {inventoryItem.category.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowAddStockModal(true)}
                            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Stock</span>
                        </button>
                        <button
                            onClick={() => setShowUseStockModal(true)}
                            className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            <Minus className="h-4 w-4" />
                            <span>Use Stock</span>
                        </button>
                        <Link
                            href={`/inventory/${inventoryItem.id}/edit`}
                            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            <Edit className="h-4 w-4" />
                            <span>Edit Item</span>
                        </Link>
                    </div>
                </div>

                {/* Auto-Deduction Status Banner */}
                {hasAutoDeduction && (
                    <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-700 dark:bg-blue-900/20">
                        <div className="flex items-start space-x-3">
                            <Zap className="mt-0.5 h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <div className="flex-1">
                                <h3 className="font-bold text-blue-900 dark:text-blue-200">
                                    🔥 Automatic Inventory Deduction Active
                                </h3>
                                <p className="mb-2 text-sm text-blue-700 dark:text-blue-300">
                                    This item is automatically deducted when the
                                    following menu items are sold in POS orders:
                                </p>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {inventoryItem.linked_menu_items?.map(
                                        (menuItem) => (
                                            <div
                                                key={menuItem.id}
                                                className="rounded-lg bg-blue-100 px-3 py-2 dark:bg-blue-800/30"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-blue-900 dark:text-blue-200">
                                                        {menuItem.name}
                                                    </span>
                                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        -
                                                        {menuItem.quantity_used}{' '}
                                                        {menuItem.unit}
                                                    </span>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Stock Overview */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                Stock Overview
                            </h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-black dark:text-white">
                                        {currentStockNum.toFixed(2)}
                                    </div>
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Current Stock (
                                        {inventoryItem.unit_of_measure})
                                    </div>
                                    <div className="mt-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${stockStatus.color}`}
                                        >
                                            <StockIcon className="mr-1 h-3 w-3" />
                                            {stockStatus.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {minimumStockNum.toFixed(2)}
                                    </div>
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Minimum Stock (
                                        {inventoryItem.unit_of_measure})
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {formatCurrency(
                                            currentStockNum * unitCostNum,
                                        )}
                                    </div>
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Stock Value
                                    </div>
                                </div>
                            </div>

                            {/* Stock Level Bar */}
                            <div className="mt-4">
                                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <span>Stock Level</span>
                                    <span>{Math.round(stockPercentage)}%</span>
                                </div>
                                <div className="mt-1 h-3 rounded-full bg-gray-200 dark:bg-gray-600">
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

                        {/* Stock Movements Table */}
                        <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b-2 border-gray-200 bg-black p-4 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-white">
                                    Recent Stock Movements
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Quantity
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Reason
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                User
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {stockMovements.data.length > 0 ? (
                                            stockMovements.data.map(
                                                (movement) => (
                                                    <tr
                                                        key={movement.id}
                                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-black dark:text-white">
                                                            {formatDate(
                                                                movement.movement_date,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${getMovementTypeBadge(movement.movement_type)}`}
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
                                                                        ? 'font-bold text-green-600 dark:text-green-400'
                                                                        : 'font-bold text-red-600 dark:text-red-400'
                                                                }
                                                            >
                                                                {movement.movement_type ===
                                                                'in'
                                                                    ? '+'
                                                                    : '-'}
                                                                {toNumber(
                                                                    movement.quantity,
                                                                ).toFixed(
                                                                    2,
                                                                )}{' '}
                                                                {
                                                                    inventoryItem.unit_of_measure
                                                                }
                                                            </span>
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                {toNumber(
                                                                    movement.previous_stock,
                                                                ).toFixed(
                                                                    2,
                                                                )}{' '}
                                                                →{' '}
                                                                {toNumber(
                                                                    movement.new_stock,
                                                                ).toFixed(2)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-black dark:text-white">
                                                            <div className="font-medium">
                                                                {getReasonLabel(
                                                                    movement.reason,
                                                                )}
                                                                {movement.reason ===
                                                                    'automatic_deduction' && (
                                                                    <Zap className="ml-1 inline h-3 w-3 text-blue-600" />
                                                                )}
                                                            </div>
                                                            {movement.notes && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {
                                                                        movement.notes
                                                                    }
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
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
                                                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
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
                        {/* Automatic Deduction Info */}
                        {hasAutoDeduction ? (
                            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-700 dark:bg-blue-900/20">
                                <h3 className="flex items-center font-bold text-blue-900 dark:text-blue-200">
                                    <Zap className="mr-2 h-5 w-5" />
                                    Linked Menu Items
                                </h3>
                                <p className="mb-3 text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Auto-deducts when these items are sold:
                                </p>
                                <div className="space-y-2">
                                    {inventoryItem.linked_menu_items?.map(
                                        (menuItem) => (
                                            <div
                                                key={menuItem.id}
                                                className="rounded-lg bg-blue-100 px-3 py-2 dark:bg-blue-800/30"
                                            >
                                                <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                                    {menuItem.name}
                                                </div>
                                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                    Uses:{' '}
                                                    {menuItem.quantity_used}{' '}
                                                    {menuItem.unit}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="flex items-center font-bold text-gray-900 dark:text-white">
                                    <Info className="mr-2 h-5 w-5" />
                                    Manual Tracking
                                </h3>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    This item has manual stock tracking only. No
                                    automatic deduction is configured.
                                </p>
                            </div>
                        )}

                        {/* Item Details */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                Item Details
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Category
                                    </span>
                                    <span
                                        className="rounded-full px-2 py-1 text-xs font-bold"
                                        style={{
                                            backgroundColor: `${inventoryItem.category.color}20`,
                                            color: inventoryItem.category.color,
                                        }}
                                    >
                                        {inventoryItem.category.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Unit Cost
                                    </span>
                                    <span className="font-bold text-black dark:text-white">
                                        {formatCurrency(
                                            inventoryItem.unit_cost,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Unit of Measure
                                    </span>
                                    <span className="font-bold text-black dark:text-white">
                                        {inventoryItem.unit_of_measure}
                                    </span>
                                </div>
                                {inventoryItem.description && (
                                    <div className="border-t pt-3 dark:border-gray-600">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {inventoryItem.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Supplier */}
                        {inventoryItem.supplier && (
                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 flex items-center text-lg font-bold text-black dark:text-white">
                                    <Building className="mr-2 h-5 w-5" />
                                    Supplier
                                </h2>
                                <div className="space-y-2">
                                    <p className="font-bold text-black dark:text-white">
                                        {inventoryItem.supplier.name}
                                    </p>
                                    {inventoryItem.supplier.contact_person && (
                                        <p className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <User className="mr-2 h-4 w-4" />
                                            {
                                                inventoryItem.supplier
                                                    .contact_person
                                            }
                                        </p>
                                    )}
                                    {inventoryItem.supplier.phone && (
                                        <p className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <Phone className="mr-2 h-4 w-4" />
                                            {inventoryItem.supplier.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Audit Information */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                Audit Information
                            </h2>
                            <div className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
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
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-bold text-green-700 dark:text-green-400">
                            <Plus className="mr-2 h-5 w-5" />
                            Add Stock
                        </h3>
                        <p className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Record new stock received from supplier or purchase.
                        </p>
                        <form onSubmit={handleAddStock} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
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
                                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder="0.00"
                                    required
                                />
                                {addStockErrors.quantity && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {addStockErrors.quantity}
                                    </p>
                                )}
                                {addStockData.quantity && (
                                    <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        New total:{' '}
                                        {(
                                            currentStockNum +
                                            Number(addStockData.quantity || 0)
                                        ).toFixed(2)}{' '}
                                        {inventoryItem.unit_of_measure}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
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
                                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={addStockData.notes}
                                    onChange={(e) =>
                                        setAddStockData('notes', e.target.value)
                                    }
                                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    rows={2}
                                    placeholder="e.g., Invoice #123, Delivery from supplier"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={addingStock}
                                    className="flex-1 rounded-lg bg-green-600 py-2 font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
                                >
                                    {addingStock ? 'Adding...' : 'Add Stock'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddStockModal(false);
                                        resetAddStock();
                                    }}
                                    className="flex-1 rounded-lg border-2 border-gray-300 py-2 font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-bold text-red-700 dark:text-red-400">
                            <Minus className="mr-2 h-5 w-5" />
                            Use Stock
                        </h3>
                        <p className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Record stock used for cooking, daily operations, or
                            other consumption.
                        </p>
                        <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                    Available Stock:
                                </span>
                                <span className="font-bold text-black dark:text-white">
                                    {currentStockNum.toFixed(2)}{' '}
                                    {inventoryItem.unit_of_measure}
                                </span>
                            </div>
                        </div>
                        <form onSubmit={handleUseStock} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Quantity to Use (
                                    {inventoryItem.unit_of_measure})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={currentStockNum}
                                    value={useStockData.quantity}
                                    onChange={(e) =>
                                        setUseStockData(
                                            'quantity',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder="0.00"
                                    required
                                />
                                {useStockErrors.quantity && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {useStockErrors.quantity}
                                    </p>
                                )}
                                {useStockData.quantity && (
                                    <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Remaining after use:{' '}
                                        {(
                                            currentStockNum -
                                            Number(useStockData.quantity || 0)
                                        ).toFixed(2)}{' '}
                                        {inventoryItem.unit_of_measure}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
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
                                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={useStockData.notes}
                                    onChange={(e) =>
                                        setUseStockData('notes', e.target.value)
                                    }
                                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    rows={2}
                                    placeholder="e.g., Used for lunch prep, Morning batch"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={
                                        usingStock ||
                                        Number(useStockData.quantity || 0) >
                                            currentStockNum
                                    }
                                    className="flex-1 rounded-lg bg-red-600 py-2 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    {usingStock ? 'Recording...' : 'Use Stock'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUseStockModal(false);
                                        resetUseStock();
                                    }}
                                    className="flex-1 rounded-lg border-2 border-gray-300 py-2 font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
