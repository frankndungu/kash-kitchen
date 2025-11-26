<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique()->nullable(); // Stock Keeping Unit
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('inventory_categories');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers');
            
            // Stock Information
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->decimal('minimum_stock', 10, 2)->default(0); // Low stock alert threshold
            $table->decimal('maximum_stock', 10, 2)->nullable(); // Maximum storage capacity
            $table->string('unit_of_measure'); // kg, pieces, liters, etc.
            
            // Cost Information
            $table->decimal('unit_cost', 8, 2); // Cost per unit
            $table->decimal('selling_price', 8, 2)->nullable(); // If sold directly
            
            // Tracking
            $table->boolean('is_active')->default(true);
            $table->boolean('track_stock')->default(true);
            $table->date('last_restocked')->nullable();
            $table->json('storage_requirements')->nullable(); // Temperature, etc.
            
            // Audit
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['name', 'is_active']);
            $table->index(['current_stock', 'minimum_stock']);
            $table->index(['category_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};