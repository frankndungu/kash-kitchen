import { Head } from '@inertiajs/react';

export default function LongWaitOrders(props: any) {
    const { user = {}, summaryStats = {}, longWaitOrders = [] } = props;

    return (
        <div>
            <Head title="Long Wait Orders" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h1 className="mb-2 text-3xl font-bold text-red-600">
                            🚨 Long Wait Orders - Emergency Management
                        </h1>
                        <p className="text-gray-600">
                            Orders waiting 30+ minutes requiring immediate
                            attention
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            User: {user.name || 'Unknown'}
                        </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <h3 className="text-sm font-medium text-red-800">
                                Critical (60+ min)
                            </h3>
                            <p className="text-2xl font-bold text-red-900">
                                {summaryStats.critical_count || 0}
                            </p>
                        </div>

                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                            <h3 className="text-sm font-medium text-orange-800">
                                High (45-60 min)
                            </h3>
                            <p className="text-2xl font-bold text-orange-900">
                                {summaryStats.high_priority_count || 0}
                            </p>
                        </div>

                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Medium (30-45 min)
                            </h3>
                            <p className="text-2xl font-bold text-yellow-900">
                                {summaryStats.medium_priority_count || 0}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h3 className="text-sm font-medium text-gray-600">
                                Total Long Wait
                            </h3>
                            <p className="text-2xl font-bold text-gray-900">
                                {summaryStats.total_long_wait || 0}
                            </p>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="rounded-lg bg-white shadow">
                        <div className="p-6">
                            <h2 className="mb-4 text-xl font-bold">
                                Long Wait Orders ({longWaitOrders.length})
                            </h2>

                            {longWaitOrders.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="mb-4 text-6xl text-green-600">
                                        ✅
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-green-900">
                                        No Long Wait Orders!
                                    </h3>
                                    <p className="text-green-700">
                                        All orders are being served within
                                        acceptable time frames.
                                    </p>
                                    <a
                                        href="/dashboard"
                                        className="mt-4 inline-block rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                    >
                                        Back to Dashboard
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {longWaitOrders.map(
                                        (order: any, index: number) => (
                                            <div
                                                key={order.id || index}
                                                className="rounded-lg border border-red-200 bg-red-50 p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold">
                                                            #
                                                            {order.order_number ||
                                                                `Order ${index + 1}`}
                                                        </h3>
                                                        <p className="text-gray-600">
                                                            Customer:{' '}
                                                            {order.customer_name ||
                                                                'Walk-in Customer'}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            Phone:{' '}
                                                            {order.customer_phone ||
                                                                'No phone'}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            Items:{' '}
                                                            {order.items_summary ||
                                                                `${order.items_count || 0} items`}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            Total: KSh{' '}
                                                            {order.total_amount ||
                                                                0}
                                                        </p>
                                                        <p className="font-semibold text-red-600">
                                                            Wait Time:{' '}
                                                            {order.time_elapsed ||
                                                                0}{' '}
                                                            minutes
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col space-y-2">
                                                        <a
                                                            href={`/pos/${order.id}`}
                                                            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                                        >
                                                            View Order
                                                        </a>
                                                        {order.customer_phone && (
                                                            <a
                                                                href={`tel:${order.customer_phone}`}
                                                                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                                                            >
                                                                Call Customer
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 flex space-x-4">
                        <a
                            href="/dashboard"
                            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            ← Back to Dashboard
                        </a>
                        <a
                            href="/pos"
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            View All Orders
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
