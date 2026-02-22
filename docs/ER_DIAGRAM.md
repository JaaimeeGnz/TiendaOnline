# Diagrama Entidad-Relación (ER) - FashionMarket

## Diagrama ER completo

```mermaid
erDiagram
    %% ========== CATÁLOGO ==========
    categories {
        uuid id PK
        varchar name UK
        varchar slug UK
        text description
        text image_url
        int display_order
        boolean is_active
        uuid parent_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    products {
        uuid id PK
        varchar name
        varchar slug UK
        text description
        int price_cents
        int original_price_cents
        int stock
        uuid category_id FK
        text[] images
        text[] sizes
        varchar color
        varchar material
        varchar brand
        boolean is_active
        boolean featured
        varchar sku
        timestamptz created_at
        timestamptz updated_at
    }

    product_variants {
        uuid id PK
        uuid product_id FK
        varchar size
        varchar color
        int stock
        varchar sku
        timestamptz created_at
        timestamptz updated_at
    }

    product_sizes {
        uuid id PK
        uuid product_id FK
        varchar size
        int stock
        timestamptz created_at
        timestamptz updated_at
    }

    %% ========== USUARIOS ==========
    users {
        uuid id PK
        varchar email UK
        varchar username UK
        varchar full_name
        text avatar_url
        text bio
        timestamptz created_at
        timestamptz updated_at
    }

    addresses {
        uuid id PK
        uuid user_id FK
        varchar name
        varchar phone
        varchar street
        varchar number
        varchar apartment
        varchar city
        varchar state
        varchar postal_code
        varchar country
        boolean is_default
        timestamptz created_at
        timestamptz updated_at
    }

    user_favorites {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        timestamptz created_at
    }

    user_cart {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        int quantity
        timestamptz added_at
        timestamptz updated_at
    }

    %% ========== PEDIDOS ==========
    orders {
        uuid id PK
        text session_id UK
        text customer_email
        serial order_number UK
        jsonb items
        int subtotal_cents
        int shipping_cents
        int total_cents
        jsonb shipping_address
        text payment_status
        text status "pending|paid|shipped|delivered|cancelled"
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        text product_name
        text product_brand
        int quantity
        int price_cents
        int total_cents
        varchar size
        timestamptz created_at
    }

    %% ========== FACTURACIÓN ==========
    invoices {
        uuid id PK
        varchar invoice_number UK
        uuid order_id FK
        text customer_email
        text customer_name
        text type "invoice|credit_note"
        int subtotal_cents
        int tax_cents
        int total_cents
        uuid reference_invoice_id FK
        text reason
        jsonb items
        text status "draft|issued|paid|cancelled"
        timestamptz issued_at
        date due_date
        timestamptz paid_at
        timestamptz created_at
        timestamptz updated_at
    }

    refunds {
        uuid id PK
        uuid order_id FK
        uuid invoice_id FK
        uuid credit_note_id FK
        varchar customer_email
        varchar customer_name
        text reason
        varchar status "pending|approved|rejected|processed"
        int refund_amount_cents
        jsonb returned_items
        varchar refund_method
        timestamptz requested_at
        timestamptz approved_at
        timestamptz processed_at
        timestamptz refund_date
        timestamptz created_at
        timestamptz updated_at
    }

    %% ========== MARKETING ==========
    newsletter_subscribers {
        uuid id PK
        varchar email UK
        varchar discount_code UK
        int discount_percentage
        boolean is_active
        timestamptz subscribed_at
        timestamptz used_at
        timestamptz created_at
        timestamptz updated_at
    }

    discount_codes {
        uuid id PK
        varchar code UK
        int discount_percentage
        varchar discount_type
        int discount_value
        timestamptz valid_from
        timestamptz valid_until
        int max_uses
        int times_used
        int min_purchase_cents
        boolean is_active
        varchar created_by
        timestamptz created_at
        timestamptz updated_at
    }

    discount_code_usage {
        uuid id PK
        uuid code_id FK
        varchar email
        uuid order_id
        int amount_saved_cents
        timestamptz created_at
    }

    flash_offers {
        uuid id PK
        varchar title
        varchar subtitle
        boolean is_active
        timestamptz starts_at
        timestamptz ends_at
        int discount_percentage
        uuid[] product_ids
        timestamptz created_at
        timestamptz updated_at
    }

    %% ========== SOPORTE ==========
    contact_messages {
        uuid id PK
        varchar name
        varchar email
        varchar subject
        text message
        varchar status "new|read|resolved|spam"
        text admin_notes
        uuid assigned_to
        timestamp created_at
        timestamp updated_at
    }

    %% ========== RELACIONES ==========
    categories ||--o{ categories : "parent_id (subcategorías)"
    categories ||--o{ products : "category_id"
    products ||--o{ product_variants : "product_id"
    products ||--o{ product_sizes : "product_id"
    products ||--o{ order_items : "product_id"
    products ||--o{ user_favorites : "product_id"
    products ||--o{ user_cart : "product_id"
    users ||--o{ addresses : "user_id"
    users ||--o{ user_favorites : "user_id"
    users ||--o{ user_cart : "user_id"
    orders ||--o{ order_items : "order_id"
    orders ||--o{ invoices : "order_id"
    orders ||--o{ refunds : "order_id"
    invoices ||--o{ invoices : "reference_invoice_id (abono)"
    invoices ||--o{ refunds : "invoice_id"
    invoices ||--o{ refunds : "credit_note_id"
    discount_codes ||--o{ discount_code_usage : "code_id"
```

---

## Descripción de relaciones principales

### Catálogo
- **categories** → **products**: Cada producto pertenece a una categoría (1:N). Las categorías pueden ser jerárquicas (self-reference con `parent_id`).
- **products** → **product_sizes**: Stock gestionado por talla con stored procedures atómicas (`decrement_stock`, `increment_stock`).
- **products** → **product_variants**: Variantes de producto por talla+color.

### Usuarios
- **auth.users** → **users**: Relación 1:1 con la tabla de autenticación de Supabase.
- **users** → **addresses**: Un usuario puede tener múltiples direcciones.
- **users** → **user_favorites** / **user_cart**: Favoritos y carrito persistente.

### Pedidos (Flujo de 4 estados)
```
Pendiente (pending) → Pagado (paid) → Enviado (shipped) → Entregado (delivered)
                ↓                ↓
           Cancelado         Cancelado
```
- **orders** → **order_items**: Cada pedido contiene N artículos.
- Al crear un pedido (`checkout.ts`), el status inicial es `pending`.
- El admin puede avanzar/retroceder estados desde el panel.
- Cancelación permitida solo en estados `pending` y `paid`.
- Devolución permitida solo en estado `delivered`.

### Facturación y Devoluciones
- **orders** → **invoices**: Cada pedido puede tener facturas asociadas.
- **invoices** → **invoices** (self-ref): Un abono (`credit_note`) referencia la factura original.
- **orders** → **refunds**: Las devoluciones se asocian al pedido.
- **refunds** → **invoices**: La devolución vincula la factura original y la nota de abono.

### Marketing
- **newsletter_subscribers**: Gestión de suscriptores con códigos de descuento automáticos.
- **discount_codes** → **discount_code_usage**: Tracking de uso de códigos.
- **flash_offers**: Ofertas flash con countdown, gestión desde admin.

---

## Flujo de facturación / billing

### 1. Creación del pedido
1. Cliente completa checkout → se crea `order` con status `pending`
2. Stock decrementado atómicamente via stored procedure `process_checkout_stock`
3. Se genera `invoice` de tipo `invoice` con status `issued`

### 2. Procesamiento del pago
1. Stripe procesa el pago mediante checkout session
2. El admin marca el pedido como `paid` → se envía email de confirmación
3. La factura se actualiza a status `paid`

### 3. Envío y entrega
1. Admin marca como `shipped` → email con notificación al cliente
2. Admin marca como `delivered` → email de confirmación de entrega

### 4. Devoluciones
1. Cliente solicita devolución (solo si `delivered`) desde `/account#orders`
2. Se crea registro `refund` con status `pending` y `returned_items`
3. Se genera `invoice` de tipo `credit_note` referenciando la factura original
4. Se restaura el stock via `increment_stock` stored procedure
5. Admin aprueba/procesa la devolución → status cambia a `processed`

### 5. Cancelaciones
1. Cliente puede cancelar desde su cuenta (solo si `pending` o `paid`)
2. Se restaura stock automáticamente
3. El pedido cambia a status `cancelled`
