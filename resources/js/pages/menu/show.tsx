import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Trash2,
    X,
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
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
    allergens: string[] | null;
    special_instructions: string | null;
    category_id: number;
    sku: string | null;
    category?: Category;
}

interface Props {
    menuItem: MenuItem;
}

export default function ShowMenuItem({ menuItem }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Menu Management',
            href: '/menu',
        },
        {
            title: menuItem.name,
            href: `/menu/${menuItem.id}`,
        },
    ];

    const handleDelete = () => {
        if (
            confirm(
                `Are you sure you want to delete "${menuItem.name}"? This action cannot be undone.`,
            )
        ) {
            const deleteForm = document.createElement('form');
            deleteForm.method = 'POST';
            deleteForm.action = `/menu/${menuItem.id}`;

            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'DELETE';

            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '';

            deleteForm.appendChild(methodInput);
            deleteForm.appendChild(tokenInput);
            document.body.appendChild(deleteForm);
            deleteForm.submit();
        }
    };

    const profit = menuItem.cost_price
        ? menuItem.price - menuItem.cost_price
        : null;

    const profitMargin =
        menuItem.cost_price && menuItem.price > 0
            ? (
                  ((menuItem.price - menuItem.cost_price) / menuItem.price) *
                  100
              ).toFixed(1)
            : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Menu Item - ${menuItem.name}`} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Menu Item Details
                        </h1>
                        <p className="text-gray-600">
                            View and manage menu item information
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                        </button>
                        <Link
                            href={`/menu/${menuItem.id}/edit`}
                            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                        </Link>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Status
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Current availability and type
                            </p>
                        </div>
                        <div className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                                {menuItem.is_available ? (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        Available
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                                        <X className="mr-1 h-4 w-4" />
                                        Unavailable
                                    </span>
                                )}

                                {menuItem.is_combo && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                        Combo Item
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Basic Information Card */}
                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Basic Information
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Category
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {menuItem.category?.name || 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Item Name
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {menuItem.name || 'N/A'}
                                    </dd>
                                </div>
                                {menuItem.sku && (
                                    <div className="md:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">
                                            SKU
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {menuItem.sku}
                                        </dd>
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Description
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {menuItem.description ||
                                            'No description provided'}
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Pricing
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Selling Price
                                    </dt>
                                    <dd className="mt-1 flex items-center text-lg font-semibold text-green-600">
                                        <DollarSign className="mr-1 h-4 w-4" />
                                        KES {Number(menuItem.price).toFixed(2)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Cost Price
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {menuItem.cost_price ? (
                                            <span className="flex items-center">
                                                <DollarSign className="mr-1 h-4 w-4" />
                                                KES{' '}
                                                {Number(
                                                    menuItem.cost_price,
                                                ).toFixed(2)}
                                            </span>
                                        ) : (
                                            'Not set'
                                        )}
                                    </dd>
                                </div>
                            </div>

                            {/* Profit Analysis */}
                            {profit !== null && (
                                <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
                                    <h4 className="mb-2 text-sm font-medium text-green-800">
                                        Profit Analysis
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <dt className="text-sm text-green-700">
                                                Profit per item
                                            </dt>
                                            <dd className="text-lg font-semibold text-green-800">
                                                KES {Number(profit).toFixed(2)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-green-700">
                                                Profit margin
                                            </dt>
                                            <dd className="text-lg font-semibold text-green-800">
                                                {profitMargin}%
                                            </dd>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preparation & Details Card */}
                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Preparation & Details
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Preparation Time
                                    </dt>
                                    <dd className="mt-1 flex items-center text-sm text-gray-900">
                                        <Clock className="mr-1 h-4 w-4" />
                                        {menuItem.preparation_time_minutes}{' '}
                                        minutes
                                    </dd>
                                </div>

                                {/* Allergens */}
                                <div className="md:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Allergens
                                    </dt>
                                    <dd className="mt-1">
                                        {menuItem.allergens &&
                                        menuItem.allergens.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {menuItem.allergens.map(
                                                    (allergen, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800"
                                                        >
                                                            <AlertCircle className="mr-1 h-3 w-3" />
                                                            {allergen}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">
                                                No allergens specified
                                            </span>
                                        )}
                                    </dd>
                                </div>

                                {/* Special Instructions */}
                                {menuItem.special_instructions && (
                                    <div className="md:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Special Instructions
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {menuItem.special_instructions}
                                        </dd>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
