<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // List all products (raw view)
    public function index(Request $request)
    {
        $query = Product::with(['prices.store', 'category']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('brand', 'like', "%$search%")
                  ->orWhere('model', 'like', "%$search%");
            });
        }
        
        if ($request->has('store')) {
             $storeName = $request->store;
             $query->whereHas('prices.store', function($q) use ($storeName) {
                 $q->where('name_store', 'like', "%$storeName%");
             });
        }

        // Filter by type (laptops vs components)
        if ($request->has('type')) {
            if ($request->type === 'laptops') {
                $query->whereNull('component_type');
            } elseif ($request->type === 'components') {
                $query->whereNotNull('component_type');
            } elseif (in_array($request->type, ['cpu', 'gpu', 'ram', 'motherboard', 'storage', 'psu', 'case'])) {
                $query->where('component_type', $request->type);
            }
        }

        // Filter by unmatched
        if ($request->has('unmatched') && $request->unmatched == 'true') {
            $query->whereNull('product_group_id');
        }

        // If searching, increase page size to show more results
        $perPage = $request->has('search') && !empty($request->search) ? 100 : 50;

        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    // Create a group from products
    public function createGroup(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array|min:1',
            'name' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Create group
            $group = new ProductGroup();
            
            // Use name from request or first product
            if ($request->name) {
                $group->name = $request->name;
            } else {
                $firstProduct = Product::find($request->product_ids[0]);
                if ($firstProduct) {
                    $group->name = $firstProduct->brand . ' ' . $firstProduct->model;
                    $group->image_url = $firstProduct->image_url;
                }
            }
            $group->save();

            // Assign products
            Product::whereIn('product_id', $request->product_ids)->update(['product_group_id' => $group->id]);

            DB::commit();
            return response()->json(['success' => true, 'group' => $group]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Add product to group
    public function addToGroup(Request $request, $groupId)
    {
        $request->validate([
            'product_ids' => 'required|array',
        ]);

        Product::whereIn('product_id', $request->product_ids)->update(['product_group_id' => $groupId]);

        return response()->json(['success' => true]);
    }

    // Remove product from group
    public function removeFromGroup(Request $request, $groupId)
    {
        $request->validate([
            'product_ids' => 'required|array',
        ]);

        Product::whereIn('product_id', $request->product_ids)
               ->where('product_group_id', $groupId)
               ->update(['product_group_id' => null]);

        // Check if group is empty, maybe delete it?
        $count = Product::where('product_group_id', $groupId)->count();
        if ($count == 0) {
            ProductGroup::destroy($groupId);
            return response()->json(['success' => true, 'message' => 'Group deleted as it became empty']);
        }

        return response()->json(['success' => true]);
    }
    
    // List groups
    public function listGroups(Request $request)
    {
        $query = ProductGroup::with('products.prices.store');

        if ($request->has('type')) {
            $type = $request->type;
            if ($type === 'laptops') {
                $query->whereHas('products', function($q) {
                    $q->whereNull('component_type');
                });
            } elseif ($type === 'components') {
                $query->whereHas('products', function($q) {
                    $q->whereNotNull('component_type');
                });
            }
        }

        $groups = $query->orderBy('created_at', 'desc')->paginate(20);
        return response()->json($groups);
    }

    // Delete a product
    public function destroy($id)
    {
        try {
            $product = Product::find($id);
            if (!$product) {
                return response()->json(['success' => false, 'message' => 'Product not found'], 404);
            }

            // Delete associated prices first (if cascade is not set in DB)
            $product->prices()->delete();
            
            // Delete product
            $product->delete();

            return response()->json(['success' => true, 'message' => 'Product deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
