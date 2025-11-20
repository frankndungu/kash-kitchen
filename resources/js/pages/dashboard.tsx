// Professional dashboard.tsx with error message display - FIXED
// resources/js/pages/dashboard.tsx

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    Clock,
    DollarSign,
    ShoppingCart,
    Smartphone,
    TrendingUp,
    X,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    stats: {
        todaySales: number;
        ordersToday: number;
        pendingOrders: number;
        cashInDrawer: number;
        mpesaSales: number;
        lowStockCount: number;
    };
    recentOrders: Array<{
        id: number;
        order_number: string;
        customer_name: string | null;
        total_amount: number;
        order_status: string;
        created_at: string;
        items_summary: string;
    }>;
    topSellingItems: Array<{
        rank: number;
        name: string;
        orders_count: number;
        revenue: number;
    }>;
}

export default function Dashboard({
    user,
    stats,
    recentOrders,
    topSellingItems,
}: DashboardProps) {
    const pageProps = usePage().props as any;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Flash Messages */}
                {pageProps.flash?.error && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <p className="text-red-800">
                                {pageProps.flash.error}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-red-600 hover:text-red-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {pageProps.flash?.success && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center space-x-2">
                            <ShoppingCart className="h-5 w-5 text-green-600" />
                            <p className="text-green-800">
                                {pageProps.flash.success}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-green-600 hover:text-green-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Welcome Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user.name}
                        </h1>
                        <p className="text-gray-600">
                            {user.role} • Kash Kitchen POS
                        </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        {new Date().toLocaleDateString('en-KE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                </div>

                {/* Stats Cards - Using backend data */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Today's Sales Card */}
                    <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border">
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-600">
                                    Today's Sales
                                </h3>
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats.todaySales)}
                                </p>
                                <p className="mt-1 text-xs text-green-600">
                                    +15% from yesterday
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                                <Banknote className="h-3 w-3" />
                                <span>
                                    Cash: {formatCurrency(stats.cashInDrawer)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Smartphone className="h-3 w-3" />
                                <span>
                                    M-Pesa: {formatCurrency(stats.mpesaSales)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Orders Today Card */}
                    <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border">
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-600">
                                    Orders Today
                                </h3>
                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.ordersToday}
                                </p>
                                <p className="mt-1 text-xs text-blue-600">
                                    {stats.pendingOrders} pending
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Average time: 12 mins</span>
                        </div>
                    </div>

                    {/* Inventory Alerts Card */}
                    <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border">
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-600">
                                    Inventory Alerts
                                </h3>
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-bold text-red-600">
                                    {stats.lowStockCount}
                                </p>
                                <p className="mt-1 text-xs text-red-600">
                                    Items need attention
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            <span>Chicken, Potatoes running low</span>
                        </div>
                    </div>
                </div>

                {/* Recent Orders and Top Items */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Orders */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-5 w-5 text-gray-700" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Recent Orders
                                </h3>
                            </div>
                            <span className="text-sm text-gray-500">
                                Latest activity
                            </span>
                        </div>
                        <div className="space-y-4">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">
                                                    #{order.order_number}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                        order.order_status ===
                                                        'preparing'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : order.order_status ===
                                                                'ready'
                                                              ? 'bg-green-100 text-green-800'
                                                              : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {order.order_status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {order.items_summary}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.customer_name ||
                                                    'Walk-in'}{' '}
                                                •{' '}
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    order.total_amount,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-8 text-center text-gray-500">
                                    No recent orders
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Top Selling Items */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-gray-700" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Top Selling Items
                                </h3>
                            </div>
                            <span className="text-sm text-gray-500">
                                Today's favorites
                            </span>
                        </div>
                        <div className="space-y-4">
                            {topSellingItems.map((item) => (
                                <div
                                    key={item.rank}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                                                item.rank === 1
                                                    ? 'bg-yellow-500'
                                                    : item.rank === 2
                                                      ? 'bg-gray-400'
                                                      : item.rank === 3
                                                        ? 'bg-amber-600'
                                                        : 'bg-gray-300'
                                            }`}
                                        >
                                            {item.rank}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {item.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {item.orders_count} orders
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-medium">
                                        {formatCurrency(item.revenue)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
