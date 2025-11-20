<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect('login');
        }

        $user = Auth::user();
        
        // Check if user has any of the required roles
        if (!$user->hasAnyRole($roles)) {
            // Handle JSON requests (API calls)
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Unauthorized access',
                    'message' => 'You do not have permission to access this resource.'
                ], 403);
            }
            
            // Handle web requests - redirect with error message
            return redirect()->route('dashboard')
                           ->with('error', 'You do not have permission to access this area.');
        }

        return $next($request);
    }
}
