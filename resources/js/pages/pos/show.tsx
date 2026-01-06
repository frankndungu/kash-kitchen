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
    if (!order || !order.order_number) {
        return (
            <AppLayout>
                <Head title="Order Not Found" />
                <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
                            Order Not Found
                        </h1>
                        <p className="mt-4 font-medium text-gray-600 dark:text-gray-400">
                            The order you're looking for doesn't exist.
                        </p>
                        <Link
                            href="/pos"
                            className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
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
            href: '#',
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
            pending:
                'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700',
            confirmed:
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700',
            preparing:
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700',
            ready: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700',
            completed:
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600',
            cancelled:
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-700',
        };
        return (
            styles[status as keyof typeof styles] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const styles = {
            pending:
                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-700',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-700',
            refunded:
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600',
        };
        return (
            styles[status as keyof typeof styles] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
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

                <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-black dark:text-white">
                                Order #{order.order_number}
                            </h1>
                            <div className="mt-2 flex items-center space-x-4">
                                <span
                                    className={`inline-flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-bold ${getStatusBadge(order.order_status)}`}
                                >
                                    {getStatusIcon(order.order_status)}
                                    <span className="capitalize">
                                        {order.order_status}
                                    </span>
                                </span>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                    {formatDate(order.created_at)}
                                </span>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handlePrint}
                                className="flex items-center space-x-2 rounded-lg border-2 border-black px-4 py-2 font-bold text-black shadow-md transition-all hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Print Receipt</span>
                            </button>
                            <Link
                                href={`/pos/${order.id}/edit`}
                                className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            >
                                <Edit className="h-4 w-4" />
                                <span>Edit Order</span>
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <div className="border-b-2 border-gray-200 bg-black p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <h2 className="flex items-center text-lg font-bold text-white">
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Order Items ({order.items.length})
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-800 dark:bg-red-900 dark:text-red-200">
                                                            {item.quantity}
                                                        </span>
                                                        <div>
                                                            <h3 className="font-bold text-black dark:text-white">
                                                                {
                                                                    item
                                                                        .menu_item
                                                                        .name
                                                                }
                                                            </h3>
                                                            {item.menu_item
                                                                .description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {
                                                                        item
                                                                            .menu_item
                                                                            .description
                                                                    }
                                                                </p>
                                                            )}
                                                            {item.special_instructions && (
                                                                <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                                    Special:{' '}
                                                                    {
                                                                        item.special_instructions
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        {formatCurrency(
                                                            item.unit_price,
                                                        )}{' '}
                                                        each
                                                    </p>
                                                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                                        {formatCurrency(
                                                            item.item_total,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {(order.kitchen_notes ||
                                        order.customer_notes) && (
                                        <div className="mt-6 space-y-4">
                                            {order.kitchen_notes && (
                                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                                                    <h4 className="font-bold text-blue-800 dark:text-blue-200">
                                                        Kitchen Notes:
                                                    </h4>
                                                    <p className="font-medium text-blue-700 dark:text-blue-300">
                                                        {order.kitchen_notes}
                                                    </p>
                                                </div>
                                            )}
                                            {order.customer_notes && (
                                                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
                                                    <h4 className="font-bold text-green-800 dark:text-green-200">
                                                        Customer Notes:
                                                    </h4>
                                                    <p className="font-medium text-green-700 dark:text-green-300">
                                                        {order.customer_notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 flex items-center text-lg font-bold text-black dark:text-white">
                                    <User className="mr-2 h-5 w-5" />
                                    Customer Information
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                            Order Type
                                        </span>
                                        <p className="font-bold text-black capitalize dark:text-white">
                                            {order.order_type.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                            Customer Name
                                        </span>
                                        <p className="font-bold text-black dark:text-white">
                                            {order.customer_name ||
                                                'Walk-in Customer'}
                                        </p>
                                    </div>
                                    {order.customer_phone && (
                                        <div>
                                            <span className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                                Phone Number
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <p className="font-bold text-black dark:text-white">
                                                    {order.customer_phone}
                                                </p>
                                                <a
                                                    href={`tel:${order.customer_phone}`}
                                                    className="text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <Phone className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 flex items-center text-lg font-bold text-black dark:text-white">
                                    <Package className="mr-2 h-5 w-5" />
                                    Payment Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                            Payment Method
                                        </span>
                                        <span className="font-bold text-black capitalize dark:text-white">
                                            {order.payment_method}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                            Payment Status
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getPaymentStatusBadge(order.payment_status)}`}
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
                                        <div className="rounded-lg border border-gray-200 bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-700">
                                            <p className="text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                                                Transaction ID
                                            </p>
                                            <p className="font-mono font-bold text-black dark:text-white">
                                                {order.mpesa_reference}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
                                    Order Summary
                                </h2>
                                <div className="space-y-3">
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
                                    {order.discount_amount &&
                                        order.discount_amount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                    Discount
                                                </span>
                                                <span className="font-bold text-red-600 dark:text-red-400">
                                                    -
                                                    {formatCurrency(
                                                        order.discount_amount,
                                                    )}
                                                </span>
                                            </div>
                                        )}
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
                            <span>VAT (0%):</span>
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
