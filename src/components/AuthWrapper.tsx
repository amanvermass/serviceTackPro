"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import toastConfig from "./CustomToast";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // List of public paths that don't require authentication
    const publicPaths = ["/", "/forgot-password"];
    
    // Check if the current path is public
    const isPublicPath = publicPaths.includes(pathname);

    const checkAuth = () => {
      const token = localStorage.getItem("token");
      let isTokenValid = false;

      if (token) {
        try {
          // Decode JWT payload to check expiration
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          
          if (payload.exp && payload.exp * 1000 < Date.now()) {
             // Token expired
             localStorage.removeItem("token");
             localStorage.removeItem("user");
             if (!isPublicPath) {
               toastConfig.error("Session expired. Please login again.");
             }
          } else {
             isTokenValid = true;
          }
        } catch (e) {
           // Invalid token format
           localStorage.removeItem("token");
           localStorage.removeItem("user");
        }
      }
      
      if (!isTokenValid && !isPublicPath) {
        // If no valid token and trying to access private route
        setIsAuthenticated(false);
        router.push("/");
      } else if (isTokenValid && pathname === "/") {
        // If authenticated and trying to access login page, redirect to dashboard
        setIsAuthenticated(true);
        router.push("/dashboard"); 
      } else {
        setIsAuthenticated(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show nothing while checking auth to prevent flash of protected content
  // Unless it's a public path, then we can show it immediately (though checking is fast)
  if (loading) {
    return null; 
    // Or return a loading spinner:
    // return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
