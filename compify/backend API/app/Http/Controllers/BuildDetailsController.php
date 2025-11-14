<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BuildDetail;

class BuildDetailsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = BuildDetail::with('pcBuild', 'product')->get();
        
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
            'build_id' => 'required|exists:pc_builds,build_id',
            'product_id' => 'required|exists:products,product_id',
        ]);

        $data = BuildDetail::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Detalle de build insertado correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = BuildDetail::with('pcBuild', 'product')->find($id);
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Detalle de build encontrado correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Detalle de build no encontrado',
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
            'build_id' => 'required|exists:pc_builds,build_id',
            'product_id' => 'required|exists:products,product_id',
        ]);

        $data = BuildDetail::findOrFail($id);
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Detalle de build actualizado correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = BuildDetail::find($id);
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Detalle de build eliminado correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Detalle de build no encontrado',
        ], 404);
    }
}
