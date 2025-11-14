<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Product::with('category')->get();
        
        return response()->json([
            'status' => 'ok',
            'data' => $data
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,category_id',
            'brand' => 'required|string|max:50',
            'model' => 'required|string|max:100',
            'cpu' => 'nullable|string|max:100',
            'ram' => 'nullable|string|max:20',
            'storage' => 'nullable|string|max:50',
            'display' => 'nullable|string|max:50',
            'image_url' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $data = Product::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Producto insertado correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = Product::with('category', 'prices.store')->find($id);
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Producto encontrado correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Producto no encontrado',
        ], 404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,category_id',
            'brand' => 'required|string|max:50',
            'model' => 'required|string|max:100',
            'cpu' => 'nullable|string|max:100',
            'ram' => 'nullable|string|max:20',
            'storage' => 'nullable|string|max:50',
            'display' => 'nullable|string|max:50',
            'image_url' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $data = Product::findOrFail($id);
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Producto actualizado correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = Product::find($id);
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Producto eliminado correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Producto no encontrado',
        ], 404);
    }
}
