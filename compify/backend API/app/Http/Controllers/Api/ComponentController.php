<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Price;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ComponentController extends Controller
{
    public function index(Request $request)
    {
        // Fetch all components grouped by type, formatted for Builder.jsx
        $types = ['cpu', 'motherboard', 'ram', 'gpu', 'psu', 'storage', 'case', 'cooler'];
        $result = [];

        foreach ($types as $type) {
            $products = Product::where('component_type', $type)
                ->where('description', 'not like', 'PC %')
                ->where('description', 'not like', '% PC %')
                ->where('description', 'not like', '% PC')
                ->where('description', 'not like', '%Laptop%')
                ->where('description', 'not like', '%Mouse%')
                ->where('description', 'not like', '%Teclado%')
                ->where('description', 'not like', '%Headset%')
                ->where('description', 'not like', '%Audifonos%')
                ->where('description', 'not like', '%Monitor%')
                ->with(['prices.store', 'productGroup'])
                ->get();

            // Grouping Logic (Memory based)
            $groups = [];

            foreach ($products as $product) {
                // Determine Group Key
                if ($product->product_group_id) {
                    $key = 'ID_' . $product->product_group_id;
                } else {
                    // Normalize for grouping
                    $brand = trim(strtolower($product->brand));
                    $model = trim(strtolower($product->model));
                    
                    // Prevent grouping of generic models
                    $genericTerms = ['n/a', 'generico', 'generic', 'null', 'undefined', ''];
                    if (in_array($model, $genericTerms) || strlen($model) < 2) {
                        $key = 'UNIQUE_' . $product->product_id;
                    } else {
                        $key = $brand . '_' . $model;
                    }
                }

                if (!isset($groups[$key])) {
                    $groups[$key] = [
                        'id' => $product->product_group_id ? 'group_' . $product->product_group_id : $product->product_id,
                        'name' => $product->product_group_id ? $product->productGroup->name : $product->brand . ' ' . $product->model,
                        'specs' => $this->formatSpecs($product),
                        'socket' => $product->socket,
                        'tdp' => $product->tdp,
                        'type' => $product->component_type,
                        'capacity' => $product->capacity,
                        'memory_type' => $product->memory_type,
                        'image' => $product->product_group_id ? ($product->productGroup->image_url ?? $product->image_url) : $product->image_url,
                        'compatibleWith' => $this->getCompatibility($product),
                        'is_group' => (bool)$product->product_group_id,
                        'all_prices' => [],
                        'representative_product' => $product
                    ];
                }

                // Collect prices
                foreach ($product->prices as $price) {
                    $groups[$key]['all_prices'][] = [
                        'name' => $price->store->name_store ?? 'Unknown',
                        'price' => $price->price,
                        'url' => $price->product_url,
                        'logo' => $this->getStoreLogo($price->store->name_store ?? ''),
                        'shipping' => 'Consultar',
                        'product_id' => $product->product_id,
                    ];
                }
            }

            // Transform to items list
            $items = [];
            foreach ($groups as $key => $group) {
                $prices = $group['all_prices'];
                
                // Sort prices cheap to expensive
                usort($prices, function($a, $b) {
                    return $a['price'] <=> $b['price'];
                });

                // Count unique stores
                $uniqueStores = collect($prices)->unique('name')->count();

                $items[] = [
                    'id' => $group['id'],
                    'name' => $group['name'],
                    'specs' => $group['specs'],
                    'socket' => $group['socket'],
                    'tdp' => $group['tdp'],
                    'type' => $group['type'],
                    'capacity' => $group['capacity'],
                    'memory_type' => $group['memory_type'],
                    'image' => $group['image'],
                    'stores' => $prices,
                    'priceHistory' => [],
                    'compatibleWith' => $group['compatibleWith'],
                    'is_group' => $group['is_group'] || count($prices) > 1,
                    'store_count' => $uniqueStores
                ];
            }

            // Sort items by store_count DESC
            usort($items, function($a, $b) {
                return $b['store_count'] <=> $a['store_count'];
            });

            $result[$type] = [
                'name' => $this->getCategoryName($type),
                'icon' => $this->getCategoryIcon($type),
                'items' => $items,
            ];
        }

        return response()->json($result);
    }

    private function normalizeModelName($name)
    {
        // Deprecated or unused if we use manual grouping
        return $name;
    }

    public function bulkStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'components' => 'required|array',
            'components.*.type' => 'required|string', // cpu, gpu, etc.
            'components.*.brand' => 'required|string',
            'components.*.model' => 'required|string',
            'components.*.price' => 'required|numeric',
            'components.*.store_name' => 'required|string',
            'components.*.product_url' => 'required|string',
            // Optional specs
            'components.*.socket' => 'nullable|string',
            'components.*.tdp' => 'nullable|numeric',
            'components.*.memory_type' => 'nullable|string',
            'components.*.capacity' => 'nullable|numeric',
            'components.*.image_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $count = 0;
            foreach ($request->components as $data) {
                // Filter out "PC" (Full computers) - Backend Guard
                $desc = $data['description'] ?? ($data['brand'] . ' ' . $data['model']);
                if (stripos($desc, 'PC ') !== false || stripos($desc, ' PC') !== false || $desc === 'PC' || stripos($desc, 'Computadora') !== false) {
                    // Skip if it's not a case (Gabinete) - just to be safe, or skip all if user insists
                    // Assuming "PC" in name usually means full build for CPU/GPU/RAM etc.
                    // But for cases, "Gabinete PC" is common.
                    if ($data['type'] !== 'case') {
                        continue;
                    }
                }

                // 1. Find or Create Category
                $category = Category::firstOrCreate(['category_name' => ucfirst($data['type'])]);

                // 2. Find or Create Store
                $store = Store::firstOrCreate(['name_store' => $data['store_name']]);

                // 3. Find or Create Product (Logic to avoid duplicates)
                // This is tricky. We need to match by Model + Brand usually.
                $product = Product::where('model', $data['model'])
                    ->where('brand', $data['brand'])
                    ->where('component_type', $data['type'])
                    ->first();

                if (!$product) {
                    $product = new Product();
                    $product->brand = $data['brand'];
                    $product->model = $data['model'];
                    $product->component_type = $data['type'];
                    $product->category_id = $category->category_id;
                }

                // Update details (whether new or existing)
                $product->image_url = $data['image_url'] ?? $product->image_url;
                $product->description = $data['description'] ?? ($data['brand'] . ' ' . $data['model']);
                
                // Update JSON specs
                // Merge with existing specs if any, but prioritize new data if not null
                $currentSpecs = $product->specs ? json_decode($product->specs, true) : [];
                
                $newSpecs = [
                    'socket' => $data['specs']['socket'] ?? $data['socket'] ?? $currentSpecs['socket'] ?? null,
                    'tdp' => $data['specs']['tdp'] ?? $data['tdp'] ?? $currentSpecs['tdp'] ?? null,
                    'memory_type' => $data['specs']['memory_type'] ?? $data['memory_type'] ?? $currentSpecs['memory_type'] ?? null,
                    'capacity' => $data['specs']['capacity'] ?? $data['capacity'] ?? $currentSpecs['capacity'] ?? null,
                ];
                
                $product->specs = json_encode($newSpecs);
                
                // If you have individual columns for these, update them too. 
                // Based on migration, you only have 'specs' JSON, but if you added columns later:
                // $product->socket = $newSpecs['socket']; 
                // ...
                
                $product->save();

                // 4. Update or Create Price
                Price::updateOrCreate(
                    [
                        'product_id' => $product->product_id,
                        'store_id' => $store->store_id,
                        'product_url' => $data['product_url']
                    ],
                    [
                        'price' => $data['price'],
                        'currency' => 'MXN', // Default
                        'last_updated' => now()
                    ]
                );
                $count++;
            }

            DB::commit();
            return response()->json(['success' => true, 'processed' => $count]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    private function getCategoryName($type)
    {
        $names = [
            'cpu' => 'Procesador (CPU)',
            'motherboard' => 'Placa Base',
            'ram' => 'Memoria RAM',
            'gpu' => 'Tarjeta Gráfica',
            'psu' => 'Fuente de Poder',
            'storage' => 'Almacenamiento',
            'case' => 'Gabinete',
            'cooler' => 'Enfriamiento',
        ];
        return $names[$type] ?? ucfirst($type);
    }

    private function getCategoryIcon($type)
    {
        $icons = [
            'cpu' => 'cpu',
            'motherboard' => 'circuit-board',
            'ram' => 'memory-stick',
            'gpu' => 'zap', // Or another icon
            'psu' => 'zap',
            'storage' => 'hard-drive',
            'case' => 'box',
            'cooler' => 'fan',
        ];
        return $icons[$type] ?? 'package';
    }

    private function getStoreLogo($storeName)
    {
        // Simple mapping, can be improved
        if (stripos($storeName, 'amazon') !== false) return '🛒';
        if (stripos($storeName, 'cyberpuerta') !== false) return '🚪';
        if (stripos($storeName, 'elektra') !== false) return '⚡';
        return '🏪';
    }

    private function formatSpecs($product)
    {
        $specs = [];
        if ($product->socket) $specs[] = $product->socket;
        if ($product->memory_type) $specs[] = $product->memory_type;
        if ($product->capacity) $specs[] = $product->capacity . 'GB';
        if ($product->tdp) $specs[] = $product->tdp . 'W';
        
        return implode(', ', $specs);
    }

    private function getCompatibility($product)
    {
        // Return compatibility info based on type
        if ($product->component_type === 'cpu') {
            return ['motherboard' => [$product->socket]];
        }
        if ($product->component_type === 'motherboard') {
            return ['cpu' => [$product->socket], 'ram' => [$product->memory_type]];
        }
        // ... add more logic
        return [];
    }
}
