<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Store;

class StoresController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Store::all();
        
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
            'name_store' => 'required|string|max:100',
            'base_url' => 'required|string|max:255',
        ]);

        $data = Store::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Tienda insertada correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = Store::with('prices.product')->find($id);
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Tienda encontrada correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Tienda no encontrada',
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
            'name_store' => 'required|string|max:100',
            'base_url' => 'required|string|max:255',
        ]);

        $data = Store::findOrFail($id);
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Tienda actualizada correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = Store::find($id);
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Tienda eliminada correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Tienda no encontrada',
        ], 404);
    }
}
