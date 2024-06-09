# ResulfuAPI EcoSwap

## Base URL
https://back-end-eco-swap-api.vercel.app/

## 1. Registrasi Pengguna

### Endpoint
`POST /daftar`

### Body Permintaan
```json
{
 "username": "lukman",
 "email": "lukman@example.com",
 "password": "lukman12345"
}
Respons
Berhasil: 201
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
    "username": "lukman",
    "email": "lukman@example.com",
    "created_at": "2024-06-06T04:39:48.000Z"
  }
}
