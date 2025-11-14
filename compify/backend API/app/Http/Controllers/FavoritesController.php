<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorite;
use Illuminate\Support\Facades\Auth;

class FavoritesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Favorite::with('user', 'category')
            ->where('user_id', Auth::user()->user_id)
            ->get();
        
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
            'reference' => 'required|integer',
        ]);

        $validated['user_id'] = Auth::user()->user_id;
        $validated['saved_at'] = now();
        $data = Favorite::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Favorito insertado correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = Favorite::with('user', 'category')
            ->where('favorite_id', $id)
            ->where('user_id', Auth::user()->user_id)
            ->first();
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Favorito encontrado correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Favorito no encontrado',
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
            'reference' => 'required|integer',
        ]);

        $data = Favorite::where('favorite_id', $id)
            ->where('user_id', Auth::user()->user_id)
            ->firstOrFail();
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Favorito actualizado correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = Favorite::where('favorite_id', $id)
            ->where('user_id', Auth::user()->user_id)
            ->first();
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Favorito eliminado correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Favorito no encontrado',
        ], 404);
    }
}
