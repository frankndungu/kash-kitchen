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
        Schema::create('menu_item_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->constrained('menu_items');
            $table->foreignId('inventory_item_id')->constrained('inventory_items');
            
            // Recipe Information
            $table->decimal('quantity_needed', 8, 3); // How much inventory item needed per menu item
            $table->string('unit_of_measure'); // kg, pieces, ml, etc.
            $table->decimal('cost_per_serving', 8, 2); // Cost of this ingredient per menu item
            
            // Recipe details
            $table->text('preparation_notes')->nullable();
            $table->boolean('is_critical')->default(true); // Can't make dish without this ingredient
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            // Ensure unique combination
            $table->unique(['menu_item_id', 'inventory_item_id']);
            $table->index(['menu_item_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_item_ingredients');
    }
};