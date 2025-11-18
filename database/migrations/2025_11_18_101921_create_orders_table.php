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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // K2501, K2502, etc.
            $table->enum('order_type', ['dine_in', 'takeaway', 'delivery']); 
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('table_number')->nullable(); // For dine-in
            $table->text('delivery_address')->nullable(); // For delivery
            
            // Pricing
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_amount', 8, 2)->default(0);
            $table->decimal('discount_amount', 8, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            
            // Payment
            $table->enum('payment_method', ['cash', 'mpesa']); 
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->string('mpesa_reference')->nullable(); // For M-Pesa transactions
            
            // Status
            $table->enum('order_status', [
                'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
            ])->default('pending');
            
            // Timing
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('estimated_minutes')->nullable();
            
            // Notes and tracking
            $table->text('kitchen_notes')->nullable();
            $table->text('customer_notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            // User tracking
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users');
            
            $table->timestamps();

            // Indexes for performance
            $table->index(['order_status', 'order_type']);
            $table->index(['created_by_user_id', 'created_at']);
            $table->index(['order_number']);
            $table->index(['customer_phone']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
