import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Clock,
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

            <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black dark:text-white">
                            Menu Management
                        </h1>
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                            Manage your restaurant menu items and categories
                        </p>
                    </div>
                    <Link
                        href="/menu/create"
                        className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add New Item</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Total Items
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {stats.totalItems}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Active Items
                                </p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {stats.activeItems}
                                </p>
                            </div>
                            <ToggleRight className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Combo Items
                                </p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats.comboItems}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Categories
                                </p>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    {stats.categoriesCount}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6 rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`rounded-md px-4 py-2 text-sm font-bold shadow-md transition-colors ${
                                selectedCategory === null
                                    ? 'bg-red-600 text-white dark:bg-red-500'
                                    : 'border-2 border-gray-300 bg-white text-black hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`rounded-md px-4 py-2 text-sm font-bold shadow-md transition-colors ${
                                    selectedCategory === category.id
                                        ? 'bg-red-600 text-white dark:bg-red-500'
                                        : 'border-2 border-gray-300 bg-white text-black hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
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
                            className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="border-b-2 border-gray-200 bg-black p-4 dark:border-gray-700 dark:bg-gray-900">
                                <h2 className="text-lg font-bold text-white">
                                    {category.name}
                                </h2>
                                <p className="text-sm font-medium text-gray-300">
                                    {category.menu_items.length} items
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Item
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Cost
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Prep Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {category.menu_items.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    <Package className="mx-auto mb-3 h-8 w-8 text-gray-400 dark:text-gray-600" />
                                                    <p className="font-bold">
                                                        No items in this
                                                        category
                                                    </p>
                                                    <Link
                                                        href="/menu/create"
                                                        className="mt-2 inline-flex items-center space-x-1 font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        <span>
                                                            Add first item
                                                        </span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ) : (
                                            category.menu_items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="flex items-center">
                                                                    <span className="font-bold text-black dark:text-white">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>
                                                                    {item.is_combo && (
                                                                        <span className="ml-2 inline-flex items-center rounded-full border border-purple-200 bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 dark:border-purple-700 dark:bg-purple-900 dark:text-purple-200">
                                                                            Combo
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                                    SKU:{' '}
                                                                    {item.sku}
                                                                </div>
                                                                {item.description && (
                                                                    <div className="max-w-xs truncate text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span className="font-bold text-red-600 dark:text-red-400">
                                                                {formatPrice(
                                                                    item.price,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">
                                                            {formatPrice(
                                                                item.cost_price,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Clock className="mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                            <span className="font-medium text-black dark:text-white">
                                                                {
                                                                    item.preparation_time_minutes
                                                                }{' '}
                                                                min
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                                                                item.is_available
                                                                    ? 'border-green-200 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-200'
                                                                    : 'border-red-200 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900 dark:text-red-200'
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
                                                                className="text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                                title="View Item"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={`/menu/${item.id}/edit`}
                                                                className="text-black transition-colors hover:text-red-600 dark:text-white dark:hover:text-red-400"
                                                                title="Edit Item"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    handleToggleAvailability(
                                                                        item,
                                                                    )
                                                                }
                                                                className={`transition-colors ${
                                                                    item.is_available
                                                                        ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300'
                                                                        : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
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
                                                                className="text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                                title="Delete Item"
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

                {/* Empty State for No Categories */}
                {filteredCategories.length === 0 && (
                    <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">
                            No menu categories found
                        </h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Create your first category to organize menu items
                        </p>
                        <Link
                            href="/menu/create"
                            className="mt-4 inline-flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Menu Item</span>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
