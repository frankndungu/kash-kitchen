import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, Save, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
}

interface Props {
    menuItem: MenuItem;
    categories?: Category[];
}

interface FormData {
    category_id: number;
    name: string;
    description: string;
    price: string;
    cost_price: string;
    is_available: boolean;
    is_combo: boolean;
    preparation_time_minutes: string;
    allergens: string[];
    special_instructions: string;
}

export default function EditMenuItem({ menuItem, categories = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Menu Management',
            href: '/menu',
        },
        {
            title: menuItem.name,
            href: `/menu/${menuItem.id}`,
        },
        {
            title: 'Edit',
            href: `/menu/${menuItem.id}/edit`,
        },
    ];

    const { data, setData, patch, processing, errors } = useForm<FormData>({
        category_id: menuItem?.category_id || 0,
        name: menuItem?.name || '',
        description: menuItem?.description || '',
        price: menuItem?.price?.toString() || '0',
        cost_price: menuItem?.cost_price?.toString() || '',
        is_available: menuItem?.is_available ?? true,
        is_combo: menuItem?.is_combo ?? false,
        preparation_time_minutes:
            menuItem?.preparation_time_minutes?.toString() || '0',
        allergens: menuItem?.allergens || [],
        special_instructions: menuItem?.special_instructions || '',
    });

    const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
        menuItem?.allergens || [],
    );

    const commonAllergens = [
        'Nuts',
        'Dairy',
        'Eggs',
        'Soy',
        'Wheat',
        'Gluten',
        'Shellfish',
        'Fish',
        'Sesame',
        'Sulfites',
    ];

    useEffect(() => {
        setData('allergens', selectedAllergens);
    }, [selectedAllergens]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        patch(`/menu/${menuItem.id}`, {
            onSuccess: () => {
                // Redirect handled by controller
            },
        });
    };

    const handleDelete = () => {
        if (
            confirm(
                `Are you sure you want to delete "${menuItem?.name || 'this item'}"? This action cannot be undone.`,
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

    const toggleAllergen = (allergen: string) => {
        const updated = selectedAllergens.includes(allergen)
            ? selectedAllergens.filter((a) => a !== allergen)
            : [...selectedAllergens, allergen];

        setSelectedAllergens(updated);
    };

    const profitMargin =
        data.cost_price && parseFloat(data.price) > 0
            ? (
                  ((parseFloat(data.price) - parseFloat(data.cost_price)) /
                      parseFloat(data.price)) *
                  100
              ).toFixed(1)
            : null;

    const profit = data.cost_price
        ? parseFloat(data.price) - parseFloat(data.cost_price)
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${menuItem?.name || 'Menu Item'}`} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Menu Item
                        </h1>
                        <p className="text-gray-600">
                            Update "{menuItem?.name || 'menu item'}" details
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
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-xl border border-gray-200 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Category{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData(
                                            'category_id',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {(categories || []).map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <div className="mt-2 flex items-center text-sm text-red-600">
                                        <AlertCircle className="mr-1 h-4 w-4" />
                                        {errors.category_id}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Item Name{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="e.g., Chicken Burger"
                                    required
                                />
                                {errors.name && (
                                    <div className="mt-2 flex items-center text-sm text-red-600">
                                        <AlertCircle className="mr-1 h-4 w-4" />
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                rows={3}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Brief description of the item..."
                            />
                            {errors.description && (
                                <div className="mt-2 flex items-center text-sm text-red-600">
                                    <AlertCircle className="mr-1 h-4 w-4" />
                                    {errors.description}
                                </div>
                            )}
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Selling Price (KES){' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="0.00"
                                    required
                                />
                                {errors.price && (
                                    <div className="mt-2 flex items-center text-sm text-red-600">
                                        <AlertCircle className="mr-1 h-4 w-4" />
                                        {errors.price}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Cost Price (KES)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.cost_price}
                                    onChange={(e) =>
                                        setData('cost_price', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="0.00"
                                />
                                {errors.cost_price && (
                                    <div className="mt-2 flex items-center text-sm text-red-600">
                                        <AlertCircle className="mr-1 h-4 w-4" />
                                        {errors.cost_price}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profit Calculation Display */}
                        {profit !== null && (
                            <div className="rounded-md border border-green-200 bg-green-50 p-4">
                                <h4 className="mb-2 text-sm font-medium text-green-800">
                                    Profit Analysis
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-green-700">
                                            Profit per item:
                                        </span>
                                        <span className="ml-2 font-medium text-green-800">
                                            KES {Number(profit).toFixed(2)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-green-700">
                                            Profit margin:
                                        </span>
                                        <span className="ml-2 font-medium text-green-800">
                                            {profitMargin}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Preparation Time (minutes){' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.preparation_time_minutes}
                                onChange={(e) =>
                                    setData(
                                        'preparation_time_minutes',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="5"
                                required
                            />
                            {errors.preparation_time_minutes && (
                                <div className="mt-2 flex items-center text-sm text-red-600">
                                    <AlertCircle className="mr-1 h-4 w-4" />
                                    {errors.preparation_time_minutes}
                                </div>
                            )}
                        </div>

                        {/* Options */}
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_available}
                                    onChange={(e) =>
                                        setData(
                                            'is_available',
                                            e.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Available for sale
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_combo}
                                    onChange={(e) =>
                                        setData('is_combo', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    This is a combo item
                                </label>
                            </div>
                        </div>

                        {/* Allergens */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Allergens
                            </label>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                                {commonAllergens.map((allergen) => (
                                    <label
                                        key={allergen}
                                        className="flex items-center"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAllergens.includes(
                                                allergen,
                                            )}
                                            onChange={() =>
                                                toggleAllergen(allergen)
                                            }
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            {allergen}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Special Instructions
                            </label>
                            <textarea
                                value={data.special_instructions}
                                onChange={(e) =>
                                    setData(
                                        'special_instructions',
                                        e.target.value,
                                    )
                                }
                                rows={2}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Special cooking instructions or notes..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end space-x-4">
                            <Link
                                href="/menu"
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                <span>
                                    {processing
                                        ? 'Updating...'
                                        : 'Update Menu Item'}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
