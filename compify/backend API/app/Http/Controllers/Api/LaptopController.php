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

class LaptopController extends Controller
{
     public function bulkStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'laptops' => 'required|array',
            'laptops.*.brand' => 'required|string|max:50',
            'laptops.*.model' => 'required|string|max:100',
            'laptops.*.cpu' => 'nullable|string|max:100',
            'laptops.*.ram' => 'nullable|string|max:20',
            'laptops.*.storage' => 'nullable|string|max:50',
            'laptops.*.display' => 'nullable|string|max:50',
            'laptops.*.gpu' => 'nullable|string|max:50',
            'laptops.*.os' => 'nullable|string|max:100',
            'laptops.*.price' => 'required|numeric|min:0',
            'laptops.*.image_url' => 'nullable|string|max:255',
            'laptops.*.description' => 'nullable|string',
            'laptops.*.product_url' => 'nullable|string|max:500',
            'laptops.*.store_name' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $laptopCategory = Category::firstOrCreate(
                ['category_name' => 'Laptops'],
                ['category_id' => 8]
            );

            $inserted = 0;
            $updated = 0;
            $errors = [];

            foreach ($request->laptops as $laptopData) {
                try {
                    $store = Store::firstOrCreate(
                        ['name_store' => $laptopData['store_name']],
                        [
                            'store_url' => $laptopData['product_url'] ?? ''
                        ]
                    );

                    // Normalización básica para búsqueda
                    $searchBrand = trim($laptopData['brand']);
                    $searchModel = trim($laptopData['model']);
                    
                    $ramCapacity = null;
                    $ramType = null;
                    if (!empty($laptopData['ram'])) {
                        if (preg_match('/(\d+)\s*GB/i', $laptopData['ram'], $matches)) {
                            $ramCapacity = (int)$matches[1];
                        }
                        if (preg_match('/(DDR\d[A-Z]*)/i', $laptopData['ram'], $matches)) {
                            $ramType = strtoupper($matches[1]);
                        }
                    }

                    // Intento 1: Búsqueda exacta
                    $query = Product::where('brand', $searchBrand)
                        ->where('model', $searchModel)
                        ->where('category_id', $laptopCategory->category_id);
                    
                    // Refinar por Pantalla (Display) - Estricto
                    if (!empty($laptopData['display']) && preg_match('/(\d+(\.\d+)?)/', $laptopData['display'], $matches)) {
                        $displaySize = $matches[1];
                        $query->where('specs->display', 'LIKE', "%{$displaySize}%");
                    }

                    $product = $query->first();

                    // Intento 2: Búsqueda flexible (si no hay exacta)
                    if (!$product) {
                        $product = Product::where('brand', $searchBrand)
                            ->where('category_id', $laptopCategory->category_id)
                            ->where(function($query) use ($searchModel) {
                                // Evitar coincidencias vacías o muy cortas
                                if (strlen($searchModel) > 3) {
                                    $query->where('model', 'LIKE', "%{$searchModel}%")
                                          ->orWhereRaw("? LIKE CONCAT('%', model, '%')", [$searchModel]);
                                }
                            });
                        
                        // Refinar por Pantalla (Display) - Estricto también en flexible
                        if (!empty($laptopData['display']) && preg_match('/(\d+(\.\d+)?)/', $laptopData['display'], $matches)) {
                            $displaySize = $matches[1];
                            $product->where('specs->display', 'LIKE', "%{$displaySize}%");
                        }
                        
                        // Refinar por CPU si está disponible (búsqueda simple de palabras clave)
                        if (!empty($laptopData['cpu'])) {
                            $cpuKeywords = [];
                            if (stripos($laptopData['cpu'], 'i3') !== false) $cpuKeywords[] = 'i3';
                            elseif (stripos($laptopData['cpu'], 'i5') !== false) $cpuKeywords[] = 'i5';
                            elseif (stripos($laptopData['cpu'], 'i7') !== false) $cpuKeywords[] = 'i7';
                            elseif (stripos($laptopData['cpu'], 'i9') !== false) $cpuKeywords[] = 'i9';
                            elseif (stripos($laptopData['cpu'], 'Ryzen 3') !== false) $cpuKeywords[] = 'Ryzen 3';
                            elseif (stripos($laptopData['cpu'], 'Ryzen 5') !== false) $cpuKeywords[] = 'Ryzen 5';
                            elseif (stripos($laptopData['cpu'], 'Ryzen 7') !== false) $cpuKeywords[] = 'Ryzen 7';
                            elseif (stripos($laptopData['cpu'], 'Ryzen 9') !== false) $cpuKeywords[] = 'Ryzen 9';
                            elseif (stripos($laptopData['cpu'], 'Celeron') !== false) $cpuKeywords[] = 'Celeron';
                            elseif (stripos($laptopData['cpu'], 'Pentium') !== false) $cpuKeywords[] = 'Pentium';
                            elseif (stripos($laptopData['cpu'], 'Athlon') !== false) $cpuKeywords[] = 'Athlon';
                            elseif (stripos($laptopData['cpu'], 'M1') !== false) $cpuKeywords[] = 'M1';
                            elseif (stripos($laptopData['cpu'], 'M2') !== false) $cpuKeywords[] = 'M2';
                            elseif (stripos($laptopData['cpu'], 'M3') !== false) $cpuKeywords[] = 'M3';
                            
                            if (!empty($cpuKeywords)) {
                                $product->where(function($q) use ($cpuKeywords) {
                                    foreach ($cpuKeywords as $keyword) {
                                        $q->where('specs', 'LIKE', "%{$keyword}%");
                                    }
                                });
                            }
                        }

                        // NOTA: Se eliminaron las restricciones estrictas de RAM y Almacenamiento
                        // para permitir agrupar variantes con diferente capacidad pero mismo procesador/pantalla.
                        
                        $product = $product->first();
                    }

                    $storageCapacity = null;

                    $storageCapacity = null;
                    $storageType = null;
                    if (!empty($laptopData['storage'])) {
                        // Detectar capacidad (GB o TB)
                        if (preg_match('/(\d+)\s*(GB|TB)/i', $laptopData['storage'], $matches)) {
                            $val = (int)$matches[1];
                            $unit = strtoupper($matches[2]);
                            $storageCapacity = ($unit === 'TB') ? $val * 1024 : $val;
                        }
                        // Detectar tipo
                        if (preg_match('/(SSD|HDD|eMMC)/i', $laptopData['storage'], $matches)) {
                            $storageType = strtoupper($matches[1]);
                        }
                    }

                    if ($product) {
                        // Actualizar producto existente
                        // Prioridad a Cyberpuerta para detalles visuales y técnicos si el producto actual tiene datos pobres
                        // O si el dato entrante es de Cyberpuerta y el actual no (heurística simple: si store_name es Cyberpuerta, forzamos update)
                        
                        $isCyberpuerta = strtolower($laptopData['store_name']) === 'cyberpuerta';
                        
                        $updateData = [
                            // Actualizar columnas específicas siempre si vienen en el request
                            'capacity' => $ramCapacity ?? $product->capacity,
                            'ram_type' => $ramType ?? $product->ram_type,
                            'storage_capacity' => $storageCapacity ?? $product->storage_capacity,
                            'storage_type' => $storageType ?? $product->storage_type,
                        ];

                        // Solo actualizar imagen y descripción si están vacías O si viene de Cyberpuerta (que suele tener mejores datos)
                        if (empty($product->image_url) || ($isCyberpuerta && !empty($laptopData['image_url']))) {
                            $updateData['image_url'] = $laptopData['image_url'];
                        }
                        
                        if (empty($product->description) || ($isCyberpuerta && !empty($laptopData['description']))) {
                            $updateData['description'] = $laptopData['description'];
                        }

                        // Merge de specs
                        $currentSpecs = $product->specs ?? [];
                        $newSpecs = [
                            'cpu' => $laptopData['cpu'] ?? 'N/A',
                            'ram' => $laptopData['ram'] ?? 'N/A',
                            'storage' => $laptopData['storage'] ?? 'N/A',
                            'display' => $laptopData['display'] ?? 'N/A',
                            'gpu' => $laptopData['gpu'] ?? 'Integrada',
                            'os' => $laptopData['os'] ?? 'No especificado',
                            'cpu_family' => $laptopData['cpu_family'] ?? null,
                            'cpu_model' => $laptopData['cpu_model'] ?? null,
                            'ssd' => $laptopData['ssd'] ?? null,
                            'hdd' => $laptopData['hdd'] ?? null,
                            'emmc' => $laptopData['emmc'] ?? null,
                            'display_res' => $laptopData['display_res'] ?? null,
                            'touch' => $laptopData['touch'] ?? null,
                            'keyboard' => $laptopData['keyboard'] ?? null,
                        ];
                        
                        // Si es Cyberpuerta, sobrescribimos specs. Si no, solo llenamos huecos.
                        if ($isCyberpuerta) {
                            $mergedSpecs = array_merge($currentSpecs, array_filter($newSpecs));
                        } else {
                            $mergedSpecs = array_merge(array_filter($newSpecs), $currentSpecs); // Current specs tienen prioridad si no es Cyberpuerta
                        }
                        
                        $updateData['specs'] = $mergedSpecs;

                        $product->update($updateData);
                        $updated++;
                    } else {
                        // Crear nuevo producto
                        $product = Product::create([
                            'category_id' => $laptopCategory->category_id,
                            'brand' => $laptopData['brand'],
                            'model' => $laptopData['model'],
                            'image_url' => $laptopData['image_url'] ?? '',
                            'description' => $laptopData['description'] ?? '',
                            // Llenar columnas específicas
                            'capacity' => $ramCapacity, // RAM Capacity
                            'ram_type' => $ramType,
                            'storage_capacity' => $storageCapacity,
                            'storage_type' => $storageType,
                            'specs' => [
                                'cpu' => $laptopData['cpu'] ?? 'N/A',
                                'ram' => $laptopData['ram'] ?? 'N/A',
                                'storage' => $laptopData['storage'] ?? 'N/A',
                                'display' => $laptopData['display'] ?? 'N/A',
                                'gpu' => $laptopData['gpu'] ?? 'Integrada',
                                'os' => $laptopData['os'] ?? 'No especificado',
                                // Campos detallados
                                'cpu_family' => $laptopData['cpu_family'] ?? null,
                                'cpu_model' => $laptopData['cpu_model'] ?? null,
                                'ssd' => $laptopData['ssd'] ?? null,
                                'hdd' => $laptopData['hdd'] ?? null,
                                'emmc' => $laptopData['emmc'] ?? null,
                                'display_res' => $laptopData['display_res'] ?? null,
                                'touch' => $laptopData['touch'] ?? null,
                                'keyboard' => $laptopData['keyboard'] ?? null,
                            ],
                        ]);
                        $inserted++;
                    }

                    // Actualizar o crear precio
                    Price::updateOrCreate(
                        [
                            'product_id' => $product->product_id,
                            'store_id' => $store->store_id
                        ],
                        [
                            'price' => $laptopData['price'],
                            'product_url' => $laptopData['product_url'] ?? ''
                        ]
                    );

                } catch (\Exception $e) {
                    $errors[] = [
                        'laptop' => $laptopData['brand'] . ' ' . $laptopData['model'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Laptops procesadas correctamente',
                'inserted' => $inserted,
                'updated' => $updated,
                'errors' => $errors,
                'total_processed' => $inserted + $updated
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error procesando laptops',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todas las laptops con sus precios
     */
    public function index(Request $request)
    {
        try {
            $laptopCategory = Category::where('category_name', 'Laptops')->first();
            
            if (!$laptopCategory) {
                return response()->json([
                    'success' => false,
                    'message' => 'Categoría Laptops no encontrada'
                ], 404);
            }

            $query = Product::where('category_id', $laptopCategory->category_id)
                ->with(['prices.store'])
                ->withCount('prices')
                ->orderBy('prices_count', 'desc');

            // Filtros opcionales
            if ($request->has('brand')) {
                $query->where('brand', 'like', '%' . $request->brand . '%');
            }

            if ($request->has('min_price')) {
                $query->whereHas('prices', function($q) use ($request) {
                    $q->where('price', '>=', $request->min_price);
                });
            }

            if ($request->has('max_price')) {
                $query->whereHas('prices', function($q) use ($request) {
                    $q->where('price', '<=', $request->max_price);
                });
            }

            // Paginación
            $perPage = $request->get('per_page', 20);
            $laptops = $query->paginate($perPage);

            // Transformar datos para incluir mejor precio
            $laptops->getCollection()->transform(function ($laptop) {
                $prices = $laptop->prices->map(function ($price) {
                    return [
                        'store_name' => $price->store->name_store,
                        'price' => $price->price,
                        'url' => $price->product_url, // Usar la URL específica del precio/producto
                        'logo_url' => ''
                    ];
                });

                return [
                    'product_id' => $laptop->product_id,
                    'brand' => $laptop->brand,
                    'model' => $laptop->model,
                    'cpu' => $laptop->specs['cpu'] ?? 'N/A',
                    'ram' => $laptop->specs['ram'] ?? 'N/A',
                    'storage' => $laptop->specs['storage'] ?? 'N/A',
                    'display' => $laptop->specs['display'] ?? 'N/A',
                    'gpu' => $laptop->specs['gpu'] ?? 'Integrada',
                    'os' => $laptop->specs['os'] ?? 'No especificado',
                    'specs' => $laptop->specs, // Devolver todos los detalles
                    'image_url' => $laptop->image_url,
                    'description' => $laptop->description,
                    'prices' => $prices,
                    'min_price' => $prices->min('price') ?? 0,
                    'max_price' => $prices->max('price') ?? 0,
                ];
            });

            return response()->json($laptops, 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo laptops',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una laptop específica por ID
     */
    public function show($id)
    {
        try {
            $laptop = Product::with(['prices.store', 'category'])
                ->find($id);

            if (!$laptop) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laptop no encontrada'
                ], 404);
            }

            $prices = $laptop->prices->map(function ($price) {
                return [
                    'store_name' => $price->store->name_store ?? 'Unknown',
                    'price' => $price->price,
                    'url' => $price->url
                ];
            });

            return response()->json([
                'product_id' => $laptop->product_id,
                'brand' => $laptop->brand,
                'model' => $laptop->model,
                'cpu' => $laptop->cpu,
                'ram' => $laptop->ram,
                'storage' => $laptop->storage,
                'display' => $laptop->display,
                'image_url' => $laptop->image_url,
                'description' => $laptop->description,
                'category' => $laptop->category->category_name,
                'prices' => $prices,
                'min_price' => $prices->min('price') ?? 0,
                'max_price' => $prices->max('price') ?? 0,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo laptop',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar laptops por criterios
     */
    public function search(Request $request)
    {
        try {
            $laptopCategory = Category::where('category_name', 'Laptops')->first();
            
            if (!$laptopCategory) {
                return response()->json([
                    'success' => false,
                    'message' => 'Categoría Laptops no encontrada'
                ], 404);
            }

            $query = Product::where('category_id', $laptopCategory->category_id)
                ->with(['prices.store']);

            // Búsqueda por texto
            if ($request->has('q')) {
                $searchTerm = $request->q;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('brand', 'like', '%' . $searchTerm . '%')
                      ->orWhere('model', 'like', '%' . $searchTerm . '%')
                      ->orWhere('cpu', 'like', '%' . $searchTerm . '%')
                      ->orWhere('description', 'like', '%' . $searchTerm . '%');
                });
            }

            $laptops = $query->limit(20)->get();

            $laptops->transform(function ($laptop) {
                $prices = $laptop->prices->map(function ($price) {
                    return [
                        'store_name' => $price->store->name_store ?? 'Unknown',
                        'price' => $price->price,
                        'url' => $price->url
                    ];
                });

                return [
                    'product_id' => $laptop->product_id,
                    'brand' => $laptop->brand,
                    'model' => $laptop->model,
                    'cpu' => $laptop->cpu,
                    'ram' => $laptop->ram,
                    'storage' => $laptop->storage,
                    'display' => $laptop->display,
                    'image_url' => $laptop->image_url,
                    'prices' => $prices,
                    'min_price' => $prices->min('price') ?? 0
                ];
            });

            return response()->json([
                'success' => true,
                'results' => $laptops
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en búsqueda',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

