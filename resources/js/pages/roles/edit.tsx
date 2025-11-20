import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ChefHat,
    ClipboardList,
    Crown,
    Save,
    Shield,
    UserCog,
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
    permissions: string[];
    is_active: boolean;
}

interface EditRoleProps {
    role: Role;
    availablePermissions: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/roles',
    },
    {
        title: 'Edit Role',
        href: '#',
    },
];

export default function EditRole({
    role,
    availablePermissions,
}: EditRoleProps) {
    const { data, setData, put, processing, errors } = useForm({
        display_name: role.display_name,
        description: role.description,
        permissions: role.permissions,
        is_active: role.is_active,
    });

    const getRoleIcon = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return <Crown className="h-6 w-6 text-yellow-600" />;
            case 'manager':
                return <UserCog className="h-6 w-6 text-blue-600" />;
            case 'cashier':
                return <ClipboardList className="h-6 w-6 text-green-600" />;
            case 'kitchen_staff':
                return <ChefHat className="h-6 w-6 text-orange-600" />;
            default:
                return <Shield className="h-6 w-6 text-gray-600" />;
        }
    };

    const togglePermission = (permission: string) => {
        const currentPermissions = data.permissions;
        if (currentPermissions.includes(permission)) {
            setData(
                'permissions',
                currentPermissions.filter((p) => p !== permission),
            );
        } else {
            setData('permissions', [...currentPermissions, permission]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/roles/${role.id}`);
    };

    const getPermissionCategory = (permission: string) => {
        if (permission.includes('user') || permission.includes('role'))
            return 'User Management';
        if (permission.includes('menu') || permission.includes('inventory'))
            return 'Menu & Inventory';
        if (permission.includes('order') || permission.includes('pos'))
            return 'Order Management';
        if (permission.includes('report') || permission.includes('sales'))
            return 'Reports & Analytics';
        if (permission.includes('cash') || permission.includes('payment'))
            return 'Financial';
        if (permission.includes('kitchen')) return 'Kitchen Operations';
        return 'System';
    };

    const groupedPermissions = availablePermissions.reduce(
        (groups, permission) => {
            const category = getPermissionCategory(permission);
            if (!groups[category]) groups[category] = [];
            groups[category].push(permission);
            return groups;
        },
        {} as Record<string, string[]>,
    );

    const formatPermissionName = (permission: string) => {
        return permission
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role - ${role.display_name}`} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/roles"
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Role Management
                            </Link>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-3">
                        {getRoleIcon(role.name)}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Edit Role: {role.display_name}
                            </h1>
                            <p className="text-gray-600">
                                Modify permissions and details for the{' '}
                                {role.display_name} role
                            </p>
                        </div>
                    </div>
                </div>

                {/* Warning for System Roles */}
                {(role.name === 'admin' || role.name === 'manager') && (
                    <div className="mb-6">
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <h3 className="font-medium text-yellow-800">
                                    {role.name === 'admin'
                                        ? 'System Administrator Role'
                                        : 'Management Role'}
                                </h3>
                            </div>
                            <p className="mt-1 text-sm text-yellow-700">
                                {role.name === 'admin'
                                    ? 'Be careful when modifying admin permissions. Ensure at least one admin user always has full system access.'
                                    : 'This role has elevated permissions for restaurant management. Review changes carefully.'}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <div className="rounded-xl border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                    Basic Information
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Role Name (System)
                                        </label>
                                        <input
                                            type="text"
                                            value={role.name}
                                            disabled
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            System role name cannot be changed
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.display_name}
                                            onChange={(e) =>
                                                setData(
                                                    'display_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Administrator"
                                        />
                                        {errors.display_name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.display_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Describe what this role can do..."
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="is_active"
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) =>
                                                setData(
                                                    'is_active',
                                                    e.target.checked,
                                                )
                                            }
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label
                                            htmlFor="is_active"
                                            className="ml-2 text-sm text-gray-700"
                                        >
                                            Role is active
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Permissions */}
                        <div className="space-y-6">
                            <div className="rounded-xl border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                    Permissions
                                </h2>

                                <div className="space-y-6">
                                    {Object.entries(groupedPermissions).map(
                                        ([category, permissions]) => (
                                            <div key={category}>
                                                <h3 className="mb-3 text-sm font-medium text-gray-900">
                                                    {category}
                                                </h3>
                                                <div className="space-y-2">
                                                    {permissions.map(
                                                        (permission) => (
                                                            <label
                                                                key={permission}
                                                                className="flex items-center space-x-2 rounded p-2 hover:bg-gray-50"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.permissions.includes(
                                                                        permission,
                                                                    )}
                                                                    onChange={() =>
                                                                        togglePermission(
                                                                            permission,
                                                                        )
                                                                    }
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-gray-700">
                                                                    {formatPermissionName(
                                                                        permission,
                                                                    )}
                                                                </span>
                                                            </label>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>

                                {errors.permissions && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.permissions}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                        <Link
                            href="/roles"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
