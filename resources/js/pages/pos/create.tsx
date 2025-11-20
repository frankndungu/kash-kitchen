import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    DollarSign,
    MapPin,
    Minus,
    Phone,
    Plus,
    ShoppingCart,
    Trash2,
    User,
} from 'lucide-react';
import { useState } from 'react';

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

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon: string;
    activeMenuItems: MenuItem[];
}

interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string | null;
    is_combo: boolean;
    requires_kitchen: boolean;
    preparation_time_minutes: number;
}

interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    special_instructions?: string;
}

interface CreateOrderProps {
    user: {
        name: string;
        email: string;
    };
    categories: Category[];
    orderTypes: string[];
    paymentMethods: string[];
}

export default function Create({
    user,
    categories,
    orderTypes,
    paymentMethods,
}: CreateOrderProps) {
    const [activeCategory, setActiveCategory] = useState(
        categories[0]?.id || 0,
    );
    const [cart, setCart] = useState<CartItem[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        order_type: 'dine_in',
        customer_name: '',
        customer_phone: '',
        table_number: '',
        payment_method: 'cash',
        items: [] as Array<{
            menu_item_id: number;
            quantity: number;
            special_instructions: string;
        }>,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const addToCart = (menuItem: MenuItem) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (item) => item.menuItem.id === menuItem.id,
            );
            if (existingItem) {
                return prevCart.map((item) =>
                    item.menuItem.id === menuItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            } else {
                return [...prevCart, { menuItem, quantity: 1 }];
            }
        });
    };

    const updateCartQuantity = (menuItemId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(menuItemId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.menuItem.id === menuItemId
                    ? { ...item, quantity: newQuantity }
                    : item,
            ),
        );
    };

    const removeFromCart = (menuItemId: number) => {
        setCart((prevCart) =>
            prevCart.filter((item) => item.menuItem.id !== menuItemId),
        );
    };

    const getCartTotal = () => {
        const subtotal = cart.reduce(
            (total, item) => total + item.menuItem.price * item.quantity,
            0,
        );
        const tax = subtotal * 0.16; // 16% VAT
        return { subtotal, tax, total: subtotal + tax };
    };

    const submitOrder = () => {
        const orderItems = cart.map((item) => ({
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            special_instructions: item.special_instructions || '',
        }));

        // update the form data with items, then submit
        setData('items', orderItems);

        post('/pos', {
            onSuccess: () => {
                setCart([]);
                reset();
            },
        });
    };

    const activeMenuItems =
        categories.find((cat) => cat.id === activeCategory)?.activeMenuItems ||
        [];
    const totals = getCartTotal();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order" />

            <div className="p-4">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/pos"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">
                            New Order
                        </h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        Cashier: {user.name}
                    </div>
                </div>

                <div className="flex h-full gap-4">
                    {/* Left Panel - Menu */}
                    <div className="flex-1 rounded-xl border border-sidebar-border/70 bg-white">
                        {/* Category Tabs */}
                        <div className="border-b p-4">
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            setActiveCategory(category.id)
                                        }
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                            activeCategory === category.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Menu Items Grid */}
                        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
                            {activeMenuItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                                    onClick={() => addToCart(item)}
                                >
                                    <div className="mb-2">
                                        <h3 className="font-medium text-gray-900">
                                            {item.name}
                                        </h3>
                                        <p className="line-clamp-2 text-sm text-gray-500">
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-green-600">
                                            {formatCurrency(item.price)}
                                        </span>
                                        {item.requires_kitchen && (
                                            <div className="flex items-center text-xs text-orange-600">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {item.preparation_time_minutes}m
                                            </div>
                                        )}
                                    </div>
                                    {item.is_combo && (
                                        <span className="mt-1 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                            Combo
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Cart & Checkout */}
                    <div className="w-96 rounded-xl border border-sidebar-border/70 bg-white">
                        <div className="border-b p-4">
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">
                                    Order Details
                                </h2>
                            </div>
                        </div>

                        {/* Order Type Selection */}
                        <div className="border-b p-4">
                            <label className="mb-2 block text-sm font-medium">
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

                        {/* Customer Info */}
                        <div className="border-b p-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Customer Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.customer_name}
                                            onChange={(e) =>
                                                setData(
                                                    'customer_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10"
                                            placeholder="Enter name (optional)"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.customer_phone}
                                            onChange={(e) =>
                                                setData(
                                                    'customer_phone',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10"
                                            placeholder="0712345678"
                                        />
                                    </div>
                                </div>

                                {data.order_type === 'dine_in' && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Table Number
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={data.table_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'table_number',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10"
                                                placeholder="Table 1"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="max-h-64 overflow-y-auto p-4">
                            {cart.length === 0 ? (
                                <p className="py-8 text-center text-gray-500">
                                    Select items from the menu to start an order
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div
                                            key={item.menuItem.id}
                                            className="flex items-center justify-between rounded border p-2"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-medium">
                                                    {item.menuItem.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {formatCurrency(
                                                        item.menuItem.price,
                                                    )}{' '}
                                                    each
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        updateCartQuantity(
                                                            item.menuItem.id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateCartQuantity(
                                                            item.menuItem.id,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.menuItem.id,
                                                        )
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Order Summary & Checkout */}
                        {cart.length > 0 && (
                            <div className="border-t p-4">
                                <div className="mb-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>
                                            {formatCurrency(totals.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>VAT (16%):</span>
                                        <span>
                                            {formatCurrency(totals.tax)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                        <span>Total:</span>
                                        <span>
                                            {formatCurrency(totals.total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium">
                                        Payment Method
                                    </label>
                                    <select
                                        value={data.payment_method}
                                        onChange={(e) =>
                                            setData(
                                                'payment_method',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="mpesa">M-Pesa</option>
                                    </select>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={submitOrder}
                                    disabled={processing || cart.length === 0}
                                    className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    <DollarSign className="h-4 w-4" />
                                    <span>
                                        {processing
                                            ? 'Processing...'
                                            : `Confirm Order (${formatCurrency(totals.total)})`}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
