import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Banknote, Save, Smartphone, X } from 'lucide-react';
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
        } else {
            setData('mpesa_reference', `MPESA-${timestamp}-${randomStr}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Order #${order.order_number}`} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Order #{order.order_number}
                        </h1>
                        <p className="text-gray-600">
                            Modify order details and payment information
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Information */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Customer Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="Customer name"
                                        />
                                        {errors.customer_name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.customer_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="Phone number"
                                        />
                                        {errors.customer_phone && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.customer_phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Order Details
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.order_type}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.order_status}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Payment Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Payment Method
                                        </label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
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
                                                    className="mr-2"
                                                />
                                                <Banknote className="mr-2 h-4 w-4 text-gray-600" />
                                                <span>Cash Payment</span>
                                            </label>
                                            <label className="flex items-center">
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
                                                    className="mr-2"
                                                />
                                                <Smartphone className="mr-2 h-4 w-4 text-gray-600" />
                                                <span>M-Pesa Payment</span>
                                            </label>
                                        </div>
                                        {errors.payment_method && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.payment_method}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.payment_status}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Transaction ID
                                            </label>
                                            <button
                                                type="button"
                                                onClick={generateTransactionId}
                                                className="text-sm text-blue-600 hover:text-blue-800"
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder={
                                                data.payment_method === 'mpesa'
                                                    ? 'M-Pesa transaction ID (e.g., QHR41H9K2C)'
                                                    : 'Cash transaction ID'
                                            }
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            {data.payment_method === 'mpesa'
                                                ? 'Enter the M-Pesa confirmation code provided by the customer'
                                                : 'Auto-generated for cash payments or enter custom reference'}
                                        </p>
                                        {errors.mpesa_reference && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.mpesa_reference}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Notes
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="Special instructions for kitchen staff..."
                                        />
                                        {errors.kitchen_notes && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.kitchen_notes}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="Notes from customer..."
                                        />
                                        {errors.customer_notes && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.customer_notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    className="flex items-center space-x-2 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Order Items (Read-only) */}
                    <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Order Items
                            </h2>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.menu_item.name}
                                            </p>
                                            <p className="text-gray-600">
                                                {formatCurrency(
                                                    item.unit_price,
                                                )}{' '}
                                                × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-semibold">
                                            {formatCurrency(item.item_total)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Order Total
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>
                                        {formatCurrency(order.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (16% VAT)</span>
                                    <span>
                                        {formatCurrency(order.tax_amount)}
                                    </span>
                                </div>
                                <hr />
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-green-600">
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
