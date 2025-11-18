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
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name'); // 1/4 Chicken + Chips Plain
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 8, 2); // 350.00
            $table->decimal('cost_price', 8, 2)->nullable(); // For profit tracking
            $table->string('sku')->nullable()->unique(); // Stock keeping unit
            $table->boolean('is_available')->default(true);
            $table->boolean('is_combo')->default(false); // For combo meals
            $table->json('combo_items')->nullable(); // JSON array for combo breakdown
            $table->boolean('requires_kitchen')->default(true);
            $table->integer('preparation_time_minutes')->default(10);
            $table->string('image_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->json('allergens')->nullable(); // Array of allergen info
            $table->text('special_instructions')->nullable();
            $table->timestamps();

            $table->index(['category_id', 'is_available', 'sort_order']);
            $table->index(['is_available', 'is_combo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
