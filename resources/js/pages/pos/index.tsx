import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Filter,
    Plus,
    Search,
    ShoppingCart,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'POS System',
        href: '/pos',
    },
];

interface Order {
    id: number;
    order_number: string;
    customer_name: string | null;
    total_amount: number;
    order_status: string;
    order_type: string;
    created_at: string;
    items_count: number;
    payment_method: string;
    payment_status: string;
    mpesa_reference: string | null;
}

interface IndexProps {
    user: {
        name: string;
        email: string;
    };
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function Index({ user, orders, filters }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Update local state when filters change (for page navigation)
    useEffect(() => {
        setSearchTerm(filters.search || '');
        setStatusFilter(filters.status || '');
    }, [filters.search, filters.status]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedSearch = searchTerm.trim();

        router.get(
            '/pos',
            {
                search: trimmedSearch || undefined,
                status: statusFilter || undefined,
                page: 1, // Reset to first page
            },
            {
                preserveState: false,
                preserveScroll: false,
            },
        );
    };

    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        router.get(
            '/pos',
            {
                search: searchTerm || undefined,
                status: status || undefined,
                page: 1, // Reset to first page
            },
            {
                preserveState: false,
                preserveScroll: false,
            },
        );
    };

    const clearFilters = () => {
        router.get(
            '/pos',
            {},
            {
                preserveState: false,
                preserveScroll: false,
            },
        );
        setSearchTerm('');
        setStatusFilter('');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="POS System" />

            <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black dark:text-white">
                            POS System
                        </h1>
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                            Manage orders and process payments
                        </p>
                    </div>
                    <Link
                        href="/pos/create"
                        className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Order</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Total Orders
                                </p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {orders.total}
                                </p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Pending
                                </p>
                                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                    {
                                        orders.data.filter(
                                            (o) => o.order_status === 'pending',
                                        ).length
                                    }
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Preparing
                                </p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {
                                        orders.data.filter(
                                            (o) =>
                                                o.order_status === 'preparing',
                                        ).length
                                    }
                                </p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                    Completed
                                </p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {
                                        orders.data.filter(
                                            (o) =>
                                                o.order_status === 'completed',
                                        ).length
                                    }
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <form
                            onSubmit={handleSearch}
                            className="min-w-64 flex-1"
                        >
                            <div className="flex rounded-lg border-2 border-gray-300 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search by order number, customer name..."
                                    className="flex-1 rounded-l-lg border-none bg-transparent px-4 py-2 text-black focus:ring-0 focus:outline-none dark:text-white"
                                />
                                <button
                                    type="submit"
                                    className="rounded-r-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </form>

                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    handleStatusChange(e.target.value)
                                }
                                className="rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {(filters.status || filters.search) && (
                            <button
                                onClick={clearFilters}
                                className="rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Show current search and filter info */}
                    {(filters.search || filters.status) && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {filters.search && (
                                <span>
                                    Searching for:{' '}
                                    <strong>"{filters.search}"</strong>
                                </span>
                            )}
                            {filters.search && filters.status && (
                                <span> | </span>
                            )}
                            {filters.status && (
                                <span>
                                    Status:{' '}
                                    <strong className="capitalize">
                                        {filters.status}
                                    </strong>
                                </span>
                            )}
                            <span className="ml-2">
                                ({orders.total} result
                                {orders.total !== 1 ? 's' : ''})
                            </span>
                        </div>
                    )}
                </div>

                {/* Orders Table */}
                <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b-2 border-gray-200 bg-black p-4 dark:border-gray-700 dark:bg-gray-900">
                        <h2 className="text-lg font-bold text-white">
                            Orders ({orders.total} total)
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-bold text-black dark:text-white">
                                                        #{order.order_number}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        {order.items_count}{' '}
                                                        items
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-black dark:text-white">
                                                    {order.customer_name ||
                                                        'Walk-in'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-black capitalize dark:text-white">
                                                    {order.order_type.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {/* Quick Status Update Form */}
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        const form =
                                                            e.target as HTMLFormElement;
                                                        const formData =
                                                            new FormData(form);
                                                        const newStatus =
                                                            formData.get(
                                                                'order_status',
                                                            ) as string;

                                                        if (
                                                            newStatus !==
                                                            order.order_status
                                                        ) {
                                                            router.patch(
                                                                `/pos/${order.id}/status`,
                                                                {
                                                                    order_status:
                                                                        newStatus,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <select
                                                        name="order_status"
                                                        defaultValue={
                                                            order.order_status
                                                        }
                                                        onChange={(e) => {
                                                            const form =
                                                                e.target.closest(
                                                                    'form',
                                                                ) as HTMLFormElement;
                                                            if (form)
                                                                form.requestSubmit();
                                                        }}
                                                        className={`w-full cursor-pointer rounded-full border px-3 py-1 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-none ${getStatusBadge(order.order_status)}`}
                                                    >
                                                        <option value="pending">
                                                            Pending
                                                        </option>
                                                        <option value="confirmed">
                                                            Confirmed
                                                        </option>
                                                        <option value="preparing">
                                                            Preparing
                                                        </option>
                                                        <option value="ready">
                                                            Ready
                                                        </option>
                                                        <option value="completed">
                                                            Completed
                                                        </option>
                                                        <option value="cancelled">
                                                            Cancelled
                                                        </option>
                                                    </select>
                                                </form>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-red-600 dark:text-red-400">
                                                    {formatCurrency(
                                                        order.total_amount,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium text-black capitalize dark:text-white">
                                                        {order.payment_method}
                                                    </div>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${getPaymentStatusBadge(order.payment_status)}`}
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
                                                            {
                                                                order.payment_status
                                                            }
                                                        </span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {order.mpesa_reference ? (
                                                        <div className="max-w-32 truncate rounded bg-gray-100 px-2 py-1 font-mono font-medium dark:bg-gray-700">
                                                            {
                                                                order.mpesa_reference
                                                            }
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">
                                                            —
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleTimeString('en-KE', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={`/pos/${order.id}`}
                                                        className="flex items-center text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        title="View Order"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/pos/${order.id}/edit`}
                                                        className="flex items-center text-black transition-colors hover:text-red-600 dark:text-white dark:hover:text-red-400"
                                                        title="Edit Order"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center space-y-3">
                                                <ShoppingCart className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                                                <div>
                                                    {filters.search ||
                                                    filters.status ? (
                                                        <>
                                                            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">
                                                                No orders found
                                                            </p>
                                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                                Try adjusting
                                                                your search or
                                                                filter criteria
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">
                                                                No orders found
                                                            </p>
                                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                                Create your
                                                                first order to
                                                                get started
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                {!filters.search &&
                                                    !filters.status && (
                                                        <Link
                                                            href="/pos/create"
                                                            className="inline-flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            <span>
                                                                New Order
                                                            </span>
                                                        </Link>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Standard Laravel Pagination */}
                    {orders.last_page > 1 && (
                        <div className="border-t-2 border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Showing page {orders.current_page} of{' '}
                                    {orders.last_page}({orders.total} total
                                    orders)
                                </div>
                                <div className="flex space-x-1">
                                    {orders.links.map((link, index) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={index}
                                                    className="cursor-not-allowed rounded px-3 py-1 text-sm font-medium text-gray-400 dark:text-gray-600"
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-red-600 text-white dark:bg-red-500'
                                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
