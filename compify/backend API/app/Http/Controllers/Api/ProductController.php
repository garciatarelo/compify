<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Obtener todos los productos por tipo de componente
     */
    public function getByType($type)
    {
        $products = Product::where('component_type', $type)->get();
        return response()->json($products);
    }

    /**
     * Obtener todos los productos agrupados por tipo
     */
    public function getAllComponents()
    {
        $components = [
            'cpu' => Product::where('component_type', 'cpu')->get(),
            'motherboard' => Product::where('component_type', 'motherboard')->get(),
            'ram' => Product::where('component_type', 'ram')->get(),
            'gpu' => Product::where('component_type', 'gpu')->get(),
            'psu' => Product::where('component_type', 'psu')->get(),
            'storage' => Product::where('component_type', 'storage')->get(),
            'case' => Product::where('component_type', 'case')->get(),
        ];

        return response()->json($components);
    }

    /**
     * Verificar compatibilidad entre componentes
     */
    public function checkCompatibility(Request $request)
    {
        $cpuId = $request->input('cpu_id');
        $motherboardId = $request->input('motherboard_id');
        $ramId = $request->input('ram_id');
        $gpuId = $request->input('gpu_id');
        $psuId = $request->input('psu_id');

        $issues = [];

        // Obtener componentes
        $cpu = $cpuId ? Product::find($cpuId) : null;
        $motherboard = $motherboardId ? Product::find($motherboardId) : null;
        $ram = $ramId ? Product::find($ramId) : null;
        $gpu = $gpuId ? Product::find($gpuId) : null;
        $psu = $psuId ? Product::find($psuId) : null;

        // Verificar CPU - Motherboard socket
        if ($cpu && $motherboard) {
            if ($cpu->socket !== $motherboard->socket) {
                $issues[] = [
                    'level' => 'critical',
                    'components' => ['CPU', 'Motherboard'],
                    'message' => "INCOMPATIBLE: {$cpu->brand} {$cpu->model} (socket {$cpu->socket}) NO es compatible con {$motherboard->brand} {$motherboard->model} (socket {$motherboard->socket})",
                ];
            }
        }

        // Verificar RAM - Motherboard
        if ($ram && $motherboard) {
            if ($ram->memory_type !== $motherboard->ram_type) {
                $issues[] = [
                    'level' => 'critical',
                    'components' => ['RAM', 'Motherboard'],
                    'message' => "INCOMPATIBLE: {$ram->brand} {$ram->model} (tipo {$ram->memory_type}) NO es compatible con {$motherboard->brand} {$motherboard->model} (tipo {$motherboard->ram_type})",
                ];
            }

            if ($ram->capacity > $motherboard->max_ram) {
                $issues[] = [
                    'level' => 'warning',
                    'components' => ['RAM', 'Motherboard'],
                    'message' => "ADVERTENCIA: La capacidad de {$ram->brand} {$ram->model} ({$ram->capacity}GB) excede el máximo soportado por {$motherboard->brand} {$motherboard->model} ({$motherboard->max_ram}GB)",
                ];
            }
        }

        // Verificar potencia PSU
        if ($psu && ($cpu || $gpu)) {
            $cpuTDP = $cpu->tdp ?? 0;
            $gpuTDP = $gpu->tdp ?? 0;
            $totalTDP = $cpuTDP + $gpuTDP + 100; // +100W para otros componentes
            $recommended = $totalTDP * 1.3;

            if ($psu->wattage < $totalTDP) {
                $issues[] = [
                    'level' => 'critical',
                    'components' => ['PSU', 'CPU', 'GPU'],
                    'message' => "INSUFICIENTE: {$psu->brand} {$psu->model} ({$psu->wattage}W) NO es suficiente. Consumo estimado: {$totalTDP}W",
                ];
            } elseif ($psu->wattage < $recommended) {
                $issues[] = [
                    'level' => 'warning',
                    'components' => ['PSU'],
                    'message' => "AJUSTADA: {$psu->brand} {$psu->model} ({$psu->wattage}W) es suficiente pero ajustada. Se recomienda {$recommended}W",
                ];
            }
        }

        return response()->json([
            'compatible' => count($issues) === 0,
            'issues' => $issues,
            'components' => [
                'cpu' => $cpu,
                'motherboard' => $motherboard,
                'ram' => $ram,
                'gpu' => $gpu,
                'psu' => $psu,
            ]
        ]);
    }

    /**
     * Obtener un producto específico
     */
    public function show($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

        return response()->json($product);
    }
}

