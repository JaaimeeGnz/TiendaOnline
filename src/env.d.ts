interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly PUBLIC_PRODUCTS_BUCKET: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email?: string;
      user_metadata?: Record<string, any>;
    } | null;
    session?: {
      user: {
        id: string;
        email?: string;
        user_metadata?: Record<string, any>;
      };
    } | null;
    isGuest?: boolean;
  }
}
