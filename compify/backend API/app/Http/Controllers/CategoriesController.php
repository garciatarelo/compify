<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoriesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Category::all();
        
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
            'category_name' => 'required|string|max:50',
        ]);

        $data = Category::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Categoría insertada correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = Category::find($id);
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Categoría encontrada correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Categoría no encontrada',
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
            'category_name' => 'required|string|max:50',
        ]);

        $data = Category::findOrFail($id);
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Categoría actualizada correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = Category::find($id);
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Categoría eliminada correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Categoría no encontrada',
        ], 404);
    }
}
