import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Clock, Minus, Plus, ShoppingCart } from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'POS System',
        href: '/pos',
    },
    {
        title: 'New Order',
        href: '/pos/create',
    },
];

const paymentBreadcrumbs: BreadcrumbItem[] = [
    {
        title: 'POS System',
        href: '/pos',
    },
    {
        title: 'New Order',
        href: '/pos/create',
    },
    {
        title: 'Process Payment',
        href: '#',
    },
];

interface MenuItem {
    id: number;
    name: string;
    price: number;
    description?: string;
    is_combo: boolean;
    preparation_time_minutes: number;
    image_url?: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface CartItem {
    menu_item_id: number;
    name: string;
    price: number;
    quantity: number;
    special_instructions?: string;
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
    items: Array<{
        id: number;
        quantity: number;
        unit_price: number;
        item_total: number;
        menu_item: MenuItem;
    }>;
}

interface CreateOrderProps {
    user: { name: string; email: string };
    categories: Category[];
    orderTypes: string[];
    paymentMethods: string[];
}

export default function CreateOrder({
    user,
    categories,
    orderTypes,
    paymentMethods,
}: CreateOrderProps) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderCreated, setOrderCreated] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        order_type: 'dine_in',
        customer_name: '',
        customer_phone: '',
        payment_method: 'cash',
        mpesa_reference: '',
        items: [] as Array<{
            menu_item_id: number;
            quantity: number;
            special_instructions?: string;
        }>,
    });

    const loadMenuItems = async (categoryId: number) => {
        setLoadingItems(true);
        try {
            const response = await fetch(`/pos/menu-items/${categoryId}`);
            const responseData = await response.json();
            setMenuItems(responseData.menu_items);
            setSelectedCategory(categoryId);
        } catch (error) {
            console.error('Failed to load menu items:', error);
        } finally {
            setLoadingItems(false);
        }
    };

    const addToCart = (menuItem: MenuItem) => {
        const existingItem = cart.find(
            (item) => item.menu_item_id === menuItem.id,
        );

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.menu_item_id === menuItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                ),
            );
        } else {
            setCart([
                ...cart,
                {
                    menu_item_id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: 1,
                },
            ]);
        }
    };

    const updateQuantity = (menuItemId: number, newQuantity: number) => {
        if (newQuantity === 0) {
            setCart(cart.filter((item) => item.menu_item_id !== menuItemId));
        } else {
            setCart(
                cart.map((item) =>
                    item.menu_item_id === menuItemId
                        ? { ...item, quantity: newQuantity }
                        : item,
                ),
            );
        }
    };

    const calculateTotal = () => {
        return cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0,
        );
    };

    const handleCreateOrder = (e: React.FormEvent) => {
        e.preventDefault();

        const orderItems = cart.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            special_instructions: item.special_instructions,
        }));

        // Submit using router.post to avoid TypeScript issues
        const formData = {
            order_type: data.order_type,
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            payment_method: data.payment_method,
            items: orderItems,
        };

        router.post('/pos', formData, {
            onSuccess: (page) => {
                console.log('Order creation successful:', page.props);
                setOrderCreated(true);
                setCreatedOrder(page.props.order as Order);
            },
            onError: (errors) => {
                console.error('Order creation failed:', errors);
            },
        });
    };

    const handlePayment = () => {
        // Generate transaction ID for cash payments
        const transactionId =
            data.payment_method === 'cash'
                ? `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                : data.mpesa_reference;

        // Update order with payment details
        // This would be a separate API call to update payment status
        console.log('Processing payment:', {
            orderId: createdOrder?.id,
            paymentMethod: data.payment_method,
            transactionId: transactionId,
            amount: calculateTotal(),
        });

        // For demo purposes, we'll simulate payment success
        alert(
            `Payment processed successfully! Transaction ID: ${transactionId}`,
        );
    };

    const resetOrder = () => {
        setCart([]);
        setOrderCreated(false);
        setCreatedOrder(null);
        setSelectedCategory(null);
        setMenuItems([]);
        setData({
            order_type: 'dine_in',
            customer_name: '',
            customer_phone: '',
            payment_method: 'cash',
            mpesa_reference: '',
            items: [],
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const selectedCategoryName = categories.find(
        (cat) => cat.id === selectedCategory,
    )?.name;

    // If order is created, show payment interface
    if (orderCreated && createdOrder) {
        return (
            <AppLayout breadcrumbs={paymentBreadcrumbs}>
                <Head title="Process Payment" />

                <div className="min-h-screen bg-gray-100 p-6">
                    <div className="mx-auto max-w-2xl">
                        <div className="rounded-lg bg-white p-6">
                            <div className="mb-6 text-center">
                                <h1 className="mb-2 text-2xl font-bold text-green-600">
                                    Order Created Successfully!
                                </h1>
                                <p className="text-gray-600">
                                    Order #{createdOrder.order_number} | Total:{' '}
                                    {formatCurrency(calculateTotal())}
                                </p>
                            </div>

                            {/* Order Summary */}
                            <div className="mb-6 rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-3 font-semibold">
                                    Order Summary
                                </h3>
                                {cart.map((item) => (
                                    <div
                                        key={item.menu_item_id}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <span>
                                            {item.name} x{item.quantity}
                                        </span>
                                        <span className="font-semibold">
                                            {formatCurrency(
                                                item.price * item.quantity,
                                            )}
                                        </span>
                                    </div>
                                ))}
                                <div className="mt-2 border-t pt-2">
                                    <div className="flex items-center justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(calculateTotal())}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mb-6">
                                <h3 className="mb-3 font-semibold">
                                    Payment Method
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            value="cash"
                                            checked={
                                                data.payment_method === 'cash'
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'payment_method',
                                                    e.target.value,
                                                )
                                            }
                                            className="mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">
                                                Cash Payment
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Transaction ID will be generated
                                                automatically
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            value="mpesa"
                                            checked={
                                                data.payment_method === 'mpesa'
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'payment_method',
                                                    e.target.value,
                                                )
                                            }
                                            className="mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">
                                                M-Pesa Payment
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Customer pays via M-Pesa, enter
                                                transaction ID below
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* M-Pesa Transaction ID Input */}
                            {data.payment_method === 'mpesa' && (
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        M-Pesa Transaction ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter M-Pesa transaction ID (e.g., QHR41H9K2C)"
                                        value={data.mpesa_reference}
                                        onChange={(e) =>
                                            setData(
                                                'mpesa_reference',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Customer will provide this after
                                        completing M-Pesa payment
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={handlePayment}
                                    disabled={
                                        data.payment_method === 'mpesa' &&
                                        !data.mpesa_reference
                                    }
                                    className="flex-1 rounded-lg bg-green-600 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Complete Payment
                                </button>

                                <button
                                    onClick={resetOrder}
                                    className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
                                >
                                    New Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Order" />

            <div className="flex h-screen bg-gray-100">
                {/* Main Menu Area */}
                <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                New Order
                            </h1>
                            <p className="text-gray-600">
                                Cashier: {user.name}
                            </p>
                        </div>
                        {selectedCategory && (
                            <button
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setMenuItems([]);
                                }}
                                className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Categories
                            </button>
                        )}
                    </div>

                    {/* Categories or Menu Items */}
                    {!selectedCategory ? (
                        <div>
                            <h2 className="mb-4 text-lg font-semibold">
                                Select Category
                            </h2>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            loadMenuItems(category.id)
                                        }
                                        className="rounded-xl border-2 border-gray-200 p-4 text-center transition-colors hover:border-blue-500 hover:bg-blue-50"
                                    >
                                        <h3 className="font-semibold text-gray-900">
                                            {category.name}
                                        </h3>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="mb-4 text-lg font-semibold">
                                {selectedCategoryName}
                            </h2>

                            {loadingItems ? (
                                <div className="py-12 text-center">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                    <p className="mt-2 text-gray-600">
                                        Loading menu items...
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {menuItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                                        >
                                            <div className="mb-2 flex items-start justify-between">
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.name}
                                                </h3>
                                                {item.is_combo && (
                                                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">
                                                        Combo
                                                    </span>
                                                )}
                                            </div>

                                            {item.description && (
                                                <p className="mb-3 text-sm text-gray-600">
                                                    {item.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-lg font-bold text-green-600">
                                                        {formatCurrency(
                                                            item.price,
                                                        )}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {
                                                            item.preparation_time_minutes
                                                        }{' '}
                                                        min
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        addToCart(item)
                                                    }
                                                    className="flex items-center rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                                                >
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Order Details Sidebar */}
                <div className="w-96 border-l border-gray-200 bg-white p-6">
                    <div className="mb-6 flex items-center">
                        <ShoppingCart className="mr-2 h-6 w-6 text-gray-700" />
                        <h2 className="text-lg font-semibold">Order Details</h2>
                    </div>

                    <form onSubmit={handleCreateOrder} className="space-y-4">
                        {/* Order Type */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Order Type
                            </label>
                            <select
                                value={data.order_type}
                                onChange={(e) =>
                                    setData('order_type', e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            >
                                <option value="dine_in">Dine In</option>
                                <option value="takeaway">Takeaway</option>
                                <option value="delivery">Delivery</option>
                            </select>
                        </div>

                        {/* Customer Details */}
                        <div>
                            <input
                                type="text"
                                placeholder="Customer Name"
                                value={data.customer_name}
                                onChange={(e) =>
                                    setData('customer_name', e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={data.customer_phone}
                                onChange={(e) =>
                                    setData('customer_phone', e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Payment Method
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="cash"
                                        checked={data.payment_method === 'cash'}
                                        onChange={(e) =>
                                            setData(
                                                'payment_method',
                                                e.target.value,
                                            )
                                        }
                                        className="mr-2"
                                        required
                                    />
                                    <span className="text-sm">
                                        Cash Payment
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="mpesa"
                                        checked={
                                            data.payment_method === 'mpesa'
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'payment_method',
                                                e.target.value,
                                            )
                                        }
                                        className="mr-2"
                                        required
                                    />
                                    <span className="text-sm">
                                        M-Pesa Payment
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="border-t pt-4">
                            <h3 className="mb-3 font-medium">Order Items</h3>

                            {cart.length === 0 ? (
                                <p className="py-8 text-center text-gray-500">
                                    Select items from the menu to start an order
                                </p>
                            ) : (
                                <div className="max-h-60 space-y-3 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div
                                            key={item.menu_item_id}
                                            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {item.name}
                                                </p>
                                                <p className="font-semibold text-green-600">
                                                    {formatCurrency(item.price)}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.menu_item_id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="rounded p-1 text-red-600 hover:bg-red-100"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>

                                                <span className="min-w-8 text-center font-medium">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.menu_item_id,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="rounded p-1 text-green-600 hover:bg-green-100"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Total */}
                            {cart.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                    <div className="flex items-center justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(calculateTotal())}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={cart.length === 0 || processing}
                            className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Creating Order...' : 'Create Order'}
                        </button>

                        <p className="text-center text-xs text-gray-500">
                            Payment will be processed after order creation
                        </p>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
