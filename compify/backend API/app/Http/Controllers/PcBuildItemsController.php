<?php

namespace App\Http\Controllers;

use App\Models\PcBuildItem;
use Illuminate\Http\Request;

class PcBuildItemsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = PcBuildItem::with(['pcBuild', 'product'])->get();
        
        return response()->json([
            'status' => 'ok',
            'message' => 'Lista de items de build obtenida correctamente',
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
        // Depuración - ver qué recibimos
        \Log::info('Datos recibidos:', $request->all());
        
        $validated = $request->validate([
            'build_id' => 'required|exists:pc_builds,build_id',
            'product_id' => 'required|exists:products,product_id',
            'quantity' => 'required|integer|min:1',
            'price_at_purchase' => 'nullable|numeric',
        ]);

        // Convertir a números si vienen como strings (form data)
        $validated['build_id'] = (int) $validated['build_id'];
        $validated['product_id'] = (int) $validated['product_id'];
        $validated['quantity'] = (int) $validated['quantity'];
        if (isset($validated['price_at_purchase'])) {
            $validated['price_at_purchase'] = (float) $validated['price_at_purchase'];
        }

        \Log::info('Datos validados:', $validated);

        try {
            $data = PcBuildItem::create($validated);
            \Log::info('Item creado exitosamente:', $data->toArray());
        } catch (\Exception $e) {
            \Log::error('Error al crear item:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al crear item: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'status' => 'ok',
            'message' => 'Item de build agregado correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = PcBuildItem::with(['pcBuild', 'product'])->find($id);
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Item de build encontrado correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Item de build no encontrado',
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
            'quantity' => 'required|integer|min:1',
            'price_at_purchase' => 'nullable|numeric',
        ]);

        try {
            $data = PcBuildItem::findOrFail($id);
            $data->update($validated);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar item: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'status' => 'ok',
            'message' => 'Item de build actualizado correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = PcBuildItem::find($id);
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Item de build eliminado correctamente',
                'data' => null
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Item de build no encontrado',
        ], 404);
    }

    /**
     * Get items by build ID
     */
    public function getByBuild($buildId)
    {
        $items = PcBuildItem::where('build_id', $buildId)
            ->with(['product'])
            ->get();
            
        return response()->json([
            'status' => 'ok',
            'data' => $items
        ]);
    }

    /**
     * Get items by product ID
     */
    public function getByProduct($productId)
    {
        $items = PcBuildItem::where('product_id', $productId)
            ->with(['pcBuild'])
            ->get();
            
        return response()->json([
            'status' => 'ok',
            'data' => $items
        ]);
    }
}
