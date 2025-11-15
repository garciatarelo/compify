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
    /**
     * Recibir laptops desde el microservicio Python (bulk insert)
     */
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

            // Asegurar que existe la categoría "Laptops"
            $laptopCategory = Category::firstOrCreate(
                ['category_name' => 'Laptops'],
                ['category_id' => 8]
            );

            $inserted = 0;
            $updated = 0;
            $errors = [];

            foreach ($request->laptops as $laptopData) {
                try {
                    // Buscar o crear la tienda
                    $store = Store::firstOrCreate(
                        ['name_store' => $laptopData['store_name']],
                        [
                            'base_url' => $laptopData['product_url'] ?? ''
                        ]
                    );

                    // Buscar si ya existe el producto (por marca y modelo)
                    $product = Product::where('brand', $laptopData['brand'])
                        ->where('model', $laptopData['model'])
                        ->where('category_id', $laptopCategory->category_id)
                        ->first();

                    if ($product) {
                        // Actualizar producto existente
                        $product->update([
                            'cpu' => $laptopData['cpu'] ?? 'N/A',
                            'ram' => $laptopData['ram'] ?? 'N/A',
                            'storage' => $laptopData['storage'] ?? 'N/A',
                            'display' => $laptopData['display'] ?? 'N/A',
                            'image_url' => $laptopData['image_url'] ?? '',
                            'description' => $laptopData['description'] ?? '',
                        ]);
                        $updated++;
                    } else {
                        // Crear nuevo producto
                        $product = Product::create([
                            'category_id' => $laptopCategory->category_id,
                            'brand' => $laptopData['brand'],
                            'model' => $laptopData['model'],
                            'cpu' => $laptopData['cpu'] ?? 'N/A',
                            'ram' => $laptopData['ram'] ?? 'N/A',
                            'storage' => $laptopData['storage'] ?? 'N/A',
                            'display' => $laptopData['display'] ?? 'N/A',
                            'image_url' => $laptopData['image_url'] ?? '',
                            'description' => $laptopData['description'] ?? '',
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
                            'url' => $laptopData['product_url'] ?? '',
                            'updated_at' => now()
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
                ->with(['prices.store']);

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
                        'store_name' => $price->store->name_store ?? 'Unknown',
                        'price' => $price->price,
                        'url' => $price->url,
                        'logo_url' => ''
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

