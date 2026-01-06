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
        const transactionId =
            data.payment_method === 'cash'
                ? `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                : data.payment_method === 'grubba'
                  ? `GRUBBA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                  : data.mpesa_reference;

        console.log('Processing payment:', {
            orderId: createdOrder?.id,
            paymentMethod: data.payment_method,
            transactionId: transactionId,
            amount: calculateTotal(),
        });

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

    if (orderCreated && createdOrder) {
        return (
            <AppLayout breadcrumbs={paymentBreadcrumbs}>
                <Head title="Process Payment" />

                <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-2xl">
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-6 text-center">
                                <h1 className="mb-2 text-3xl font-bold text-green-600 dark:text-green-400">
                                    Order Created Successfully!
                                </h1>
                                <p className="font-medium text-gray-600 dark:text-gray-400">
                                    Order #{createdOrder.order_number} | Total:{' '}
                                    <span className="font-bold text-red-600 dark:text-red-400">
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </p>
                            </div>

                            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                                <h3 className="mb-3 font-bold text-black dark:text-white">
                                    Order Summary
                                </h3>
                                {cart.map((item) => (
                                    <div
                                        key={item.menu_item_id}
                                        className="flex items-center justify-between border-b border-gray-200 py-2 last:border-b-0 dark:border-gray-600"
                                    >
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {item.name} x{item.quantity}
                                        </span>
                                        <span className="font-bold text-red-600 dark:text-red-400">
                                            {formatCurrency(
                                                item.price * item.quantity,
                                            )}
                                        </span>
                                    </div>
                                ))}
                                <div className="mt-3 border-t border-gray-300 pt-3 dark:border-gray-600">
                                    <div className="flex items-center justify-between text-xl font-bold">
                                        <span className="text-black dark:text-white">
                                            Total:
                                        </span>
                                        <span className="text-red-600 dark:text-red-400">
                                            {formatCurrency(calculateTotal())}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="mb-3 font-bold text-black dark:text-white">
                                    Payment Method
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex cursor-pointer items-center rounded-lg border-2 border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
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
                                            className="mr-3 text-red-600"
                                        />
                                        <div>
                                            <p className="font-bold text-black dark:text-white">
                                                Cash Payment
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Transaction ID will be generated
                                                automatically
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex cursor-pointer items-center rounded-lg border-2 border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
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
                                            className="mr-3 text-red-600"
                                        />
                                        <div>
                                            <p className="font-bold text-black dark:text-white">
                                                M-Pesa Payment
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Customer pays via M-Pesa, enter
                                                transaction ID below
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex cursor-pointer items-center rounded-lg border-2 border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                                        <input
                                            type="radio"
                                            value="grubba"
                                            checked={
                                                data.payment_method === 'grubba'
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'payment_method',
                                                    e.target.value,
                                                )
                                            }
                                            className="mr-3 text-red-600"
                                        />
                                        <div>
                                            <p className="font-bold text-black dark:text-white">
                                                Grubba Payment
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Transaction ID will be generated
                                                automatically
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {data.payment_method === 'mpesa' && (
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
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
                                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Customer will provide this after
                                        completing M-Pesa payment
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-4">
                                <button
                                    onClick={handlePayment}
                                    disabled={
                                        data.payment_method === 'mpesa' &&
                                        !data.mpesa_reference
                                    }
                                    className="flex-1 rounded-lg bg-red-600 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    Complete Payment
                                </button>

                                <button
                                    onClick={resetOrder}
                                    className="rounded-lg border-2 border-black px-6 py-3 font-bold text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
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

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <div className="flex-1 p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-black dark:text-white">
                                New Order
                            </h1>
                            <p className="font-medium text-gray-600 dark:text-gray-400">
                                Cashier: {user.name}
                            </p>
                        </div>
                        {selectedCategory && (
                            <button
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setMenuItems([]);
                                }}
                                className="flex items-center font-bold text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Categories
                            </button>
                        )}
                    </div>

                    {!selectedCategory ? (
                        <div>
                            <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                                Select Category
                            </h2>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            loadMenuItems(category.id)
                                        }
                                        className="rounded-xl border-2 border-gray-300 bg-white p-6 text-center transition-all hover:border-red-500 hover:bg-red-50 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:hover:border-red-400 dark:hover:bg-red-900/20"
                                    >
                                        <h3 className="text-lg font-bold text-black dark:text-white">
                                            {category.name}
                                        </h3>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                                {selectedCategoryName}
                            </h2>

                            {loadingItems ? (
                                <div className="py-12 text-center">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
                                    <p className="mt-2 font-medium text-gray-600 dark:text-gray-400">
                                        Loading menu items...
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {menuItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-red-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-red-600"
                                        >
                                            <div className="mb-2 flex items-start justify-between">
                                                <h3 className="font-bold text-black dark:text-white">
                                                    {item.name}
                                                </h3>
                                                {item.is_combo && (
                                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        Combo
                                                    </span>
                                                )}
                                            </div>

                                            {item.description && (
                                                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                                                    {item.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                                        {formatCurrency(
                                                            item.price,
                                                        )}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
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
                                                    className="flex items-center rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
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

                <div className="w-96 border-l-2 border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-6 flex items-center">
                        <ShoppingCart className="mr-2 h-6 w-6 text-red-600 dark:text-red-400" />
                        <h2 className="text-lg font-bold text-black dark:text-white">
                            Order Details
                        </h2>
                    </div>

                    <form onSubmit={handleCreateOrder} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Order Type
                            </label>
                            <select
                                value={data.order_type}
                                onChange={(e) =>
                                    setData('order_type', e.target.value)
                                }
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="dine_in">Dine In</option>
                                <option value="takeaway">Takeaway</option>
                                <option value="delivery">Delivery</option>
                            </select>
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Customer Name"
                                value={data.customer_name}
                                onChange={(e) =>
                                    setData('customer_name', e.target.value)
                                }
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
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
                                        className="mr-2 text-red-600"
                                        required
                                    />
                                    <span className="text-sm font-medium text-black dark:text-white">
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
                                        className="mr-2 text-red-600"
                                        required
                                    />
                                    <span className="text-sm font-medium text-black dark:text-white">
                                        M-Pesa Payment
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="grubba"
                                        checked={
                                            data.payment_method === 'grubba'
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'payment_method',
                                                e.target.value,
                                            )
                                        }
                                        className="mr-2 text-red-600"
                                        required
                                    />
                                    <span className="text-sm font-medium text-black dark:text-white">
                                        Grubba Payment
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="border-t-2 border-gray-200 pt-4 dark:border-gray-700">
                            <h3 className="mb-3 font-bold text-black dark:text-white">
                                Order Items
                            </h3>

                            {cart.length === 0 ? (
                                <p className="py-8 text-center font-medium text-gray-500 dark:text-gray-400">
                                    Select items from the menu to start an order
                                </p>
                            ) : (
                                <div className="max-h-60 space-y-3 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div
                                            key={item.menu_item_id}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-black dark:text-white">
                                                    {item.name}
                                                </p>
                                                <p className="font-bold text-red-600 dark:text-red-400">
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
                                                    className="rounded p-1 text-red-600 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>

                                                <span className="min-w-8 text-center font-bold text-black dark:text-white">
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
                                                    className="rounded p-1 text-green-600 transition-colors hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {cart.length > 0 && (
                                <div className="mt-4 border-t-2 border-gray-300 pt-4 dark:border-gray-600">
                                    <div className="flex items-center justify-between text-xl font-bold">
                                        <span className="text-black dark:text-white">
                                            Total:
                                        </span>
                                        <span className="text-red-600 dark:text-red-400">
                                            {formatCurrency(calculateTotal())}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={cart.length === 0 || processing}
                            className="w-full rounded-lg bg-red-600 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            {processing ? 'Creating Order...' : 'Create Order'}
                        </button>

                        <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                            Payment will be processed after order creation
                        </p>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
