<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\History;
use Illuminate\Support\Facades\Auth;

class HistoriesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = History::with('user', 'price.product', 'price.store')
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
            'price_id' => 'required|exists:prices,price_id',
        ]);

        $validated['user_id'] = Auth::user()->user_id;
        $data = History::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Historial insertado correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = History::with('user', 'price.product', 'price.store')
            ->where('history_id', $id)
            ->where('user_id', Auth::user()->user_id)
            ->first();
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Historial encontrado correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Historial no encontrado',
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
            'price_id' => 'required|exists:prices,price_id',
        ]);

        $data = History::where('history_id', $id)
            ->where('user_id', Auth::user()->user_id)
            ->firstOrFail();
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Historial actualizado correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = History::where('history_id', $id)
            ->where('user_id', Auth::user()->user_id)
            ->first();
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Historial eliminado correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Historial no encontrado',
        ], 404);
    }
}
