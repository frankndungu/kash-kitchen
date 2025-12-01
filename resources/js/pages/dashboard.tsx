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

    const getOrderPriority = (timeElapsed: number) => {
        if (timeElapsed > 15) return 'border-orange-200 bg-orange-50';
        if (timeElapsed > 10) return 'border-yellow-200 bg-yellow-50';
        return 'border-gray-200 bg-white';
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

                {/* Header with Quick Actions */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {getGreeting()}, {user.name}
                        </h1>
                        <p className="text-gray-600">
                            {user.role} • {getCurrentShift()} • Kash Kitchen
                            Operations
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/pos/create"
                            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Order</span>
                        </Link>
                        <Link
                            href="/sales-analytics"
                            className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span>Analytics</span>
                        </Link>
                    </div>
                </div>

                {/* Critical Alerts Bar - Only Stock Related */}
                {criticalAlerts.outOfStockCount > 0 && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <div className="flex space-x-6 text-sm">
                                    <span className="font-medium text-red-800">
                                        {criticalAlerts.outOfStockCount} items
                                        out of stock
                                    </span>
                                </div>
                            </div>
                            <Link
                                href="/inventory/reports/low-stock"
                                className="text-sm font-medium text-red-600 hover:text-red-800"
                            >
                                View Details →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Today's Operations Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Today's Sales
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(todayStats.sales)}
                                </p>
                            </div>
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                                <Banknote className="h-3 w-3" />
                                <span>
                                    {formatCurrency(todayStats.cashTotal)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Smartphone className="h-3 w-3" />
                                <span>
                                    {formatCurrency(todayStats.mpesaTotal)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Orders Today
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {todayStats.orders}
                                </p>
                            </div>
                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {criticalAlerts.pendingOrders} pending
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Avg Order Time
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {quickStats.averageOrderTime}m
                                </p>
                            </div>
                            <Clock className="h-6 w-6 text-purple-600" />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Target: 8 minutes
                        </p>
                    </div>

                    <div
                        className={`rounded-lg border p-4 ${
                            criticalAlerts.lowStockCount > 0
                                ? 'border-orange-200 bg-orange-50'
                                : 'border-gray-200 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Stock Alerts
                                </p>
                                <p
                                    className={`text-2xl font-bold ${
                                        criticalAlerts.lowStockCount > 0
                                            ? 'text-orange-600'
                                            : 'text-gray-900'
                                    }`}
                                >
                                    {criticalAlerts.lowStockCount}
                                </p>
                            </div>
                            <Package
                                className={`h-6 w-6 ${
                                    criticalAlerts.lowStockCount > 0
                                        ? 'text-orange-600'
                                        : 'text-gray-600'
                                }`}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {criticalAlerts.lowStockCount > 0
                                ? 'Need attention'
                                : 'All good'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Active Orders - Fast Food Context */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border border-gray-200 bg-white">
                            <div className="border-b p-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="flex items-center text-lg font-semibold">
                                        <ChefHat className="mr-2 h-5 w-5" />
                                        Active Orders ({activeOrders.length})
                                    </h2>
                                    <Link
                                        href="/pos"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
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
                                                className={`rounded-lg border p-3 ${getOrderPriority(order.time_elapsed)}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-medium">
                                                                    #
                                                                    {
                                                                        order.order_number
                                                                    }
                                                                </span>
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getOrderStatusColor(order.order_status)}`}
                                                                >
                                                                    {
                                                                        order.order_status
                                                                    }
                                                                </span>
                                                                {order.time_elapsed >
                                                                    10 && (
                                                                    <span className="text-xs font-medium text-orange-600">
                                                                        {formatTimeElapsed(
                                                                            order.time_elapsed,
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600">
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
                                                            <p className="font-medium">
                                                                {formatCurrency(
                                                                    order.total_amount,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatTimeAgo(
                                                                    order.created_at,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <Link
                                                            href={`/pos/${order.id}`}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        <ChefHat className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                        <p>No active orders</p>
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
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <h3 className="mb-4 font-semibold">
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    href="/pos/create"
                                    className="flex items-center space-x-3 rounded-lg border border-blue-200 bg-blue-50 p-3 hover:bg-blue-100"
                                >
                                    <Plus className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                        New Order
                                    </span>
                                </Link>
                                <Link
                                    href="/inventory"
                                    className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                >
                                    <Package className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900">
                                        Check Inventory
                                    </span>
                                </Link>
                                <Link
                                    href="/inventory/reports/low-stock"
                                    className="flex items-center space-x-3 rounded-lg border border-orange-200 bg-orange-50 p-3 hover:bg-orange-100"
                                >
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-900">
                                        Stock Alerts
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <h3 className="mb-4 font-semibold">
                                System Status
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                        Inventory Value
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            quickStats.inventoryValue,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                        Staff on Duty
                                    </span>
                                    <span className="font-medium">
                                        {quickStats.staffOnDuty}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                        Peak Hour Sales
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            quickStats.peakHourSales,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                        System Status
                                    </span>
                                    <span className="font-medium text-green-600">
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Time & Date */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Date().toLocaleTimeString('en-KE', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {new Date().toLocaleDateString('en-KE', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
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
