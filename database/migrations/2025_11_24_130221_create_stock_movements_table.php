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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items');
            
            // Movement Details
            $table->enum('movement_type', ['in', 'out', 'adjustment', 'transfer', 'waste']);
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_cost', 8, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();
            
            // Stock Levels (snapshot at time of movement)
            $table->decimal('previous_stock', 10, 2);
            $table->decimal('new_stock', 10, 2);
            
            // Reference Information
            $table->string('reference_type')->nullable(); // 'order', 'purchase', 'adjustment'
            $table->unsignedBigInteger('reference_id')->nullable(); // Related order/purchase ID
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            
            // Reason & Notes
            $table->string('reason')->nullable(); // 'sale', 'purchase', 'waste', 'theft', etc.
            $table->text('notes')->nullable();
            
            // Supplier information (for incoming stock)
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers');
            
            // User tracking
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('movement_date')->default(now());
            $table->timestamps();
            
            // Indexes for reporting
            $table->index(['inventory_item_id', 'movement_date']);
            $table->index(['movement_type', 'movement_date']);
            $table->index(['reference_type', 'reference_id']);
            $table->index('movement_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};