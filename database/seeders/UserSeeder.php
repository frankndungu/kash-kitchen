<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'System Administrator',
                'email' => 'admin@kashkitchen.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ],
            [
                'name' => 'Restaurant Manager',
                'email' => 'manager@kashkitchen.com',
                'password' => Hash::make('manager123'),
                'role' => 'manager'
            ],
            [
                'name' => 'Cashier One',
                'email' => 'cashier1@kashkitchen.com',
                'password' => Hash::make('cashier123'),
                'role' => 'cashier'
            ],
            [
                'name' => 'Kitchen Staff',
                'email' => 'kitchen@kashkitchen.com',
                'password' => Hash::make('kitchen123'),
                'role' => 'kitchen_staff'
            ],
            [
                'name' => 'Kash Kash',
                'email' => 'kashkash@demo.com',
                'password' => Hash::make('12345678'),
                'role' => 'admin'
            ]
        ];

        foreach ($users as $userData) {
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => $userData['password'],
                'email_verified_at' => now(),
            ]);

            $role = Role::where('name', $userData['role'])->first();
            if ($role) {
                $user->roles()->attach($role);
            }
        }
    }
}