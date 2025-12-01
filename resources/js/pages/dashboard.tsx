import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    ChefHat,
    Clock,
    DollarSign,
    Eye,
    Package,
    Plus,
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
    todayStats: {
        sales: number;
        orders: number;
        cashTotal: number;
        mpesaTotal: number;
    };
    activeOrders: Array<{
        id: number;
        order_number: string;
        customer_name: string | null;
        total_amount: number;
        order_status: string;
        created_at: string;
        items_count: number;
        time_elapsed: number; // minutes since created
    }>;
    criticalAlerts: {
        lowStockCount: number;
        outOfStockCount: number;
        pendingOrders: number;
    };
    quickStats: {
        averageOrderTime: number;
        peakHourSales: number;
        staffOnDuty: number;
        inventoryValue: number;
    };
}

export default function Dashboard({
    user,
    todayStats,
    activeOrders,
    criticalAlerts,
    quickStats,
}: DashboardProps) {
    const pageProps = usePage().props as any;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatTimeElapsed = (minutes: number) => {
        if (minutes < 60) {
            return `${Math.round(minutes)}m`;
        } else if (minutes < 1440) {
            // Less than 24 hours
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = Math.round(minutes % 60);
            if (remainingMinutes === 0) {
                return `${hours}h`;
            }
            return `${hours}h ${remainingMinutes}m`;
        } else {
            // 24+ hours (days)
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            if (hours === 0) {
                return `${days}d`;
            }
            return `${days}d ${hours}h`;
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60),
        );

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
            // Less than 24 hours
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString('en-KE', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700';
            case 'preparing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700';
            case 'ready':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700';
            case 'completed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-700';
            default:
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700';
        }
    };

    const getOrderPriority = (timeElapsed: number) => {
        if (timeElapsed > 15)
            return 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20';
        if (timeElapsed > 10)
            return 'border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20';
        return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
    };

    const getCurrentShift = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 14) return 'Morning Shift';
        if (hour >= 14 && hour < 22) return 'Evening Shift';
        return 'Night Shift';
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operations Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                {/* Flash Messages */}
                {pageProps.flash?.error && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-300 bg-red-100 p-4 shadow-sm dark:border-red-600 dark:bg-red-900/50">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <p className="font-medium text-red-800 dark:text-red-200">
                                {pageProps.flash.error}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {pageProps.flash?.success && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-green-300 bg-green-100 p-4 shadow-sm dark:border-green-600 dark:bg-green-900/50">
                        <div className="flex items-center space-x-2">
                            <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <p className="font-medium text-green-800 dark:text-green-200">
                                {pageProps.flash.success}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-green-600 transition-colors hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Header with Quick Actions */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black dark:text-white">
                            {getGreeting()}, {user.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {user.role} • {getCurrentShift()} • Kash Kitchen
                            Operations
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/pos/create"
                            className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Order</span>
                        </Link>
                        <Link
                            href="/sales-analytics"
                            className="flex items-center space-x-2 rounded-lg border-2 border-black px-4 py-2 font-medium text-black shadow-md transition-all hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span>Analytics</span>
                        </Link>
                    </div>
                </div>

                {/* Critical Alerts Bar - Only Stock Related */}
                {criticalAlerts.outOfStockCount > 0 && (
                    <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-4 shadow-md dark:border-red-600 dark:bg-red-900/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                <div className="flex space-x-6 text-sm">
                                    <span className="font-bold text-red-800 dark:text-red-200">
                                        {criticalAlerts.outOfStockCount} items
                                        out of stock
                                    </span>
                                </div>
                            </div>
                            <Link
                                href="/inventory/reports/low-stock"
                                className="text-sm font-bold text-red-700 transition-colors hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
                            >
                                View Details →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Today's Operations Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Today's Sales
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {formatCurrency(todayStats.sales)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-red-600 dark:text-red-500" />
                        </div>
                        <div className="mt-3 flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                                <Banknote className="h-3 w-3" />
                                <span className="font-medium">
                                    {formatCurrency(todayStats.cashTotal)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Smartphone className="h-3 w-3" />
                                <span className="font-medium">
                                    {formatCurrency(todayStats.mpesaTotal)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Orders Today
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {todayStats.orders}
                                </p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-red-600 dark:text-red-500" />
                        </div>
                        <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {criticalAlerts.pendingOrders} pending
                        </p>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Avg Order Time
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {quickStats.averageOrderTime}m
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-red-600 dark:text-red-500" />
                        </div>
                        <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Target: 8 minutes
                        </p>
                    </div>

                    <div
                        className={`rounded-lg border-2 p-6 shadow-lg transition-shadow hover:shadow-xl ${
                            criticalAlerts.lowStockCount > 0
                                ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/30'
                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Stock Alerts
                                </p>
                                <p
                                    className={`text-3xl font-bold ${
                                        criticalAlerts.lowStockCount > 0
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-black dark:text-white'
                                    }`}
                                >
                                    {criticalAlerts.lowStockCount}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-red-600 dark:text-red-500" />
                        </div>
                        <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {criticalAlerts.lowStockCount > 0
                                ? 'Need attention'
                                : 'All good'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Active Orders - Fast Food Context */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b-2 border-gray-200 bg-black p-4 dark:border-gray-700 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <h2 className="flex items-center text-lg font-bold text-white">
                                        <ChefHat className="mr-2 h-5 w-5" />
                                        Active Orders ({activeOrders.length})
                                    </h2>
                                    <Link
                                        href="/pos"
                                        className="text-sm font-bold text-red-400 transition-colors hover:text-red-300 dark:text-red-300 dark:hover:text-red-200"
                                    >
                                        View All →
                                    </Link>
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto p-4">
                                {activeOrders.length > 0 ? (
                                    <div className="space-y-3">
                                        {activeOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className={`rounded-lg border-2 p-4 shadow-md transition-shadow hover:shadow-lg ${getOrderPriority(order.time_elapsed)}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-bold text-black dark:text-white">
                                                                    #
                                                                    {
                                                                        order.order_number
                                                                    }
                                                                </span>
                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${getOrderStatusColor(order.order_status)}`}
                                                                >
                                                                    {order.order_status.toUpperCase()}
                                                                </span>
                                                                {order.time_elapsed >
                                                                    10 && (
                                                                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                                                        {formatTimeElapsed(
                                                                            order.time_elapsed,
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                {order.customer_name ||
                                                                    'Walk-in'}{' '}
                                                                •{' '}
                                                                {
                                                                    order.items_count
                                                                }{' '}
                                                                items
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="text-right">
                                                            <p className="font-bold text-black dark:text-white">
                                                                {formatCurrency(
                                                                    order.total_amount,
                                                                )}
                                                            </p>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                {formatTimeAgo(
                                                                    order.created_at,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <Link
                                                            href={`/pos/${order.id}`}
                                                            className="text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                        <ChefHat className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600" />
                                        <p className="text-lg font-bold">
                                            No active orders
                                        </p>
                                        <p className="text-sm">
                                            All caught up!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions & Status */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-4 font-bold text-black dark:text-white">
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    href="/pos/create"
                                    className="flex items-center space-x-3 rounded-lg border-2 border-red-200 bg-red-50 p-3 shadow-md transition-colors hover:bg-red-100 dark:border-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                                >
                                    <Plus className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-bold text-red-900 dark:text-red-200">
                                        New Order
                                    </span>
                                </Link>
                                <Link
                                    href="/inventory"
                                    className="flex items-center space-x-3 rounded-lg border-2 border-gray-200 p-3 shadow-md transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                >
                                    <Package className="h-5 w-5 text-black dark:text-white" />
                                    <span className="text-sm font-bold text-black dark:text-white">
                                        Check Inventory
                                    </span>
                                </Link>
                                <Link
                                    href="/inventory/reports/low-stock"
                                    className="flex items-center space-x-3 rounded-lg border-2 border-red-200 bg-red-50 p-3 shadow-md transition-colors hover:bg-red-100 dark:border-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                                >
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-bold text-red-900 dark:text-red-200">
                                        Stock Alerts
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-4 font-bold text-black dark:text-white">
                                System Status
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Inventory Value
                                    </span>
                                    <span className="font-bold text-black dark:text-white">
                                        {formatCurrency(
                                            quickStats.inventoryValue,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Staff on Duty
                                    </span>
                                    <span className="font-bold text-black dark:text-white">
                                        {quickStats.staffOnDuty}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        Peak Hour Sales
                                    </span>
                                    <span className="font-bold text-black dark:text-white">
                                        {formatCurrency(
                                            quickStats.peakHourSales,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        System Status
                                    </span>
                                    <span className="font-bold text-green-600 dark:text-green-400">
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Time & Date */}
                        <div className="rounded-lg border-2 border-gray-200 bg-black p-6 shadow-lg dark:border-gray-600 dark:bg-gray-900">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">
                                    {new Date().toLocaleTimeString('en-KE', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                                <p className="text-sm font-medium text-gray-300 dark:text-gray-400">
                                    {new Date().toLocaleDateString('en-KE', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="mt-2 text-xs font-bold tracking-wide text-red-400 uppercase dark:text-red-300">
                                    {getCurrentShift()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
