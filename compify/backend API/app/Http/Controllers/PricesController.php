<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Price;

class PricesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Price::with('product', 'store')->get();
        
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
            'product_id' => 'required|exists:products,product_id',
            'store_id' => 'required|exists:stores,store_id',
            'price' => 'required|numeric|min:0',
            'product_url' => 'required|string|max:255',
        ]);

        $data = Price::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Precio insertado correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = Price::with('product', 'store')->find($id);
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Precio encontrado correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Precio no encontrado',
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
            'product_id' => 'required|exists:products,product_id',
            'store_id' => 'required|exists:stores,store_id',
            'price' => 'required|numeric|min:0',
            'product_url' => 'required|string|max:255',
        ]);

        $data = Price::findOrFail($id);
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Precio actualizado correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = Price::find($id);
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Precio eliminado correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Precio no encontrado',
        ], 404);
    }
}
