import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    CreditCard,
    DollarSign,
    Download,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales Analytics',
        href: '#',
    },
];

interface SalesStats {
    today: {
        revenue: number;
        orders: number;
        average_order: number;
    };
    week: {
        revenue: number;
        orders: number;
        growth: number;
    };
    month: {
        revenue: number;
        orders: number;
        growth: number;
    };
}

interface TopItem {
    name: string;
    quantity_sold: number;
    revenue: number;
    price: number;
}

interface PaymentBreakdown {
    cash: {
        amount: number;
        percentage: number;
        count: number;
    };
    mpesa: {
        amount: number;
        percentage: number;
        count: number;
    };
}

interface RecentOrder {
    id: number;
    order_number: string;
    customer_name: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    order_status: string;
}

interface SalesAnalyticsProps {
    user: {
        name: string;
        email: string;
    };
    salesStats: SalesStats;
    topItems: TopItem[];
    paymentBreakdown: PaymentBreakdown;
    recentOrders: RecentOrder[];
}

export default function SalesAnalytics({
    user,
    salesStats,
    topItems,
    paymentBreakdown,
    recentOrders,
}: SalesAnalyticsProps) {
    const formatCurrency = (amount: number | null | undefined) => {
        const numericAmount = Number(amount) || 0;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getGrowthColor = (growth: number) => {
        if (growth > 0) return 'text-green-600 dark:text-green-400';
        if (growth < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700';
            case 'preparing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700';
            case 'ready':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700';
            case 'completed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600';
            default:
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700';
        }
    };

    // CSV Export functionality
    const exportToCSV = () => {
        try {
            const currentDate = new Date().toLocaleDateString('en-KE');

            // Prepare CSV data
            const csvContent = [
                // Sales Summary
                ['Kash Kitchen - Sales Analytics Report'],
                [`Generated: ${currentDate}`],
                [''],

                // Sales Statistics
                ['SALES SUMMARY'],
                ['Period', 'Revenue (KES)', 'Orders', 'Growth %'],
                [
                    'Today',
                    salesStats.today.revenue.toFixed(2),
                    salesStats.today.orders.toString(),
                    'N/A',
                ],
                [
                    'This Week',
                    salesStats.week.revenue.toFixed(2),
                    salesStats.week.orders.toString(),
                    salesStats.week.growth.toFixed(1) + '%',
                ],
                [
                    'This Month',
                    salesStats.month.revenue.toFixed(2),
                    salesStats.month.orders.toString(),
                    salesStats.month.growth.toFixed(1) + '%',
                ],
                [''],

                // Payment Breakdown
                ['PAYMENT METHODS'],
                ['Method', 'Amount (KES)', 'Percentage', 'Count'],
                [
                    'Cash',
                    paymentBreakdown.cash.amount.toFixed(2),
                    paymentBreakdown.cash.percentage.toFixed(1) + '%',
                    paymentBreakdown.cash.count.toString(),
                ],
                [
                    'M-Pesa',
                    paymentBreakdown.mpesa.amount.toFixed(2),
                    paymentBreakdown.mpesa.percentage.toFixed(1) + '%',
                    paymentBreakdown.mpesa.count.toString(),
                ],
                [''],

                // Top Selling Items
                ['TOP SELLING ITEMS'],
                [
                    'Rank',
                    'Item Name',
                    'Quantity Sold',
                    'Revenue (KES)',
                    'Unit Price (KES)',
                ],
                ...topItems.map((item, index) => [
                    (index + 1).toString(),
                    item.name,
                    item.quantity_sold.toString(),
                    item.revenue.toFixed(2),
                    item.price.toFixed(2),
                ]),
                [''],

                // Recent Orders
                ['RECENT ORDERS'],
                [
                    'Order Number',
                    'Customer',
                    'Amount (KES)',
                    'Payment Method',
                    'Status',
                    'Date',
                ],
                ...recentOrders.map((order) => [
                    order.order_number,
                    order.customer_name || 'Walk-in',
                    order.total_amount.toFixed(2),
                    order.payment_method === 'cash' ? 'Cash' : 'M-Pesa',
                    order.order_status.charAt(0).toUpperCase() +
                        order.order_status.slice(1),
                    new Date(order.created_at).toLocaleDateString('en-KE'),
                ]),
            ];

            // Convert to CSV string
            const csvString = csvContent
                .map((row) => row.map((field) => `"${field}"`).join(','))
                .join('\n');

            // Create and download file
            const blob = new Blob([csvString], {
                type: 'text/csv;charset=utf-8;',
            });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute(
                    'download',
                    `kash-kitchen-sales-analytics-${new Date().toISOString().split('T')[0]}.csv`,
                );
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Error exporting data. Please try again.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Analytics - Dashboard" />

            <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black dark:text-white">
                            Sales Analytics
                        </h1>
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                            Revenue insights and performance metrics for Kash
                            Kitchen
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export CSV</span>
                        </button>
                        <Link
                            href="/pos"
                            className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>POS System</span>
                        </Link>
                        <Link
                            href="/inventory"
                            className="flex items-center space-x-2 rounded-lg border-2 border-black px-4 py-2 font-bold text-black shadow-md transition-all hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                        >
                            <Package className="h-4 w-4" />
                            <span>Inventory</span>
                        </Link>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Today's Revenue
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {formatCurrency(salesStats.today.revenue)}
                                </p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {salesStats.today.orders} orders
                                </p>
                            </div>
                            <DollarSign className="text-black-600 dark:text-black-400 h-8 w-8" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    This Week
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {formatCurrency(salesStats.week.revenue)}
                                </p>
                                <p
                                    className={`text-sm font-medium ${getGrowthColor(salesStats.week.growth)}`}
                                >
                                    {salesStats.week.growth > 0 ? '+' : ''}
                                    {salesStats.week.growth.toFixed(1)}% vs last
                                    week
                                </p>
                            </div>
                            <TrendingUp className="text-black-600 dark:text-black-400 h-8 w-8" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    This Month
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {formatCurrency(salesStats.month.revenue)}
                                </p>
                                <p
                                    className={`text-sm font-medium ${getGrowthColor(salesStats.month.growth)}`}
                                >
                                    {salesStats.month.growth > 0 ? '+' : ''}
                                    {salesStats.month.growth.toFixed(1)}% vs
                                    last month
                                </p>
                            </div>
                            <Calendar className="text-black-600 dark:text-black-400 h-8 w-8" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Average Order
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {formatCurrency(
                                        salesStats.today.average_order,
                                    )}
                                </p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Today's average
                                </p>
                            </div>
                            <Users className="text-black-600 dark:text-black-400 h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Payment Breakdown */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-4 flex items-center text-lg font-bold text-black dark:text-white">
                                <CreditCard className="mr-2 h-5 w-5" />
                                Payment Methods
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="mr-3 h-4 w-4 rounded bg-green-500"></div>
                                        <span className="text-sm font-bold text-black dark:text-white">
                                            Cash
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-600 dark:text-red-400">
                                            {formatCurrency(
                                                paymentBreakdown.cash.amount,
                                            )}
                                        </div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {paymentBreakdown.cash.percentage.toFixed(
                                                1,
                                            )}
                                            %
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="mr-3 h-4 w-4 rounded bg-blue-500"></div>
                                        <span className="text-sm font-bold text-black dark:text-white">
                                            M-Pesa
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(
                                                paymentBreakdown.mpesa.amount,
                                            )}
                                        </div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {paymentBreakdown.mpesa.percentage.toFixed(
                                                1,
                                            )}
                                            %
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Chart */}
                                <div className="mt-4">
                                    <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{
                                                width: `${paymentBreakdown.cash.percentage}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mt-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {paymentBreakdown.cash.count} cash •{' '}
                                    {paymentBreakdown.mpesa.count} M-Pesa
                                    transactions
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Selling Items */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b-2 border-gray-200 bg-black p-4 dark:border-gray-700 dark:bg-gray-900">
                                <h2 className="flex items-center text-lg font-bold text-white">
                                    <Package className="mr-2 h-5 w-5" />
                                    Top Selling Items
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Item
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Quantity Sold
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Revenue
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                                Unit Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {topItems.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-800 dark:bg-red-900 dark:text-red-200">
                                                            {index + 1}
                                                        </div>
                                                        <div className="font-bold text-black dark:text-white">
                                                            {item.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-black dark:text-white">
                                                        {item.quantity_sold}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                                        {formatCurrency(
                                                            item.revenue,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-black dark:text-white">
                                                        {formatCurrency(
                                                            item.price,
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="mt-6 overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b-2 border-gray-200 bg-black p-4 dark:border-gray-700 dark:bg-gray-900">
                        <h2 className="flex items-center text-lg font-bold text-white">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Recent Orders
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Order
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Payment
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {recentOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/pos/${order.id}`}
                                                className="font-bold text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-black dark:text-white">
                                                {order.customer_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                                {formatCurrency(
                                                    order.total_amount,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                                                    order.payment_method ===
                                                    'cash'
                                                        ? 'border-green-200 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-200'
                                                        : 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                                }`}
                                            >
                                                {order.payment_method === 'cash'
                                                    ? 'Cash'
                                                    : 'M-Pesa'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(order.order_status)}`}
                                            >
                                                {order.order_status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    order.order_status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {formatDate(order.created_at)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
