<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductsController extends Controller
{
    /**
     * GET /api/products
     */
    public function index()
    {
        $products = Product::with('category')->get();

        return response()->json([
            "status" => "ok",
            "data" => $products,
            "message" => "Lista de productos obtenida exitosamente"
        ]);
    }

    /**
     * POST /api/products
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|integer|exists:categories,category_id',
            'brand'       => 'required|string|max:100',
            'model'       => 'required|string|max:150',
            'image_url'   => 'nullable|string',
            'description' => 'nullable|string',
            'base_price'  => 'nullable|numeric',
            'specs'       => 'nullable|array' 
        ]);

        $product = Product::create($validated);

        return response()->json([
            "status" => "created",
            "message" => "Producto creado exitosamente",
            "data" => $product
        ], 201);
    }

    /**
     * GET /api/products/{id}
     */
    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);

        return response()->json([
            "status" => "ok",
            "message" => "Producto obtenido exitosamente",
            "data" => $product
        ]);
    }

    /**
     * PUT /api/products/{id}
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|integer|exists:categories,category_id',
            'brand'       => 'sometimes|string|max:100',
            'model'       => 'sometimes|string|max:150',
            'image_url'   => 'nullable|string',
            'description' => 'nullable|string',
            'base_price'  => 'nullable|numeric',
            'specs'       => 'nullable|array' 
        ]);

        $product->update($validated);

        return response()->json([
            "status" => "updated",
            "message" => "Producto actualizado exitosamente",
            "data" => $product
        ]);
    }

    /**
     * DELETE /api/products/{id}
     */
    public function destroy($id)
    {
        Product::findOrFail($id)->delete();

        return response()->json([
            "status" => "deleted",
            "message" => "Producto eliminado exitosamente",
            "data" => null
        ]);
    }
}
