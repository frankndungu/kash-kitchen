<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // Relationships
    public function roles()
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'created_by_user_id');
    }

    public function updatedOrders()
    {
        return $this->hasMany(Order::class, 'updated_by_user_id');
    }

    public function cashSessions()
    {
        return $this->hasMany(CashSession::class);
    }

    public function orderStatusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    // Helper methods
    public function hasRole($role)
    {
        if (is_string($role)) {
            return $this->roles->contains('name', $role);
        }
        return $this->roles->contains($role);
    }

    public function hasAnyRole($roles)
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }
        return $this->roles->pluck('name')->intersect($roles)->isNotEmpty();
    }

    public function assignRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->first();
        }
        return $this->roles()->attach($role);
    }

    public function removeRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->first();
        }
        return $this->roles()->detach($role);
    }
}
