import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    Edit,
    Package,
    Phone,
    Printer,
    ShoppingCart,
    User,
    XCircle,
} from 'lucide-react';

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

interface ShowProps {
    user: {
        name: string;
        email: string;
    };
    order: Order;
}

export default function Show({ user, order }: ShowProps) {
    // Safely handle order data
    if (!order || !order.order_number) {
        return (
            <AppLayout>
                <Head title="Order Not Found" />
                <div className="p-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600">
                            Order Not Found
                        </h1>
                        <p className="mt-2 text-gray-600">
                            The order you're looking for doesn't exist.
                        </p>
                        <Link
                            href="/pos"
                            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Back to Orders
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'POS System',
            href: '/pos',
        },
        {
            title: `Order #${order.order_number}`,
            href: `#`,
        },
    ];

    const formatCurrency = (amount: number | null | undefined) => {
        const numericAmount = Number(amount) || 0;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparing: 'bg-orange-100 text-orange-800',
            ready: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        return (
            styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-orange-100 text-orange-800',
            paid: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800',
        };

        return (
            styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'preparing':
                return <ShoppingCart className="h-4 w-4" />;
            case 'ready':
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #receipt-content, #receipt-content * {
                        visibility: visible;
                    }
                    #receipt-content {
                        position: absolute;
                        left: 50%;
                        top: 0;
                        transform: translateX(-50%);
                        width: 80mm;
                        padding: 10mm;
                    }
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                }
            `}</style>

            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Order #${order.order_number}`} />

                <div className="p-6">
                    {/* Header - Hidden on print */}
                    <div className="mb-6 flex items-center justify-between print:hidden">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Order #{order.order_number}
                            </h1>
                            <p className="text-gray-600">
                                Placed on {formatDate(order.created_at)}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handlePrint}
                                className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Print Receipt</span>
                            </button>
                            <Link
                                href={`/pos/${order.id}/edit`}
                                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                <Edit className="h-4 w-4" />
                                <span>Edit Order</span>
                            </Link>
                            <Link
                                href="/pos"
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                Back to Orders
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Order Details */}
                        <div className="lg:col-span-2">
                            {/* Order Status */}
                            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Order Status
                                </h2>
                                <div className="flex items-center space-x-4">
                                    <span
                                        className={`inline-flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium ${getStatusBadge(order.order_status)}`}
                                    >
                                        {getStatusIcon(order.order_status)}
                                        <span className="capitalize">
                                            {order.order_status}
                                        </span>
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Type:{' '}
                                        <span className="capitalize">
                                            {order.order_type.replace('_', ' ')}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Order Items
                                </h2>
                                <div className="space-y-4">
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between border-b pb-4 last:border-b-0"
                                            >
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">
                                                        {item.menu_item?.name ||
                                                            'Unknown Item'}
                                                    </h3>
                                                    {item.menu_item
                                                        ?.description && (
                                                        <p className="text-sm text-gray-600">
                                                            {
                                                                item.menu_item
                                                                    .description
                                                            }
                                                        </p>
                                                    )}
                                                    {item.special_instructions && (
                                                        <p className="text-sm text-blue-600">
                                                            Note:{' '}
                                                            {
                                                                item.special_instructions
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">
                                                        {formatCurrency(
                                                            item.unit_price,
                                                        )}{' '}
                                                        × {item.quantity}
                                                    </p>
                                                    <p className="font-semibold text-gray-900">
                                                        {formatCurrency(
                                                            item.item_total,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500">
                                            No items found in this order
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {(order.kitchen_notes || order.customer_notes) && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6">
                                    <h2 className="mb-4 text-lg font-semibold">
                                        Notes
                                    </h2>
                                    {order.kitchen_notes && (
                                        <div className="mb-4">
                                            <h3 className="font-medium text-gray-700">
                                                Kitchen Notes:
                                            </h3>
                                            <p className="text-gray-600">
                                                {order.kitchen_notes}
                                            </p>
                                        </div>
                                    )}
                                    {order.customer_notes && (
                                        <div>
                                            <h3 className="font-medium text-gray-700">
                                                Customer Notes:
                                            </h3>
                                            <p className="text-gray-600">
                                                {order.customer_notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Customer Information */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 flex items-center text-lg font-semibold">
                                    <User className="mr-2 h-5 w-5" />
                                    Customer Information
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Name
                                        </p>
                                        <p className="text-gray-900">
                                            {order.customer_name ||
                                                'Walk-in Customer'}
                                        </p>
                                    </div>
                                    {order.customer_phone && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Phone
                                            </p>
                                            <p className="flex items-center text-gray-900">
                                                <Phone className="mr-1 h-4 w-4" />
                                                {order.customer_phone}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 flex items-center text-lg font-semibold">
                                    <Package className="mr-2 h-5 w-5" />
                                    Payment Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">
                                            Payment Method
                                        </span>
                                        <span className="font-medium capitalize">
                                            {order.payment_method}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">
                                            Payment Status
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusBadge(order.payment_status)}`}
                                        >
                                            {order.payment_status ===
                                                'paid' && (
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                            )}
                                            {order.payment_status ===
                                                'pending' && (
                                                <Clock className="mr-1 h-3 w-3" />
                                            )}
                                            <span className="capitalize">
                                                {order.payment_status}
                                            </span>
                                        </span>
                                    </div>
                                    {order.mpesa_reference && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Transaction ID
                                            </p>
                                            <p className="font-mono text-sm text-gray-900">
                                                {order.mpesa_reference}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Order Summary
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Subtotal
                                        </span>
                                        <span>
                                            {formatCurrency(order.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Tax (16% VAT)
                                        </span>
                                        <span>
                                            {formatCurrency(order.tax_amount)}
                                        </span>
                                    </div>
                                    {order.discount_amount &&
                                        order.discount_amount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Discount
                                                </span>
                                                <span className="text-red-600">
                                                    -
                                                    {formatCurrency(
                                                        order.discount_amount,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    <hr />
                                    <div className="flex justify-between text-lg font-bold">
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

                {/* Print-only Receipt */}
                <div id="receipt-content" className="hidden print:block">
                    <div className="text-center">
                        <h1 className="text-xl font-bold">KASH KITCHEN</h1>
                        <p className="text-xs">Nyeri, Kenya</p>
                        <div className="my-3 border-t-2 border-dashed border-gray-400"></div>
                    </div>

                    <div className="mb-3 text-xs">
                        <p>Order: #{order.order_number}</p>
                        <p>Date: {formatDate(order.created_at)}</p>
                        <p>
                            Type:{' '}
                            {order.order_type.replace('_', ' ').toUpperCase()}
                        </p>
                        {order.customer_name && (
                            <p>Customer: {order.customer_name}</p>
                        )}
                    </div>

                    <div className="my-3 border-t-2 border-dashed border-gray-400"></div>

                    <div className="mb-3">
                        {order.items.map((item) => (
                            <div key={item.id} className="mb-2 text-xs">
                                <div className="flex justify-between font-medium">
                                    <span>
                                        {item.quantity}x {item.menu_item.name}
                                    </span>
                                    <span>
                                        {formatCurrency(item.item_total)}
                                    </span>
                                </div>
                                {item.special_instructions && (
                                    <div className="text-xs text-gray-600 italic">
                                        * {item.special_instructions}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="my-3 border-t-2 border-dashed border-gray-400"></div>

                    <div className="mb-3 text-xs">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (16%):</span>
                            <span>{formatCurrency(order.tax_amount)}</span>
                        </div>
                        <div className="my-2 border-t border-gray-400"></div>
                        <div className="flex justify-between text-sm font-bold">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>

                    <div className="my-3 border-t-2 border-dashed border-gray-400"></div>

                    <div className="mb-3 text-xs">
                        <div className="flex justify-between">
                            <span>Payment:</span>
                            <span className="uppercase">
                                {order.payment_method}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="uppercase">
                                {order.payment_status}
                            </span>
                        </div>
                        {order.mpesa_reference && (
                            <div className="mt-1">
                                <p className="font-mono text-xs">
                                    Ref: {order.mpesa_reference}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="my-3 border-t-2 border-dashed border-gray-400"></div>

                    <div className="text-center text-xs">
                        <p className="font-medium">Thank you for your visit!</p>
                        <p className="mt-2">Served by: {user.name}</p>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
