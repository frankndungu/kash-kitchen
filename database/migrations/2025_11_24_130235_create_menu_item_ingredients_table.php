<?php

   use Illuminate\Database\Migrations\Migration;
   use Illuminate\Database\Schema\Blueprint;
   use Illuminate\Support\Facades\Schema;

   return new class extends Migration
   {
       public function up(): void
       {
           Schema::create('menu_item_ingredients', function (Blueprint $table) {
               $table->id();
               $table->foreignId('menu_item_id')->constrained('menu_items')->onDelete('cascade');
               $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
               $table->decimal('quantity_used', 10, 3); // Amount consumed per menu item
               $table->string('unit', 20); // Unit of measurement (kg, pcs, etc.)
               $table->timestamps();

               // Prevent duplicate ingredient assignments
               $table->unique(['menu_item_id', 'inventory_item_id']);
           });
       }

       public function down(): void
       {
           Schema::dropIfExists('menu_item_ingredients');
       }
   };