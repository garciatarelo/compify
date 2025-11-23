<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductGroup;
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

            $laptopCategory = Category::where('category_name', 'Laptops')->first();
            if (!$laptopCategory) {
                $laptopCategory = Category::create([
                    'category_id' => 1,
                    'category_name' => 'Laptops'
                ]);
            }

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

                    $productUrl = $laptopData['product_url'] ?? '';

                    // Check if this specific store item already exists (by URL)
                    $existingPrice = Price::where('product_url', $productUrl)
                                          ->where('store_id', $store->store_id)
                                          ->first();

                    if ($existingPrice) {
                        // Update price
                        $existingPrice->price = $laptopData['price'];
                        $existingPrice->save();
                        
                        // Update Product details (Brand, Model, Specs)
                        $product = Product::find($existingPrice->product_id);
                        if ($product) {
                            // Parse RAM and Storage again for update
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

                            $storageCapacity = null;
                            $storageType = null;
                            if (!empty($laptopData['storage'])) {
                                if (preg_match('/(\d+)\s*(GB|TB)/i', $laptopData['storage'], $matches)) {
                                    $val = (int)$matches[1];
                                    $unit = strtoupper($matches[2]);
                                    $storageCapacity = ($unit === 'TB') ? $val * 1024 : $val;
                                }
                                if (preg_match('/(SSD|HDD|eMMC)/i', $laptopData['storage'], $matches)) {
                                    $storageType = strtoupper($matches[1]);
                                }
                            }

                            $product->brand = $laptopData['brand'];
                            $product->model = $laptopData['model'];
                            $product->capacity = $ramCapacity;
                            $product->ram_type = $ramType;
                            $product->storage_capacity = $storageCapacity;
                            $product->storage_type = $storageType;
                            
                            // Update specs JSON
                            $currentSpecs = $product->specs ?? [];
                            $newSpecs = [
                                'cpu' => $laptopData['cpu'] ?? 'N/A',
                                'ram' => $laptopData['ram'] ?? 'N/A',
                                'storage' => $laptopData['storage'] ?? 'N/A',
                                'display' => $laptopData['display'] ?? 'N/A',
                                'gpu' => $laptopData['gpu'] ?? 'Integrada',
                                'os' => $laptopData['os'] ?? 'No especificado',
                            ];
                            // Merge with existing specs to preserve other fields if any
                            $product->specs = array_merge($currentSpecs, $newSpecs);
                            
                            $product->save();
                        }
                        
                        $updated++;
                    } else {
                        // Create new Product (Unmatched)
                        // Parse RAM and Storage for specific columns if needed
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

                        $storageCapacity = null;
                        $storageType = null;
                        if (!empty($laptopData['storage'])) {
                            if (preg_match('/(\d+)\s*(GB|TB)/i', $laptopData['storage'], $matches)) {
                                $val = (int)$matches[1];
                                $unit = strtoupper($matches[2]);
                                $storageCapacity = ($unit === 'TB') ? $val * 1024 : $val;
                            }
                            if (preg_match('/(SSD|HDD|eMMC)/i', $laptopData['storage'], $matches)) {
                                $storageType = strtoupper($matches[1]);
                            }
                        }

                        $product = Product::create([
                            'category_id' => $laptopCategory->category_id,
                            'brand' => $laptopData['brand'],
                            'model' => $laptopData['model'],
                            'image_url' => $laptopData['image_url'] ?? '',
                            'description' => $laptopData['description'] ?? '',
                            'capacity' => $ramCapacity,
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

                        // Create Price entry
                        Price::create([
                            'product_id' => $product->product_id,
                            'store_id' => $store->store_id,
                            'price' => $laptopData['price'],
                            'product_url' => $productUrl
                        ]);

                        $inserted++;
                    }

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
            // Only fetch groups that have products
            $query = ProductGroup::has('products')
                ->with(['products.prices.store', 'products.category']);

            // Search logic needs to search within products
            if ($request->has('q')) {
                $searchTerm = $request->q;
                $query->whereHas('products', function($q) use ($searchTerm) {
                    $q->where('brand', 'like', '%' . $searchTerm . '%')
                      ->orWhere('model', 'like', '%' . $searchTerm . '%');
                });
            }
            
            // Pagination
            $perPage = $request->get('per_page', 20);
            $groups = $query->paginate($perPage);

            // Transform
            $groups->getCollection()->transform(function ($group) {
                $allPrices = collect();
                $products = [];
                foreach ($group->products as $product) {
                    $productPrices = [];
                    foreach ($product->prices as $price) {
                        $allPrices->push([
                            'store_name' => $price->store->name_store ?? 'Unknown',
                            'price' => $price->price,
                            'url' => $price->product_url,
                            'logo_url' => ''
                        ]);
                        $productPrices[] = [
                            'store_name' => $price->store->name_store ?? 'Unknown',
                            'price' => $price->price,
                            'url' => $price->product_url,
                            'logo_url' => ''
                        ];
                    }
                    $products[] = [
                        'product_id' => $product->product_id,
                        'brand' => $product->brand,
                        'model' => $product->model,
                        'specs' => $product->specs,
                        'image_url' => $product->image_url,
                        'prices' => $productPrices,
                        'min_price' => collect($productPrices)->min('price') ?? 0,
                        'max_price' => collect($productPrices)->max('price') ?? 0,
                    ];
                }
                return [
                    'group_id' => $group->id,
                    'name' => $group->name,
                    'image_url' => $group->image_url ?? ($products[0]['image_url'] ?? null),
                    'products' => $products,
                    'prices' => $allPrices,
                    'min_price' => $allPrices->min('price') ?? 0,
                    'max_price' => $allPrices->max('price') ?? 0,
                ];
            });

            return response()->json($groups, 200);

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

