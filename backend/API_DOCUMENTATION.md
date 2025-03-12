# Snackolicious Delights API Documentation

## Base URL
```
http://your-domain.com/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Products API

### Get Products
```http
GET /products
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `inStock` (optional): Filter by stock status (true/false)
- `rating` (optional): Minimum rating

Response:
```json
{
    "products": [
        {
            "id": "uuid",
            "name": "string",
            "description": "string",
            "price": "number",
            "category": "string",
            "stock": "number",
            "image_url": "string",
            "average_rating": "number",
            "is_available": "boolean",
            "is_pre_order": "boolean",
            "created_at": "timestamp",
            "updated_at": "timestamp"
        }
    ],
    "pagination": {
        "total": "number",
        "page": "number",
        "limit": "number",
        "totalPages": "number"
    }
}
```

### Get Single Product
```http
GET /products/:id
```

Response:
```json
{
    "id": "uuid",
    "name": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "stock": "number",
    "image_url": "string",
    "average_rating": "number",
    "is_available": "boolean",
    "is_pre_order": "boolean",
    "variations": [],
    "ratings": [],
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Create Product (Admin)
```http
POST /products
```

Request Body (multipart/form-data):
```json
{
    "name": "string (required)",
    "description": "string (required)",
    "price": "number (required)",
    "category": "string (required)",
    "stock": "number (required)",
    "image": "file (required)",
    "isAvailable": "boolean",
    "isPreOrder": "boolean"
}
```

### Update Product (Admin)
```http
PUT /products/:id
```

Request Body (multipart/form-data):
```json
{
    "name": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "stock": "number",
    "image": "file",
    "isAvailable": "boolean",
    "isPreOrder": "boolean"
}
```

### Delete Product (Admin)
```http
DELETE /products/:id
```

## Product Variations API

### Get Product Variations
```http
GET /products/:id/variations
```

Response:
```json
[
    {
        "id": "uuid",
        "product_id": "uuid",
        "name": "string",
        "price": "number",
        "stock": "number",
        "attributes": "json",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
]
```

### Add Product Variation (Admin)
```http
POST /products/:id/variations
```

Request Body:
```json
{
    "name": "string (required)",
    "price": "number (required)",
    "stock": "number (required)",
    "attributes": "json"
}
```

## Bulk Operations API (Admin)

### Bulk Update Stock
```http
POST /admin/products/bulk-stock-update
```

Request Body:
```json
{
    "category": "string (optional)",
    "operation": "string (increment|decrement|set)",
    "amount": "number"
}
```

### Bulk Delete Products
```http
POST /admin/products/bulk-delete
```

Request Body:
```json
{
    "productIds": "array of uuids"
}
```

### Bulk Update Status
```http
POST /admin/products/bulk-status-update
```

Request Body:
```json
{
    "productIds": "array of uuids",
    "isAvailable": "boolean"
}
```

### Bulk Update Featured Status
```http
POST /admin/products/bulk-featured-update
```

Request Body:
```json
{
    "productIds": "array of uuids",
    "featured": "boolean"
}
```

## Stock Management API

### Update Product Stock
```http
PUT /products/:id/stock
```

Request Body:
```json
{
    "stock": "number",
    "operation": "string (set|increment|decrement)"
}
```

### Get Low Stock Products (Admin)
```http
GET /admin/products/low-stock
```

Query Parameters:
- `threshold` (optional): Stock threshold (default: 10)

Response:
```json
[
    {
        "id": "uuid",
        "name": "string",
        "stock": "number",
        "low_stock_threshold": "number"
    }
]
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "error": "Error message describing the validation error"
}
```

### 401 Unauthorized
```json
{
    "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
    "error": "Admin access required"
}
```

### 404 Not Found
```json
{
    "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal server error message"
}
```

## Rate Limiting

All API endpoints are rate-limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Exceeding these limits will result in a 429 Too Many Requests response. 