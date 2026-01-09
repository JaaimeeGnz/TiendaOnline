#!/usr/bin/env python3
"""
Script para ejecutar el schema SQL en Supabase
"""
import os
import sys
from supabase import create_client, Client

# Credenciales de Supabase
SUPABASE_URL = "https://pygrobxheswyltsgyzfd.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z3JvYnhoZXN3eWx0c2d5emZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkzMDYyOSwiZXhwIjoyMDgzNTA2NjI5fQ.vKPGZ2bJFfUKBxU4hJQRKXp1bX8z7Y9pL2mN3qR8sT0"

def execute_sql():
    """Ejecutar schema SQL en Supabase"""
    try:
        # Crear cliente Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        # Leer archivo SQL
        with open('docs/supabase_schema.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Ejecutar SQL
        print("⏳ Ejecutando schema SQL en Supabase...")
        response = supabase.postgrest.sql(sql_content)
        
        print("✅ Schema SQL ejecutado exitosamente!")
        print(f"Respuesta: {response}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error ejecutando SQL: {e}")
        return False

if __name__ == "__main__":
    execute_sql()
