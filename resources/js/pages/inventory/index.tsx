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
}

interface Category {
    id: number;
    name: string;
    color: string;
}

interface Stats {
    total_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    total_value: number;
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
    stats: Stats;
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
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category || '',
    );
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const formatCurrency = (amount: number | null | undefined) => {
        const numericAmount = Number(amount) || 0;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const handleFilterChange = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedStatus) params.set('status', selectedStatus);

        router.get(`/inventory?${params.toString()}`);
    };

    const getStockStatus = (item: InventoryItem) => {
        if (item.current_stock <= 0) {
            return {
                status: 'Out of Stock',
                color: 'text-red-600 bg-red-100',
                icon: AlertCircle,
            };
        } else if (item.current_stock <= item.minimum_stock) {
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

    const getStockPercentage = (item: InventoryItem) => {
        if (!item.maximum_stock || item.maximum_stock <= 0) return 50;
        return Math.min((item.current_stock / item.maximum_stock) * 100, 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Inventory Management
                        </h1>
                        <p className="text-gray-600">
                            Track stock levels, manage suppliers, and monitor
                            inventory value
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/inventory/reports/low-stock"
                            className="flex items-center space-x-2 rounded-lg border border-orange-300 px-4 py-2 text-orange-700 hover:bg-orange-50"
                        >
                            <AlertTriangle className="h-4 w-4" />
                            <span>Low Stock Report</span>
                        </Link>
                        <Link
                            href="/inventory/create"
                            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Item</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Items
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.total_items}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Low Stock Items
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {stats.low_stock_items}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Out of Stock
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    {stats.out_of_stock_items}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Value
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats.total_value)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2"
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

                        <div className="flex items-center space-x-2">
                            <select
                                value={selectedStatus}
                                onChange={(e) =>
                                    setSelectedStatus(e.target.value)
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2"
                            >
                                <option value="">All Status</option>
                                <option value="in_stock">In Stock</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">
                                    Out of Stock
                                </option>
                            </select>
                        </div>

                        <button
                            onClick={handleFilterChange}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Inventory Items
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Item
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Stock Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Unit Cost
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Stock Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Supplier
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {inventoryItems.data.map((item) => {
                                    const stockStatus = getStockStatus(item);
                                    const stockPercentage =
                                        getStockPercentage(item);
                                    const StockIcon = stockStatus.icon;

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        SKU: {item.sku}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                                                    style={{
                                                        backgroundColor:
                                                            item.category
                                                                .color + '20',
                                                        color: item.category
                                                            .color,
                                                    }}
                                                >
                                                    {item.category.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {item.current_stock}{' '}
                                                        {item.unit_of_measure}
                                                    </span>
                                                    <div className="mt-1 w-20">
                                                        <div className="h-2 rounded-full bg-gray-200">
                                                            <div
                                                                className={`h-2 rounded-full ${
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
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        Min:{' '}
                                                        {item.minimum_stock}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${stockStatus.color}`}
                                                >
                                                    <StockIcon className="mr-1 h-3 w-3" />
                                                    {stockStatus.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(
                                                        item.unit_cost,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-green-600">
                                                    {formatCurrency(
                                                        item.current_stock *
                                                            item.unit_cost,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">
                                                    {item.supplier?.name ||
                                                        'No Supplier'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={`/inventory/${item.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/inventory/${item.id}/edit`}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
