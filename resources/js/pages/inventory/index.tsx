import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    DollarSign,
    Edit,
    Eye,
    Filter,
    Package,
    Plus,
    Search,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/inventory',
    },
];

interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    current_stock: number;
    minimum_stock: number;
    maximum_stock: number;
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
    } | null;
    linked_menu_items?: number; // Count of linked menu items
}

interface Category {
    id: number;
    name: string;
    color: string;
}

interface IndexProps {
    user: {
        name: string;
        email: string;
    };
    inventoryItems: {
        data: InventoryItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: Category[];
    stats: {
        total_items: number;
        low_stock_items: number;
        out_of_stock_items: number;
        total_value: number;
        auto_deduct_items: number;
    };
    filters: {
        category?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({
    user,
    inventoryItems,
    categories,
    stats,
    filters,
}: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const formatCurrency = (amount: number | null | undefined) => {
        const numericAmount = Number(amount) || 0;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/inventory', {
            ...filters,
            search: searchTerm,
        });
    };

    const updateFilter = (key: string, value: string) => {
        router.get('/inventory', {
            ...filters,
            [key]: value === '' ? undefined : value,
        });
    };

    const clearFilters = () => {
        router.get('/inventory');
        setSearchTerm('');
    };

    const getStockStatus = (item: InventoryItem) => {
        if (item.current_stock <= 0) {
            return {
                status: 'Out of Stock',
                color: 'text-red-800 bg-red-100 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
                icon: AlertCircle,
            };
        } else if (item.current_stock <= item.minimum_stock) {
            return {
                status: 'Low Stock',
                color: 'text-orange-800 bg-orange-100 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
                icon: AlertTriangle,
            };
        } else {
            return {
                status: 'In Stock',
                color: 'text-green-800 bg-green-100 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
                icon: Package,
            };
        }
    };

    const getStockPercentage = (item: InventoryItem) => {
        if (!item.maximum_stock || item.maximum_stock <= 0) return 50;
        return Math.min((item.current_stock / item.maximum_stock) * 100, 100);
    };

    const hasAutoDeduction = (item: InventoryItem) => {
        return item.linked_menu_items && item.linked_menu_items > 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />

            <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black dark:text-white">
                            Inventory Management
                        </h1>
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                            Track stock levels, manage suppliers, and monitor
                            inventory value
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/inventory/reports/low-stock"
                            className="flex items-center space-x-2 rounded-lg border-2 border-orange-300 bg-orange-50 px-4 py-2 font-bold text-orange-700 shadow-md transition-colors hover:bg-orange-100 dark:border-orange-600 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/40"
                        >
                            <AlertTriangle className="h-4 w-4" />
                            <span>Low Stock Report</span>
                        </Link>
                        <Link
                            href="/inventory/create"
                            className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Item</span>
                        </Link>
                    </div>
                </div>

                {/* Auto-Deduction Info Banner */}
                {stats.auto_deduct_items > 0 && (
                    <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-700 dark:bg-blue-900/20">
                        <div className="flex items-center space-x-3">
                            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h3 className="font-bold text-blue-900 dark:text-blue-200">
                                    🔥 Automatic Inventory Deduction is Active
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {stats.auto_deduct_items} items are
                                    configured for automatic deduction when menu
                                    items are sold in POS orders.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-5">
                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Items
                                </p>
                                <p className="text-2xl font-bold text-black dark:text-white">
                                    {stats.total_items}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Low Stock Items
                                </p>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {stats.low_stock_items}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Out of Stock
                                </p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {stats.out_of_stock_items}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Auto-Deduct Items
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats.auto_deduct_items}
                                </p>
                            </div>
                            <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Value
                                </p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(stats.total_value)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="flex rounded-lg border-2 border-gray-300 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search items by name, SKU, or description..."
                                    className="flex-1 rounded-l-lg border-none bg-transparent px-4 py-2 text-black focus:ring-0 focus:outline-none dark:text-white"
                                />
                                <button
                                    type="submit"
                                    className="rounded-r-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-bold text-gray-700 shadow-md transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                        </button>
                        {(filters.category ||
                            filters.status ||
                            filters.search) && (
                            <button
                                onClick={clearFilters}
                                className="rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="grid gap-4 rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg md:grid-cols-3 dark:border-gray-700 dark:bg-gray-800">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Category
                                </label>
                                <select
                                    value={filters.category || ''}
                                    onChange={(e) =>
                                        updateFilter('category', e.target.value)
                                    }
                                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Stock Status
                                </label>
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) =>
                                        updateFilter('status', e.target.value)
                                    }
                                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">All Items</option>
                                    <option value="in_stock">In Stock</option>
                                    <option value="low_stock">Low Stock</option>
                                    <option value="out_of_stock">
                                        Out of Stock
                                    </option>
                                    <option value="auto_deduct">
                                        Auto-Deduct Items
                                    </option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Inventory Items Table */}
                <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b-2 border-gray-200 bg-black p-4 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-white">
                            Inventory Items ({inventoryItems.total})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Item Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Stock Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Auto-Deduction
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {inventoryItems.data.length > 0 ? (
                                    inventoryItems.data.map((item) => {
                                        const stockStatus =
                                            getStockStatus(item);
                                        const stockPercentage =
                                            getStockPercentage(item);
                                        const autoDeduct =
                                            hasAutoDeduction(item);
                                        const StockIcon = stockStatus.icon;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className="font-bold text-black dark:text-white">
                                                                {item.name}
                                                            </h3>
                                                            {autoDeduct && (
                                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                    AUTO
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            SKU: {item.sku}
                                                        </p>
                                                        {item.supplier && (
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-500">
                                                                {
                                                                    item
                                                                        .supplier
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                                                        style={{
                                                            backgroundColor: `${item.category.color}20`,
                                                            color: item.category
                                                                .color,
                                                        }}
                                                    >
                                                        {item.category.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-bold text-black dark:text-white">
                                                                {Number(
                                                                    item.current_stock,
                                                                ).toFixed(
                                                                    2,
                                                                )}{' '}
                                                                {
                                                                    item.unit_of_measure
                                                                }
                                                            </span>
                                                            <span
                                                                className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-bold ${stockStatus.color}`}
                                                            >
                                                                <StockIcon className="mr-1 h-3 w-3" />
                                                                {
                                                                    stockStatus.status
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-600">
                                                            <div
                                                                className={`h-2 rounded-full transition-all ${
                                                                    stockPercentage >
                                                                    50
                                                                        ? 'bg-green-500'
                                                                        : stockPercentage >
                                                                            20
                                                                          ? 'bg-yellow-500'
                                                                          : 'bg-red-500'
                                                                }`}
                                                                style={{
                                                                    width: `${Math.max(stockPercentage, 5)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Min:{' '}
                                                            {Number(
                                                                item.minimum_stock,
                                                            ).toFixed(2)}{' '}
                                                            {
                                                                item.unit_of_measure
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {autoDeduct ? (
                                                        <div className="flex items-center justify-center space-x-1">
                                                            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                {
                                                                    item.linked_menu_items
                                                                }{' '}
                                                                linked
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Manual
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-bold text-black dark:text-white">
                                                            {formatCurrency(
                                                                item.current_stock *
                                                                    item.unit_cost,
                                                            )}
                                                        </div>
                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            @{' '}
                                                            {formatCurrency(
                                                                item.unit_cost,
                                                            )}
                                                            /
                                                            {
                                                                item.unit_of_measure
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/inventory/${item.id}`}
                                                            className="flex items-center space-x-1 rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                            <span>View</span>
                                                        </Link>
                                                        <Link
                                                            href={`/inventory/${item.id}/edit`}
                                                            className="flex items-center space-x-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                            <span>Edit</span>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            <div className="flex flex-col items-center space-y-3">
                                                <Package className="h-12 w-12 text-gray-400" />
                                                <div>
                                                    <p className="font-bold">
                                                        No inventory items found
                                                    </p>
                                                    <p className="text-sm">
                                                        Create your first
                                                        inventory item to get
                                                        started
                                                    </p>
                                                </div>
                                                <Link
                                                    href="/inventory/create"
                                                    className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    <span>Add First Item</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {inventoryItems.last_page > 1 && (
                        <div className="border-t-2 border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Page {inventoryItems.current_page} of{' '}
                                    {inventoryItems.last_page}
                                </div>
                                <div className="flex space-x-2">
                                    {inventoryItems.current_page > 1 && (
                                        <Link
                                            href={`/inventory?page=${inventoryItems.current_page - 1}`}
                                            className="rounded-lg border-2 border-gray-300 px-3 py-1 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {inventoryItems.current_page <
                                        inventoryItems.last_page && (
                                        <Link
                                            href={`/inventory?page=${inventoryItems.current_page + 1}`}
                                            className="rounded-lg bg-red-600 px-3 py-1 text-sm font-bold text-white transition-colors hover:bg-red-700"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
