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
        if (growth > 0) return 'text-green-600';
        if (growth < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'preparing':
                return 'bg-yellow-100 text-yellow-800';
            case 'ready':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-3xl font-bold text-gray-900">
                            Sales Analytics
                        </h1>
                        <p className="text-gray-600">
                            Revenue insights and performance metrics for Kash
                            Kitchen
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export CSV</span>
                        </button>
                        <Link
                            href="/pos"
                            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>POS System</span>
                        </Link>
                        <Link
                            href="/inventory"
                            className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            <Package className="h-4 w-4" />
                            <span>Inventory</span>
                        </Link>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Today's Revenue
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(salesStats.today.revenue)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {salesStats.today.orders} orders
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    This Week
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(salesStats.week.revenue)}
                                </p>
                                <p
                                    className={`text-sm ${getGrowthColor(salesStats.week.growth)}`}
                                >
                                    {salesStats.week.growth > 0 ? '+' : ''}
                                    {salesStats.week.growth.toFixed(1)}% vs last
                                    week
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    This Month
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(salesStats.month.revenue)}
                                </p>
                                <p
                                    className={`text-sm ${getGrowthColor(salesStats.month.growth)}`}
                                >
                                    {salesStats.month.growth > 0 ? '+' : ''}
                                    {salesStats.month.growth.toFixed(1)}% vs
                                    last month
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Average Order
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(
                                        salesStats.today.average_order,
                                    )}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Today's average
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Payment Breakdown */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h2 className="mb-4 flex items-center text-lg font-semibold">
                                <CreditCard className="mr-2 h-5 w-5" />
                                Payment Methods
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="mr-3 h-4 w-4 rounded bg-green-500"></div>
                                        <span className="text-sm font-medium">
                                            Cash
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">
                                            {formatCurrency(
                                                paymentBreakdown.cash.amount,
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
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
                                        <span className="text-sm font-medium">
                                            M-Pesa
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">
                                            {formatCurrency(
                                                paymentBreakdown.mpesa.amount,
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {paymentBreakdown.mpesa.percentage.toFixed(
                                                1,
                                            )}
                                            %
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Chart */}
                                <div className="mt-4">
                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{
                                                width: `${paymentBreakdown.cash.percentage}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mt-2 text-center text-xs text-gray-500">
                                    {paymentBreakdown.cash.count} cash •{' '}
                                    {paymentBreakdown.mpesa.count} M-Pesa
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Selling Items */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border border-gray-200 bg-white">
                            <div className="border-b p-4">
                                <h2 className="flex items-center text-lg font-semibold">
                                    <Package className="mr-2 h-5 w-5" />
                                    Top Selling Items
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Item
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Quantity Sold
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Revenue
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Unit Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {topItems.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="mr-3 text-sm font-medium text-gray-500">
                                                            #{index + 1}
                                                        </div>
                                                        <div className="font-medium text-gray-900">
                                                            {item.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {item.quantity_sold}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-green-600">
                                                        {formatCurrency(
                                                            item.revenue,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">
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
                <div className="mt-6 rounded-lg border border-gray-200 bg-white">
                    <div className="border-b p-4">
                        <h2 className="flex items-center text-lg font-semibold">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Recent Orders
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Order
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Payment
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/pos/${order.id}`}
                                                className="font-medium text-blue-600 hover:text-blue-900"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {order.customer_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatCurrency(
                                                    order.total_amount,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                    order.payment_method ===
                                                    'cash'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {order.payment_method === 'cash'
                                                    ? 'Cash'
                                                    : 'M-Pesa'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.order_status)}`}
                                            >
                                                {order.order_status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    order.order_status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500">
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
