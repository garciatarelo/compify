<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\StoresController;
use App\Http\Controllers\PricesController;
use App\Http\Controllers\BuildDetailsController;
use App\Http\Controllers\PcBuildsController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\CompatibilitiesController;
use App\Http\Controllers\HistoriesController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\LaptopController;

// Ruta de prueba principal
Route::get('/', function () {
    return response()->json([
        'message' => '¡API Compify funcionando correctamente!'
    ]);
});

// Ruta de prueba sin autenticación
Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => '✓ La API está activa y funcionando',
        'timestamp' => now()
    ]);
});

// Login (POST)
Route::post('/login', [AuthController::class, 'login']);

// Ruta GET para verificar que login existe
Route::get('/login', function () {
    return response()->json([
        'message' => 'Endpoint de login activo',
        'method' => 'Debes usar POST para iniciar sesión',
        'required_fields' => ['email', 'password']
    ]);
});

// Rutas públicas de componentes (sin autenticación para el frontend)
Route::get('/components', [ProductController::class, 'getAllComponents']);
Route::get('/components/{type}', [ProductController::class, 'getByType']);
Route::post('/components/check-compatibility', [ProductController::class, 'checkCompatibility']);
Route::get('/components/product/{id}', [ProductController::class, 'show']);

// Rutas públicas de laptops
Route::get('/laptops', [LaptopController::class, 'index']);
Route::get('/laptops/search', [LaptopController::class, 'search']);
Route::get('/laptops/{id}', [LaptopController::class, 'show']);
Route::post('/laptops/bulk', [LaptopController::class, 'bulkStore']); // Para recibir del microservicio Python

Route::middleware('jwt')->group(function () {
    //Endpoint protegidos con JWT
    Route::apiResource('categories', CategoriesController::class);

    Route::apiResource('products', ProductsController::class);

    Route::apiResource('stores', StoresController::class);

    Route::apiResource('prices', PricesController::class);

    Route::apiResource('build_details', BuildDetailsController::class);

    Route::apiResource('pc_builds', PcBuildsController::class);

    Route::apiResource('users', UsersController::class);

    Route::apiResource('compatibilities', CompatibilitiesController::class);

    Route::apiResource('histories', HistoriesController::class);

    Route::apiResource('favorites', FavoritesController::class);

    
});
