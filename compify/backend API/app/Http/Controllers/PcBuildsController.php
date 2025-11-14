<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PcBuild;
use Illuminate\Support\Facades\Auth;

class PcBuildsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = PcBuild::with('user', 'buildDetails.product')
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
            'build_name' => 'required|string|max:100',
            'total_price' => 'required|numeric|min:0',
        ]);

        $validated['user_id'] = Auth::user()->user_id;
        $data = PcBuild::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Build de PC insertado correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = PcBuild::with('user', 'buildDetails.product')
            ->where('build_id', $id)
            ->where('user_id', Auth::user()->user_id)
            ->first();
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Build de PC encontrado correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Build de PC no encontrado',
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
            'build_name' => 'required|string|max:100',
            'total_price' => 'required|numeric|min:0',
        ]);

        $data = PcBuild::where('build_id', $id)
            ->where('user_id', Auth::user()->user_id)
            ->firstOrFail();
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Build de PC actualizado correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = PcBuild::where('build_id', $id)
            ->where('user_id', Auth::user()->user_id)
            ->first();
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Build de PC eliminado correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Build de PC no encontrado',
        ], 404);
    }
}
