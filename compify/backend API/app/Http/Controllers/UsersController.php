<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = User::select('user_id', 'name', 'lastname_p', 'lastname_m', 'username', 'email', 'user_type', 'created_at', 'updated_at')->get();
        
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
            'name' => 'required|string|max:100',
            'lastname_p' => 'required|string|max:50',
            'lastname_m' => 'required|string|max:50',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|string|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
            'user_type' => 'required|integer',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $data = User::create($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Usuario insertado correctamente',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = User::select('user_id', 'name', 'lastname_p', 'lastname_m', 'username', 'email', 'user_type', 'created_at', 'updated_at')->find($id);
        
        if ($data) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Usuario encontrado correctamente',
                'data' => $data
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Usuario no encontrado',
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
            'name' => 'required|string|max:100',
            'lastname_p' => 'required|string|max:50',
            'lastname_m' => 'required|string|max:50',
            'username' => 'required|string|max:50|unique:users,username,'.$id.',user_id',
            'email' => 'required|string|email|max:100|unique:users,email,'.$id.',user_id',
            'user_type' => 'required|integer',
        ]);

        if ($request->has('password')) {
            $validated['password'] = Hash::make($request->password);
        }

        $data = User::findOrFail($id);
        $data->update($validated);

        return response()->json([
            'status' => 'ok',
            'message' => 'Usuario actualizado correctamente',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = User::find($id);
        
        if ($data) {
            $data->delete();
            return response()->json([
                'status' => 'ok',
                'message' => 'Usuario eliminado correctamente',
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Usuario no encontrado',
        ], 404);
    }
}
