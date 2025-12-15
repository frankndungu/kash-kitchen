import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    DollarSign,
    Download,
    Edit,
    Eye,
    Filter,
    Package,
    Plus,
    Search,
    ShoppingCart,
    Trash2,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    opening_stock?: number;
    stock_received?: number;
    stock_used?: number;
    category: {
        id: number;
        name: string;
        color: string;
    };
    linked_menu_items?: number;
    last_restocked?: string;
    created_at: string;
}

interface Category {
    id: number;
    name: string;
    color: string;
}

interface LowStockItem {
    name: string;
    current_stock: number;
    minimum_stock: number;
    unit_of_measure: string;
    days_until_stockout: number;
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
        avg_stock_level?: number;
    };
    lowStockItems?: LowStockItem[];
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
    lowStockItems = [],
    filters,
}: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        item: InventoryItem | null;
    }>({ show: false, item: null });

    // Update search term when filters change (for page navigation)
    useEffect(() => {
        setSearchTerm(filters.search || '');
    }, [filters.search]);

    const formatCurrency = (amount: number | null | undefined) => {
        const numericAmount = Number(amount) || 0;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedSearch = searchTerm.trim();

        router.get(
            '/inventory',
            {
                ...filters,
                search: trimmedSearch || undefined,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const updateFilter = (key: string, value: string) => {
        router.get(
            '/inventory',
            {
                ...filters,
                [key]: value === '' ? undefined : value,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        router.get(
            '/inventory',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
        setSearchTerm('');
    };

    // Enhanced CSV Export functionality with Dennis's required format
    const exportToCSV = () => {
        try {
            const currentDate = new Date().toLocaleDateString('en-KE');
            const reportDate = new Date().toISOString().split('T')[0];

            // Prepare CSV data in Dennis's required format
            const csvContent = [
                // Header
                ['Kash Kitchen - Inventory Report'],
                [`Generated: ${currentDate}`],
                [''],

                // Inventory Summary Stats
                ['INVENTORY SUMMARY'],
                ['Metric', 'Value'],
                ['Total Items', stats.total_items.toString()],
                ['Total Value', `KES ${stats.total_value.toFixed(2)}`],
                ['Low Stock Items', stats.low_stock_items.toString()],
                ['Out of Stock Items', stats.out_of_stock_items.toString()],
                ['Auto-Deduct Items', stats.auto_deduct_items.toString()],
                ...(stats.avg_stock_level
                    ? [
                          [
                              'Average Stock Level',
                              `${stats.avg_stock_level.toFixed(1)}%`,
                          ],
                      ]
                    : []),
                [''],

                // Low Stock Alerts (if available)
                ...(lowStockItems.length > 0
                    ? [
                          ['LOW STOCK ALERTS'],
                          [
                              'Item Name',
                              'Current Stock',
                              'Minimum Stock',
                              'Unit',
                              'Days Until Stockout',
                          ],
                          ...lowStockItems
                              .slice(0, 10)
                              .map((item) => [
                                  item.name,
                                  item.current_stock.toString(),
                                  item.minimum_stock.toString(),
                                  item.unit_of_measure,
                                  item.days_until_stockout.toString(),
                              ]),
                          [''],
                      ]
                    : []),

                // Main Inventory Report in Dennis's Format
                ['DETAILED INVENTORY REPORT'],
                [
                    'Item',
                    'Opening Stock',
                    'Received',
                    'Used/Sold',
                    'Closing Stock',
                    'Unit Cost',
                    'Total Cost',
                ],
                ...inventoryItems.data.map((item) => {
                    const openingStock = item.opening_stock || 0;
                    const received = item.stock_received || 0;
                    const used = item.stock_used || 0;
                    const closingStock = item.current_stock;
                    const unitCost = item.unit_cost;
                    const totalCost = closingStock * unitCost;

                    return [
                        item.name,
                        openingStock.toFixed(2),
                        received.toFixed(2),
                        used.toFixed(2),
                        closingStock.toFixed(2),
                        unitCost.toFixed(2),
                        totalCost.toFixed(2),
                    ];
                }),
                [''],

                // Additional Details
                ['ADDITIONAL ITEM DETAILS'],
                [
                    'Item Name',
                    'SKU',
                    'Category',
                    'Unit of Measure',
                    'Min Stock',
                    'Max Stock',
                    'Auto-Deduction',
                    'Stock Status',
                    'Last Restocked',
                ],
                ...inventoryItems.data.map((item) => {
                    const stockStatus = getStockStatus(item).status;
                    const autoDeduct = hasAutoDeduction(item) ? 'Yes' : 'No';

                    return [
                        item.name,
                        item.sku,
                        item.category.name,
                        item.unit_of_measure,
                        item.minimum_stock.toFixed(2),
                        item.maximum_stock.toFixed(2),
                        autoDeduct,
                        stockStatus,
                        formatDate(item.last_restocked),
                    ];
                }),
            ];

            // Convert to CSV string
            const csvString = csvContent
                .map((row) => row.map((field) => `"${field}"`).join(','))
                .join('\n');

            // Create and download file
            const blob = new Blob([csvString], {
                type: 'text/csv;charset=utf-8;',
            });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute(
                    'download',
                    `kash-kitchen-inventory-report-${reportDate}.csv`,
                );
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Error exporting data. Please try again.');
        }
    };

    const handleDeleteClick = (item: InventoryItem) => {
        setDeleteModal({ show: true, item });
    };

    const confirmDelete = () => {
        if (deleteModal.item) {
            router.delete(`/inventory/${deleteModal.item.id}`, {
                onSuccess: () => {
                    setDeleteModal({ show: false, item: null });
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    setDeleteModal({ show: false, item: null });
                },
            });
        }
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

    const getStockTrend = () => {
        const lowStockPercentage =
            (stats.low_stock_items / Math.max(stats.total_items, 1)) * 100;
        return lowStockPercentage < 10
            ? 'positive'
            : lowStockPercentage > 25
              ? 'negative'
              : 'neutral';
    };

    const stockTrend = getStockTrend();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management - Dashboard" />

            <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black dark:text-white">
                            Inventory Management
                        </h1>
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                            Track stock levels and optimize inventory
                            performance with automated deduction
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export CSV</span>
                        </button>
                        <Link
                            href="/pos"
                            className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>POS System</span>
                        </Link>
                        <Link
                            href="/inventory/create"
                            className="flex items-center space-x-2 rounded-lg border-2 border-black px-4 py-2 font-bold text-black shadow-md transition-all hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
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
                                    Automatic Inventory Deduction is Active
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {stats.auto_deduct_items} items are
                                    configured for automatic deduction when menu
                                    items are sold.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Total Inventory Value
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {formatCurrency(stats.total_value)}
                                </p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stats.total_items} items
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Stock Alerts
                                </p>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    {stats.low_stock_items +
                                        stats.out_of_stock_items}
                                </p>
                                <p
                                    className={`text-sm font-medium ${
                                        stockTrend === 'positive'
                                            ? 'text-green-600 dark:text-green-400'
                                            : stockTrend === 'negative'
                                              ? 'text-red-600 dark:text-red-400'
                                              : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    {stats.out_of_stock_items} out of stock
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Auto-Deduction
                                </p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats.auto_deduct_items}
                                </p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Linked to menu items
                                </p>
                            </div>
                            <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts - Full Width */}
                <div className="mb-6">
                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="mb-4 flex items-center text-lg font-bold text-black dark:text-white">
                            <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
                            Low Stock Alerts
                        </h2>
                        <Link
                            href="/inventory/reports/low-stock"
                            className="text-sm font-bold text-orange-600 transition-colors hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                            View all {lowStockItems.length} alerts →
                        </Link>
                        <div className="space-y-3">
                            {lowStockItems.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {lowStockItems
                                        .slice(0, 8)
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-orange-900 dark:text-orange-200">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-sm text-orange-700 dark:text-orange-300">
                                                            {item.current_stock}{' '}
                                                            {
                                                                item.unit_of_measure
                                                            }{' '}
                                                            left
                                                        </p>
                                                    </div>
                                                    <div className="ml-2 text-right">
                                                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                            {
                                                                item.days_until_stockout
                                                            }
                                                            d
                                                        </div>
                                                        <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                                                            Until out
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-8 text-center dark:border-green-700 dark:bg-green-900/20">
                                    <Package className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
                                    <p className="mt-2 text-lg font-bold text-green-700 dark:text-green-300">
                                        All items well stocked!
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        No items are currently below minimum
                                        stock levels.
                                    </p>
                                </div>
                            )}

                            {lowStockItems.length > 8 && (
                                <div className="border-t border-orange-200 pt-4 text-center dark:border-orange-700">
                                    <Link
                                        href="/inventory/reports/low-stock"
                                        className="text-sm font-bold text-orange-600 transition-colors hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                                    >
                                        View all {lowStockItems.length} alerts →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mt-6 mb-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <form
                            onSubmit={handleSearch}
                            className="min-w-64 flex-1"
                        >
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

                    {/* Show current search term */}
                    {filters.search && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Searching for: <strong>"{filters.search}"</strong>
                            {inventoryItems.total > 0 && (
                                <span className="ml-2">
                                    ({inventoryItems.total} result
                                    {inventoryItems.total !== 1 ? 's' : ''})
                                </span>
                            )}
                        </div>
                    )}

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
                                        Last Restocked
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
                                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        {formatDate(
                                                            item.last_restocked,
                                                        )}
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
                                                            className="flex items-center space-x-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                            <span>Edit</span>
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    item,
                                                                )
                                                            }
                                                            className="flex items-center space-x-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            <div className="flex flex-col items-center space-y-3">
                                                <Package className="h-12 w-12 text-gray-400" />
                                                <div>
                                                    {filters.search ? (
                                                        <>
                                                            <p className="font-bold">
                                                                No items found
                                                                for "
                                                                {filters.search}
                                                                "
                                                            </p>
                                                            <p className="text-sm">
                                                                Try a different
                                                                search term or
                                                                clear filters
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="font-bold">
                                                                No inventory
                                                                items found
                                                            </p>
                                                            <p className="text-sm">
                                                                Create your
                                                                first inventory
                                                                item to get
                                                                started
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                {!filters.search && (
                                                    <Link
                                                        href="/inventory/create"
                                                        className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        <span>
                                                            Add First Item
                                                        </span>
                                                    </Link>
                                                )}
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
                                            href={`/inventory?${new URLSearchParams(
                                                {
                                                    ...filters,
                                                    page: String(
                                                        inventoryItems.current_page -
                                                            1,
                                                    ),
                                                },
                                            ).toString()}`}
                                            className="rounded-lg border-2 border-gray-300 px-3 py-1 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {inventoryItems.current_page <
                                        inventoryItems.last_page && (
                                        <Link
                                            href={`/inventory?${new URLSearchParams(
                                                {
                                                    ...filters,
                                                    page: String(
                                                        inventoryItems.current_page +
                                                            1,
                                                    ),
                                                },
                                            ).toString()}`}
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

                {/* Delete Confirmation Modal */}
                {deleteModal.show && deleteModal.item && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-black dark:text-white">
                                        Delete Inventory Item
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        This action cannot be undone
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setDeleteModal({
                                            show: false,
                                            item: null,
                                        })
                                    }
                                    className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-4 rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                    <strong>{deleteModal.item.name}</strong>{' '}
                                    will be permanently deleted.
                                </p>
                                <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                                    • All stock movements will be removed
                                    <br />
                                    • Menu item links will be removed
                                    <br />• Current stock:{' '}
                                    {deleteModal.item.current_stock}{' '}
                                    {deleteModal.item.unit_of_measure}
                                </p>
                            </div>

                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={() =>
                                        setDeleteModal({
                                            show: false,
                                            item: null,
                                        })
                                    }
                                    className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    Delete Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
