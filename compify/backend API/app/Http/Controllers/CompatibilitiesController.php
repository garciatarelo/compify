<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Compatibility;

class CompatibilitiesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Compatibility::with('product1', 'product2')->get();
        
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
            'product_id_1' => 'required|exists:products,product_id',
            'product_id_2' => 'required|exists:products,product_id',
            'is_comparable' => 'required|boolean',
        ]);

        $data = Compatibility::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Compatibilidad insertada correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = Compatibility::with('product1', 'product2')->find($id);
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Compatibilidad encontrada correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Compatibilidad no encontrada',
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
            'product_id_1' => 'required|exists:products,product_id',
            'product_id_2' => 'required|exists:products,product_id',
            'is_comparable' => 'required|boolean',
        ]);

        $data = Compatibility::findOrFail($id);
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Compatibilidad actualizada correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = Compatibility::find($id);
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Compatibilidad eliminada correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Compatibilidad no encontrada',
        ], 404);
    }
}
