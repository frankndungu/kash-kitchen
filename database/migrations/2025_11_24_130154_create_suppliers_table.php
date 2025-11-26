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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('supplier_code')->unique()->nullable();
            $table->text('description')->nullable();
            
            // Contact Information
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->default('Kenya');
            
            // Business Information
            $table->string('tax_number')->nullable(); // KRA PIN
            $table->json('payment_terms')->nullable(); // Net 30, etc.
            $table->decimal('credit_limit', 10, 2)->nullable();
            $table->enum('supplier_type', ['local', 'international', 'wholesale', 'retail'])->default('local');
            
            // Performance Tracking
            $table->decimal('average_delivery_days', 5, 2)->nullable();
            $table->enum('reliability_rating', ['excellent', 'good', 'average', 'poor'])->nullable();
            $table->text('notes')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->date('last_order_date')->nullable();
            
            $table->timestamps();
            
            $table->index(['is_active', 'supplier_type']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};