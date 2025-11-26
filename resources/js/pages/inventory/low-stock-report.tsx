import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Edit,
    Package,
    Phone,
    Plus,
    TrendingDown,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/inventory',
    },
    {
        title: 'Low Stock Report',
        href: '#',
    },
];

interface LowStockItem {
    id: number;
    name: string;
    sku: string;
    current_stock: number;
    minimum_stock: number;
    unit_of_measure: string;
    unit_cost: number;
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
}

interface LowStockReportProps {
    user: {
        name: string;
        email: string;
    };
    lowStockItems: LowStockItem[];
}

export default function LowStockReport({
    user,
    lowStockItems,
}: LowStockReportProps) {
    const formatCurrency = (amount: number | null | undefined) => {
        const numericAmount = Number(amount) || 0;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const getStockLevel = (item: LowStockItem) => {
        const percentage = (item.current_stock / item.minimum_stock) * 100;
        if (item.current_stock <= 0) {
            return {
                level: 'Out of Stock',
                color: 'text-red-600 bg-red-100',
                severity: 'critical',
            };
        } else if (percentage <= 25) {
            return {
                level: 'Critically Low',
                color: 'text-red-600 bg-red-100',
                severity: 'critical',
            };
        } else if (percentage <= 50) {
            return {
                level: 'Very Low',
                color: 'text-orange-600 bg-orange-100',
                severity: 'high',
            };
        } else {
            return {
                level: 'Low Stock',
                color: 'text-yellow-600 bg-yellow-100',
                severity: 'medium',
            };
        }
    };

    const groupedItems = lowStockItems.reduce(
        (acc, item) => {
            const stockLevel = getStockLevel(item);
            if (!acc[stockLevel.severity]) {
                acc[stockLevel.severity] = [];
            }
            acc[stockLevel.severity].push(item);
            return acc;
        },
        {} as Record<string, LowStockItem[]>,
    );

    const criticalItems = groupedItems.critical || [];
    const highItems = groupedItems.high || [];
    const mediumItems = groupedItems.medium || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Low Stock Report - Inventory" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-3xl font-bold text-gray-900">
                            <AlertTriangle className="mr-3 h-8 w-8 text-orange-600" />
                            Low Stock Report
                        </h1>
                        <p className="text-gray-600">
                            Critical inventory alerts requiring immediate
                            attention
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/inventory/create"
                            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Item</span>
                        </Link>
                        <Link
                            href="/inventory"
                            className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            <Package className="h-4 w-4" />
                            <span>Back to Inventory</span>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-800">
                                    Critical/Out of Stock
                                </p>
                                <p className="text-2xl font-bold text-red-900">
                                    {criticalItems.length}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-800">
                                    Very Low Stock
                                </p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {highItems.length}
                                </p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-800">
                                    Low Stock
                                </p>
                                <p className="text-2xl font-bold text-yellow-900">
                                    {mediumItems.length}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Items
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {lowStockItems.length}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-gray-600" />
                        </div>
                    </div>
                </div>

                {lowStockItems.length === 0 ? (
                    /* No Low Stock Items */
                    <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                        <Package className="mx-auto h-12 w-12 text-green-600" />
                        <h3 className="mt-4 text-lg font-semibold text-green-900">
                            All Stock Levels Good!
                        </h3>
                        <p className="mt-2 text-green-700">
                            No items are currently below minimum stock levels.
                        </p>
                        <Link
                            href="/inventory"
                            className="mt-4 inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            View All Inventory
                        </Link>
                    </div>
                ) : (
                    /* Low Stock Items Table */
                    <div className="space-y-6">
                        {criticalItems.length > 0 && (
                            <div className="rounded-lg border border-red-200 bg-red-50/30">
                                <div className="border-b border-red-200 bg-red-100 px-4 py-3">
                                    <h2 className="flex items-center text-lg font-semibold text-red-900">
                                        <AlertTriangle className="mr-2 h-5 w-5" />
                                        Critical - Immediate Action Required (
                                        {criticalItems.length})
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-red-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-red-800 uppercase">
                                                    Item
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-red-800 uppercase">
                                                    Current Stock
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-red-800 uppercase">
                                                    Minimum Stock
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-red-800 uppercase">
                                                    Supplier
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-red-800 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-red-200 bg-white">
                                            {criticalItems.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-red-50"
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                SKU: {item.sku}
                                                            </div>
                                                            <span
                                                                className="mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                                                                style={{
                                                                    backgroundColor:
                                                                        item
                                                                            .category
                                                                            .color +
                                                                        '20',
                                                                    color: item
                                                                        .category
                                                                        .color,
                                                                }}
                                                            >
                                                                {
                                                                    item
                                                                        .category
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-lg font-bold text-red-600">
                                                                {
                                                                    item.current_stock
                                                                }{' '}
                                                                {
                                                                    item.unit_of_measure
                                                                }
                                                            </span>
                                                            <span
                                                                className={`text-xs font-medium ${getStockLevel(item).color} mt-1 rounded px-2 py-1`}
                                                            >
                                                                {item.current_stock <=
                                                                0
                                                                    ? 'OUT OF STOCK'
                                                                    : 'CRITICAL'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {item.minimum_stock}{' '}
                                                            {
                                                                item.unit_of_measure
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {item.supplier ? (
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        item
                                                                            .supplier
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <Phone className="mr-1 h-3 w-3" />
                                                                    {
                                                                        item
                                                                            .supplier
                                                                            .phone
                                                                    }
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">
                                                                No supplier
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link
                                                                href={`/inventory/${item.id}`}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Add Stock"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={`/inventory/${item.id}/edit`}
                                                                className="text-gray-600 hover:text-gray-900"
                                                                title="Edit Item"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {(highItems.length > 0 || mediumItems.length > 0) && (
                            <div className="rounded-lg border border-orange-200 bg-white">
                                <div className="border-b border-orange-200 bg-orange-100 px-4 py-3">
                                    <h2 className="flex items-center text-lg font-semibold text-orange-900">
                                        <TrendingDown className="mr-2 h-5 w-5" />
                                        Low Stock Items - Plan Restocking (
                                        {highItems.length + mediumItems.length})
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Item
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Stock Level
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Minimum Stock
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Restock Cost
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Supplier
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {[...highItems, ...mediumItems].map(
                                                (item) => {
                                                    const restockQuantity =
                                                        item.minimum_stock * 2 -
                                                        item.current_stock;
                                                    const restockCost =
                                                        restockQuantity *
                                                        item.unit_cost;
                                                    const stockLevel =
                                                        getStockLevel(item);

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="font-medium text-gray-900">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        SKU:{' '}
                                                                        {
                                                                            item.sku
                                                                        }
                                                                    </div>
                                                                    <span
                                                                        className="mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                                                                        style={{
                                                                            backgroundColor:
                                                                                item
                                                                                    .category
                                                                                    .color +
                                                                                '20',
                                                                            color: item
                                                                                .category
                                                                                .color,
                                                                        }}
                                                                    >
                                                                        {
                                                                            item
                                                                                .category
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {
                                                                            item.current_stock
                                                                        }{' '}
                                                                        {
                                                                            item.unit_of_measure
                                                                        }
                                                                    </span>
                                                                    <span
                                                                        className={`text-xs font-medium ${stockLevel.color} mt-1 rounded px-2 py-1`}
                                                                    >
                                                                        {
                                                                            stockLevel.level
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-900">
                                                                    {
                                                                        item.minimum_stock
                                                                    }{' '}
                                                                    {
                                                                        item.unit_of_measure
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {formatCurrency(
                                                                            restockCost,
                                                                        )}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        for{' '}
                                                                        {
                                                                            restockQuantity
                                                                        }{' '}
                                                                        {
                                                                            item.unit_of_measure
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                {item.supplier ? (
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {
                                                                                item
                                                                                    .supplier
                                                                                    .name
                                                                            }
                                                                        </div>
                                                                        {item
                                                                            .supplier
                                                                            .contact_person && (
                                                                            <div className="text-xs text-gray-500">
                                                                                {
                                                                                    item
                                                                                        .supplier
                                                                                        .contact_person
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500">
                                                                        No
                                                                        supplier
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                                <div className="flex justify-end space-x-2">
                                                                    <Link
                                                                        href={`/inventory/${item.id}`}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                        title="Add Stock"
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </Link>
                                                                    <Link
                                                                        href={`/inventory/${item.id}/edit`}
                                                                        className="text-gray-600 hover:text-gray-900"
                                                                        title="Edit Item"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
