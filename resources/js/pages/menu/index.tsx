import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Clock,
    DollarSign,
    Edit,
    Eye,
    Package,
    Plus,
    ToggleLeft,
    ToggleRight,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Menu Management',
        href: '/menu',
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    menu_items: MenuItem[];
}

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    cost_price: number | null;
    is_available: boolean;
    is_combo: boolean;
    preparation_time_minutes: number;
    sku: string;
    category_id: number;
}

interface Stats {
    totalItems: number;
    activeItems: number;
    comboItems: number;
    categoriesCount: number;
}

interface Props {
    categories: Category[];
    stats: Stats;
}

export default function MenuManagement({ categories, stats }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );

    const handleToggleAvailability = (menuItem: MenuItem) => {
        router.patch(
            `/menu/${menuItem.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Handle success if needed
                },
            },
        );
    };

    const handleDelete = (menuItem: MenuItem) => {
        if (confirm(`Are you sure you want to delete "${menuItem.name}"?`)) {
            router.delete(`/menu/${menuItem.id}`, {
                preserveScroll: true,
            });
        }
    };

    const filteredCategories = selectedCategory
        ? categories.filter((cat) => cat.id === selectedCategory)
        : categories;

    const formatPrice = (price: number | null): string => {
        if (price === null || price === undefined) return 'N/A';
        return `KES ${Number(price).toFixed(2)}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Management" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Menu Management
                        </h1>
                        <p className="text-gray-600">
                            Manage your restaurant menu items and categories
                        </p>
                    </div>
                    <Link
                        href="/menu/create"
                        className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add New Item</span>
                    </Link>
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
                                    {stats.totalItems}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Active Items
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.activeItems}
                                </p>
                            </div>
                            <ToggleRight className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Combo Items
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {stats.comboItems}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Categories
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {stats.categoriesCount}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                selectedCategory === null
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                    selectedCategory === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {category.name} ({category.menu_items.length})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Items by Category */}
                <div className="space-y-8">
                    {filteredCategories.map((category) => (
                        <div
                            key={category.id}
                            className="rounded-xl border border-gray-200 bg-white"
                        >
                            <div className="border-b border-gray-200 p-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {category.name}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {category.menu_items.length} items
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Item
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Cost
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Prep Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {category.menu_items.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-4 text-center text-gray-500"
                                                >
                                                    No items in this category
                                                </td>
                                            </tr>
                                        ) : (
                                            category.menu_items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {item.name}
                                                                    {item.is_combo && (
                                                                        <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                                                            Combo
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {item.sku}
                                                                </div>
                                                                {item.description && (
                                                                    <div className="max-w-xs truncate text-sm text-gray-500">
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        <div className="flex items-center">
                                                            <DollarSign className="mr-1 h-4 w-4 text-green-600" />
                                                            {formatPrice(
                                                                item.price,
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                        {formatPrice(
                                                            item.cost_price,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                        <div className="flex items-center">
                                                            <Clock className="mr-1 h-4 w-4" />
                                                            {
                                                                item.preparation_time_minutes
                                                            }{' '}
                                                            min
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                item.is_available
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {item.is_available
                                                                ? 'Available'
                                                                : 'Unavailable'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link
                                                                href={`/menu/${item.id}`}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                                title="View"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={`/menu/${item.id}/edit`}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    handleToggleAvailability(
                                                                        item,
                                                                    )
                                                                }
                                                                className={`${
                                                                    item.is_available
                                                                        ? 'text-red-600 hover:text-red-900'
                                                                        : 'text-green-600 hover:text-green-900'
                                                                }`}
                                                                title={
                                                                    item.is_available
                                                                        ? 'Mark Unavailable'
                                                                        : 'Mark Available'
                                                                }
                                                            >
                                                                {item.is_available ? (
                                                                    <ToggleLeft className="h-4 w-4" />
                                                                ) : (
                                                                    <ToggleRight className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item,
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
