import { useEffect, useState } from 'react';
import { supabaseClient } from '../../lib/supabase';

export default function AdminProtected({ children }: { children: any }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
          window.location.href = '/auth';
          return;
        }

        // Verificar si es admin (compara email)
        const adminEmail = session.user.email?.toLowerCase() === 'jaimechipiona2006@gmail.com';
        
        if (!adminEmail) {
          window.location.href = '/productos';
          return;
        }

        setIsAdmin(true);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking auth:', error);
        window.location.href = '/auth';
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return children;
}
