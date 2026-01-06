import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    Clock,
    DollarSign,
    Edit3,
    RefreshCw,
    ShoppingCart,
    Smartphone,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
        todaySales: number | null;
        ordersToday: number;
        pendingOrders: number;
        cashInDrawer: number | null;
        mpesaSales: number | null;
        lowStockCount: number;
        averageOrderTime: number;
        peakHour: string;
        canViewSales?: boolean;
    };
    recentOrders: Array<{
        id: number;
        order_number: string;
        customer_name: string | null;
        total_amount: number;
        order_status: string;
        created_at: string;
        items_summary: string;
        time_elapsed: number;
        time_elapsed_display?: string;
    }>;
    activeOrders: Array<{
        id: number;
        order_number: string;
        customer_name: string | null;
        total_amount: number;
        order_status: string;
        created_at: string;
        items_summary: string;
        time_elapsed: number;
        time_elapsed_display?: string;
    }>;
    criticalAlerts: {
        longWaitOrders: number;
        urgentOrders: number;
        firstLongWaitOrderId: number | null;
        lowStockItems: number;
        systemIssues: number;
    };
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
    activeOrders,
    criticalAlerts,
    topSellingItems,
}: DashboardProps) {
    const pageProps = usePage().props as any;

    // State for real-time clock
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Auto-refresh dashboard data every 30 seconds
    useEffect(() => {
        const refreshTimer = setInterval(() => {
            // Silently refresh data without showing loading state
            router.reload({
                only: [
                    'stats',
                    'activeOrders',
                    'recentOrders',
                    'criticalAlerts',
                    'topSellingItems',
                ],
            });
        }, 30000); // 30 seconds

        return () => clearInterval(refreshTimer);
    }, []);

    // Manual refresh function
    const handleManualRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: [
                'stats',
                'activeOrders',
                'recentOrders',
                'criticalAlerts',
                'topSellingItems',
            ],
            onFinish: () => setIsRefreshing(false),
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getTimeAgo = (dateString: string) => {
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
        const hour = currentTime.getHours();
        if (hour >= 6 && hour < 14) return 'Morning Shift';
        if (hour >= 14 && hour < 22) return 'Evening Shift';
        return 'Night Shift';
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Sort active orders by timestamp (oldest first - first to last as requested)
    const sortedActiveOrders = [...activeOrders].sort((a, b) => {
        return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    });

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

                {/* Header with Manual Refresh */}
                <div className="mb-6 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {getGreeting()}, {user.name}!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Welcome to the Kash Kitchen operations dashboard
                        </p>
                    </div>
                    <button
                        onClick={handleManualRefresh}
                        disabled={isRefreshing}
                        className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        <span>
                            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                        </span>
                    </button>
                </div>

                {/* Statistics Cards - Conditional Grid */}
                <div
                    className={`mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 ${stats?.canViewSales ? 'lg:grid-cols-4' : 'lg:grid-cols-2'}`}
                >
                    {/* Today's Sales - Only for Admin/Manager */}
                    {stats?.canViewSales && (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center space-x-3">
                                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Today's Sales
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(stats?.todaySales || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Today - Everyone can see */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Orders Today
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.ordersToday || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pending Orders - Everyone can see */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Pending Orders
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.pendingOrders || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cash Drawer - Only for Admin/Manager */}
                    {stats?.canViewSales && (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center space-x-3">
                                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                    <Banknote className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Cash Drawer
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(
                                            stats?.cashInDrawer || 0,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Grid - UNIFORM HEIGHT */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Active Orders - Column 1 - FIXED HEIGHT */}
                    <div className="lg:col-span-1">
                        <div className="flex h-[600px] flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Active Orders
                                </h3>
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {activeOrders?.length || 0}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {sortedActiveOrders.length > 0 ? (
                                    <div className="space-y-3">
                                        {sortedActiveOrders.map((order) => (
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
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {order.customer_name ||
                                                                    'Walk-in Customer'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                                {
                                                                    order.items_summary
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatCurrency(
                                                                    order.total_amount,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {order.time_elapsed_display ||
                                                                    getTimeAgo(
                                                                        order.created_at,
                                                                    )}
                                                            </p>
                                                        </div>
                                                        {order.time_elapsed >
                                                            20 && (
                                                            <Link
                                                                href={`/pos/${order.id}/edit`}
                                                                className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                                                                title="Update Status"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <Clock className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                No active orders
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders & Top Items - Columns 2-3 */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Recent Orders - FIXED HEIGHT */}
                            <div className="flex h-[600px] flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    Recent Orders
                                </h3>
                                <div className="flex-1 overflow-y-auto">
                                    {recentOrders?.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentOrders
                                                .slice(0, 10)
                                                .map((order) => (
                                                    <div
                                                        key={order.id}
                                                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                                    >
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-medium text-gray-900 dark:text-white">
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
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {order.customer_name ||
                                                                    'Walk-in'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {formatCurrency(
                                                                    order.total_amount,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {order.time_elapsed_display ||
                                                                    getTimeAgo(
                                                                        order.created_at,
                                                                    )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <div className="text-center">
                                                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    No recent orders
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Top Selling Items - FIXED HEIGHT */}
                            <div className="flex h-[600px] flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    Top Selling Items
                                </h3>
                                <div className="flex-1 overflow-y-auto">
                                    {topSellingItems?.length > 0 ? (
                                        <div className="space-y-3">
                                            {topSellingItems
                                                .slice(0, 10)
                                                .map((item) => (
                                                    <div
                                                        key={item.rank}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                                {item.rank}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatCurrency(
                                                                    item.revenue,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {
                                                                    item.orders_count
                                                                }{' '}
                                                                orders
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <div className="text-center">
                                                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    No sales data available
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & System Status */}
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Quick Actions */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Link
                                href="/pos/create"
                                className="flex w-full items-center space-x-3 rounded-lg bg-blue-50 p-3 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                            >
                                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                    New Order
                                </span>
                            </Link>
                            <Link
                                href="/inventory"
                                className="flex w-full items-center space-x-3 rounded-lg bg-green-50 p-3 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                            >
                                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-green-900 dark:text-green-200">
                                    Check Inventory
                                </span>
                            </Link>
                            <Link
                                href="/analytics"
                                className="flex w-full items-center space-x-3 rounded-lg bg-purple-50 p-3 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
                            >
                                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                                    View Analytics
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Payment Methods - Only for Admin/Manager */}
                    {stats?.canViewSales && (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Payment Methods
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Banknote className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Cash
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(
                                            stats?.cashInDrawer || 0,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Smartphone className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            M-Pesa
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(stats?.mpesaSales || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Status & Live Time */}
                    <div className="space-y-4">
                        {/* System Status */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        System Status
                                    </span>
                                    <span className="font-medium text-green-600">
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Live Time & Date with Seconds */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    {currentTime.toLocaleTimeString('en-KE', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    })}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {currentTime.toLocaleDateString('en-KE', {
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
