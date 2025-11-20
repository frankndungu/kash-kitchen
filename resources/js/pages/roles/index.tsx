import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Check,
    ChefHat,
    ClipboardList,
    Crown,
    Edit,
    Shield,
    UserCog,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/roles',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    roles: Array<{
        id: number;
        name: string;
        display_name: string;
    }>;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
    permissions: string[];
}

interface RoleManagementProps {
    users: User[];
    roles: Role[];
}

export default function RoleManagement({ users, roles }: RoleManagementProps) {
    const [editingUser, setEditingUser] = useState<number | null>(null);

    const { data, setData, patch, processing } = useForm({
        user_id: 0,
        role_ids: [] as number[],
    });

    const getRoleIcon = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return <Crown className="h-4 w-4 text-yellow-600" />;
            case 'manager':
                return <UserCog className="h-4 w-4 text-blue-600" />;
            case 'cashier':
                return <ClipboardList className="h-4 w-4 text-green-600" />;
            case 'kitchen_staff':
                return <ChefHat className="h-4 w-4 text-orange-600" />;
            default:
                return <Shield className="h-4 w-4 text-gray-600" />;
        }
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'manager':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cashier':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'kitchen_staff':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const startEditing = (user: User) => {
        setEditingUser(user.id);
        setData({
            user_id: user.id,
            role_ids: user.roles.map((role) => role.id),
        });
    };

    const cancelEditing = () => {
        setEditingUser(null);
        setData({ user_id: 0, role_ids: [] });
    };

    const saveRoles = () => {
        patch(`/roles/users/${data.user_id}`, {
            onSuccess: () => {
                setEditingUser(null);
            },
        });
    };

    const toggleRole = (roleId: number) => {
        const currentRoles = data.role_ids;
        if (currentRoles.includes(roleId)) {
            setData(
                'role_ids',
                currentRoles.filter((id) => id !== roleId),
            );
        } else {
            setData('role_ids', [...currentRoles, roleId]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Management" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center space-x-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Role Management
                            </h1>
                            <p className="text-gray-600">
                                Assign roles and permissions to users
                            </p>
                        </div>
                    </div>
                </div>

                {/* Role Descriptions */}
                <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="rounded-lg border border-gray-200 bg-white p-4"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {getRoleIcon(role.name)}
                                    <h3 className="font-semibold text-gray-900">
                                        {role.display_name}
                                    </h3>
                                </div>
                                <Link
                                    href={`/roles/${role.id}/edit`}
                                    className="text-blue-600 hover:text-blue-800"
                                    title={`Edit ${role.display_name} role`}
                                >
                                    <Edit className="h-4 w-4" />
                                </Link>
                            </div>
                            <p className="mb-3 text-sm text-gray-600">
                                {role.description}
                            </p>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700">
                                    Key Permissions:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions
                                        .slice(0, 3)
                                        .map((permission) => (
                                            <span
                                                key={permission}
                                                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                            >
                                                {permission.replace('_', ' ')}
                                            </span>
                                        ))}
                                    {role.permissions.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                            +{role.permissions.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Users Table */}
                <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-gray-700" />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    User Roles
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500">
                                {users.length} users
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Current Roles
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                        <span className="text-sm font-medium text-blue-700">
                                                            {user.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUser === user.id ? (
                                                <div className="space-y-2">
                                                    {roles.map((role) => (
                                                        <label
                                                            key={role.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={data.role_ids.includes(
                                                                    role.id,
                                                                )}
                                                                onChange={() =>
                                                                    toggleRole(
                                                                        role.id,
                                                                    )
                                                                }
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <div className="flex items-center space-x-1">
                                                                {getRoleIcon(
                                                                    role.name,
                                                                )}
                                                                <span className="text-sm">
                                                                    {
                                                                        role.display_name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.length > 0 ? (
                                                        user.roles.map(
                                                            (role) => (
                                                                <span
                                                                    key={
                                                                        role.id
                                                                    }
                                                                    className={`inline-flex items-center space-x-1 rounded-full border px-2 py-1 text-xs font-medium ${getRoleBadgeColor(role.name)}`}
                                                                >
                                                                    {getRoleIcon(
                                                                        role.name,
                                                                    )}
                                                                    <span>
                                                                        {
                                                                            role.display_name
                                                                        }
                                                                    </span>
                                                                </span>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-gray-500">
                                                            No roles assigned
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            {editingUser === user.id ? (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={saveRoles}
                                                        disabled={processing}
                                                        className="flex items-center text-green-600 hover:text-green-900"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="flex items-center text-red-600 hover:text-red-900"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        startEditing(user)
                                                    }
                                                    className="flex items-center text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="mr-1 h-4 w-4" />
                                                    Edit Roles
                                                </button>
                                            )}
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
