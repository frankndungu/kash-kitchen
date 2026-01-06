import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Banknote, Save, Smartphone, Wallet, X } from 'lucide-react';
import React from 'react';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    description?: string;
}

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    item_total: number;
    special_instructions?: string;
    menu_item: MenuItem;
}

interface Order {
    id: number;
    order_number: string;
    order_type: string;
    customer_name: string | null;
    customer_phone: string | null;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    mpesa_reference: string | null;
    order_status: string;
    kitchen_notes?: string;
    customer_notes?: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

interface EditProps {
    user: {
        name: string;
        email: string;
    };
    order: Order;
}

export default function Edit({ user, order }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'POS System',
            href: '/pos',
        },
        {
            title: `Order #${order.order_number}`,
            href: `/pos/${order.id}`,
        },
        {
            title: 'Edit',
            href: '#',
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        order_type: order.order_type,
        customer_name: order.customer_name || '',
        customer_phone: order.customer_phone || '',
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        mpesa_reference: order.mpesa_reference || '',
        order_status: order.order_status,
        kitchen_notes: order.kitchen_notes || '',
        customer_notes: order.customer_notes || '',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/pos/${order.id}`, {
            onSuccess: () => {
                router.visit(`/pos/${order.id}`);
            },
            onError: (errors) => {
                console.error('Failed to update order:', errors);
            },
        });
    };

    const generateTransactionId = () => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase();

        if (data.payment_method === 'cash') {
            setData('mpesa_reference', `CASH-${timestamp}-${randomStr}`);
        } else if (data.payment_method === 'grubba') {
            setData('mpesa_reference', `GRUBBA-${timestamp}-${randomStr}`);
        } else {
            setData('mpesa_reference', `MPESA-${timestamp}-${randomStr}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Order #${order.order_number}`} />

            <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black dark:text-white">
                            Edit Order #{order.order_number}
                        </h1>
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                            Modify order details and payment information
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                    Customer Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                            Customer Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.customer_name}
                                            onChange={(e) =>
                                                setData(
                                                    'customer_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                            placeholder="Customer name"
                                        />
                                        {errors.customer_name && (
                                            <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                {errors.customer_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            value={data.customer_phone}
                                            onChange={(e) =>
                                                setData(
                                                    'customer_phone',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                            placeholder="Phone number"
                                        />
                                        {errors.customer_phone && (
                                            <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                {errors.customer_phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                    Order Details
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                            Order Type
                                        </label>
                                        <select
                                            value={data.order_type}
                                            onChange={(e) =>
                                                setData(
                                                    'order_type',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="dine_in">
                                                Dine In
                                            </option>
                                            <option value="takeaway">
                                                Takeaway
                                            </option>
                                            <option value="delivery">
                                                Delivery
                                            </option>
                                        </select>
                                        {errors.order_type && (
                                            <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                {errors.order_type}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                            Order Status
                                        </label>
                                        <select
                                            value={data.order_status}
                                            onChange={(e) =>
                                                setData(
                                                    'order_status',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="confirmed">
                                                Confirmed
                                            </option>
                                            <option value="preparing">
                                                Preparing
                                            </option>
                                            <option value="ready">Ready</option>
                                            <option value="completed">
                                                Completed
                                            </option>
                                            <option value="cancelled">
                                                Cancelled
                                            </option>
                                        </select>
                                        {errors.order_status && (
                                            <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                {errors.order_status}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                    Payment Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                            Payment Method
                                        </label>
                                        <div className="flex space-x-4">
                                            <label className="flex cursor-pointer items-center">
                                                <input
                                                    type="radio"
                                                    value="cash"
                                                    checked={
                                                        data.payment_method ===
                                                        'cash'
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'payment_method',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mr-2 text-red-600"
                                                />
                                                <Banknote className="mr-1 h-4 w-4 text-green-600 dark:text-green-400" />
                                                <span className="text-sm font-bold text-black dark:text-white">
                                                    Cash
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-center">
                                                <input
                                                    type="radio"
                                                    value="mpesa"
                                                    checked={
                                                        data.payment_method ===
                                                        'mpesa'
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'payment_method',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mr-2 text-red-600"
                                                />
                                                <Smartphone className="mr-1 h-4 w-4 text-green-600 dark:text-green-400" />
                                                <span className="text-sm font-bold text-black dark:text-white">
                                                    M-Pesa
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-center">
                                                <input
                                                    type="radio"
                                                    value="grubba"
                                                    checked={
                                                        data.payment_method ===
                                                        'grubba'
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'payment_method',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mr-2 text-red-600"
                                                />
                                                <Wallet className="mr-1 h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                <span className="text-sm font-bold text-black dark:text-white">
                                                    Grubba
                                                </span>
                                            </label>
                                        </div>
                                        {errors.payment_method && (
                                            <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                {errors.payment_method}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                            Payment Status
                                        </label>
                                        <select
                                            value={data.payment_status}
                                            onChange={(e) =>
                                                setData(
                                                    'payment_status',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="paid">Paid</option>
                                            <option value="failed">
                                                Failed
                                            </option>
                                            <option value="refunded">
                                                Refunded
                                            </option>
                                        </select>
                                        {errors.payment_status && (
                                            <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                {errors.payment_status}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <label className="mb-2 block text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                            Transaction ID
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generateTransactionId}
                                            className="rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50"
                                        >
                                            Generate ID
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.mpesa_reference}
                                        onChange={(e) =>
                                            setData(
                                                'mpesa_reference',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 font-mono text-black placeholder-gray-500 focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                        placeholder="Transaction reference"
                                    />
                                    {errors.mpesa_reference && (
                                        <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                            {errors.mpesa_reference}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                    Additional Notes
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                            Kitchen Notes
                                        </label>
                                        <textarea
                                            value={data.kitchen_notes}
                                            onChange={(e) =>
                                                setData(
                                                    'kitchen_notes',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                            placeholder="Special instructions for kitchen staff..."
                                        />
                                        {errors.kitchen_notes && (
                                            <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                {errors.kitchen_notes}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                            Customer Notes
                                        </label>
                                        <textarea
                                            value={data.customer_notes}
                                            onChange={(e) =>
                                                setData(
                                                    'customer_notes',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                            placeholder="Notes from customer..."
                                        />
                                        {errors.customer_notes && (
                                            <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                {errors.customer_notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center space-x-2 rounded-lg bg-red-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.visit(`/pos/${order.id}`)
                                    }
                                    className="flex items-center space-x-2 rounded-lg border-2 border-black px-6 py-3 font-bold text-black shadow-md transition-all hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                Order Items
                            </h2>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                                    >
                                        <div>
                                            <p className="font-bold text-black dark:text-white">
                                                {item.menu_item.name}
                                            </p>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {formatCurrency(
                                                    item.unit_price,
                                                )}{' '}
                                                × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-bold text-red-600 dark:text-red-400">
                                            {formatCurrency(item.item_total)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                Order Total
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Subtotal
                                    </span>
                                    <span className="font-bold text-black dark:text-white">
                                        {formatCurrency(order.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        VAT (0%)
                                    </span>
                                    <span className="font-bold text-black dark:text-white">
                                        {formatCurrency(order.tax_amount)}
                                    </span>
                                </div>
                                <hr className="border-gray-300 dark:border-gray-600" />
                                <div className="flex justify-between text-xl font-bold">
                                    <span className="text-black dark:text-white">
                                        Total
                                    </span>
                                    <span className="text-red-600 dark:text-red-400">
                                        {formatCurrency(order.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
