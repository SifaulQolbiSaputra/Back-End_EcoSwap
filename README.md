# ResulfuAPI EcoSwap

## Base URL
https://back-end-eco-swap-api.vercel.app/

## 1. Registrasi Pengguna

### Endpoint : POST /daftar

### Body Permintaan : 
```json
{
  "username": "lukman", 
  "email": "lukman@example.com",
  "password": "lukman12345"
}
```

### Respons
Berhasil: 201
```json
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
```

## 2. Login Pengguna

### Endpoint: POST /login

### Body Permintaan:
```json
{
  "email": "lukman@example.com",
  "password": "lukman12345"
}
```

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "User login successful",
    "data": {
        "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmOTIyMjY0NC05NTVlLTRkMmItYTNiNy03ZDZkM2VjYzRkYjkiLCJyb2xlIjoidXNlciIsImlhdCI6MTcxNzY0ODg0MCwiZXhwIjoxNzE3NjUyNDQwfQ.pD0QjaOmGNF2K3F2Tev958TUpZcLcdHVuxTMFDwnPr8",
        "userId": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9"
    }
}
```

## 3. Login Admin

### Endpoint: POST /login/admin

### Body Permintaan:
```json
{
  "email": "admins@gmail.com",
  "password": "admins12345"
}
```

### Respons:
Berhasil: 200
```json

{
    "status": "success",
    "message": "Admin login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyYmY0MTIyNy0yMGJiLTExZWYtYTIxZC01NGUxYWQzOTFjMzAiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTc2NDkzMzUsImV4cCI6MTcxNzY1MjkzNX0.PFKov7Xq_BpG7o8N-i_pz3ffmYxDfsh-7_WN1dRHmqg",
        "adminId": "2bf41227-20bb-11ef-a21d-54e1ad391c30"
    }
}
```

## 4. Logout

### Endpoint: POST /logout

### Headers:
```json
{
  "Authorization": "Bearer token"
}
```
### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Logout successful",
    "data": null
}
```

## 5. Permintaan Penjemputan

### Endpoint: POST /pickups

### Headers:
```json
{
  "Authorization": "Bearer token"
}
```

### Body Permintaan: 
```json
{
    "name": "lukman",
    "address": "jakarta",
    "phone": "0836262726",
    "description": "depan pabrik sepatu"
}
```

### Respons:
Berhasil: 201
```json
{
    "status": "success",
    "message": "Pickup request submitted successfully",
    "data": {
        "id": "1567ab98-50de-4d47-868f-9cc6ef8f4d4d",
        "userid": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
        "nama": "lukman",
        "alamat": "jakarta",
        "noTelpon": "0836262726",
        "status": "pending"
    }
}
```

## 6. Batalkan Penjemputan

### Endpoint: DELETE /batal-pickups/{id}

### Headers:
```json
{
  "Authorization": "Bearer token"
}
```

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Pickup request canceled successfully",
    "data": null
}
```

## 7. Setujui penjemputan oleh admin

### Endpoint: POST /pickups/{id}/approve

### Headers:
```json
{
  "Authorization": "Bearer token admin"
}
```

### Body Permintaan:
```json
{
    "wasteType": "besi",
    "weight": 1,
    "points": 10000
}
```

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Pickup request approved and points added",
    "data": {
        "jenissampah": "besi",
        "berat": 1,
        "poin": 10000,
        "status": "approved"
    }
}
```

## 8. Permintaan Penarikan

### Endpoint: POST /withdrawals

### Headers:
```json
{
  "Authorization": "Bearer token user"
}
```

### Body Permintaan:
```json
{
  "name": "lukman",
  "email": "lukman@email.com",
  "phone": "081234567890",
  "ewallet": "Nama E-Wallet",
  "amount": 5000
}
```

### Respons:
Berhasil: 201
```json
{
    "status": "success",
    "message": "Withdrawal request submitted successfully",
    "data": {
        "id": "27135c43-75fe-42c1-9090-11d1a952d2b7",
        "user_id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
        "name": "lukman",
        "email": "lukman@email.com",
        "phone": "081234567890",
        "ewallet": "Nama E-Wallet",
        "amount": 5000,
        "status": "pending",
        "created_at": "2024-06-06T05:02:22.000Z"
    }
}
```

## 9. Setujui Penarikan oleh admin

### Endpoint: PUT /withdrawals/{id}/approve

### Headers:
```json
{
  "Authorization": "Bearer token admin"
}
```

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Withdrawal request approved successfully",
    "data": {
        "status": "approved"
    }
}
```

## 10. Update Informasi Pengguna

### Endpoint: PUT /users/{id}

### Body Permintaan:
```json
{
  "username": "lukman",
  "email": "lukman@example.com",
  "password": "lukman1111"
}
```

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "User updated successfully",
    "data": {
        "id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
        "username": "lukman",
        "email": "lukman@example.com"
    }
}
```

## 11. Ambil Semua data Pengguna

### Endpoint: GET /users

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Users retrieved successfully",
    "data": [
        {
            "id": "1b240762-0c1d-41f7-8b0c-7787f86957ba",
            "username": "paulina",
            "email": "paulina@example.com",
            "created_at": "2024-06-04T05:02:19.000Z"
        }
   ]
}
```

## 12. Ambil Informasi Pengguna

### Endpoint: GET /users/{id}

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "User retrieved successfully",
    "data": {
        "id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
        "username": "lukman",
        "email": "lukman@example.com",
        "created_at": "2024-06-06T04:39:48.000Z"
    }
}
```

## 13. Ambil Semua Data Penjemputan

### Endpoint: GET /pickups

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "All pickups retrieved successfully",
    "data": [
        {
            "id": "292f5f33-1d3f-44af-b86f-23ece56cce5a",
            "user_id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
            "name": "lukman",
            "address": "jakarta",
            "phone": "0836262726",
            "description": "depan pabrik sepatu",
            "status": "approved",
            "created_at": "2024-06-06T04:54:20.000Z",
            "waste_type": "besi",
            "weight": 1,
            "points": 10000
        }
    ]
}
```

## 14. Ambil penjemputan Berdasarkan ID

### Endpoint: GET /pickups/{id}

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Pickup found",
    "data": {
        "id": "292f5f33-1d3f-44af-b86f-23ece56cce5a",
        "user_id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
        "name": "lukman",
        "address": "jakarta",
        "phone": "0836262726",
        "description": "depan pabrik sepatu",
        "status": "approved",
        "created_at": "2024-06-06T04:54:20.000Z",
        "waste_type": "besi",
        "weight": 1,
        "points": 10000
    }
}
```

## 15. Ambil Penjemputan Berdasarkan User ID

### Endpoint: GET /pickups/users/{userId}

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Pickups retrieved successfully",
    "data": [
        {
            "id": "292f5f33-1d3f-44af-b86f-23ece56cce5a",
            "user_id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
            "name": "lukman",
            "address": "jakarta",
            "phone": "0836262726",
            "description": "depan pabrik sepatu",
            "status": "approved",
            "created_at": "2024-06-06T04:54:20.000Z",
            "waste_type": "besi",
            "weight": 1,
            "points": 10000
        }
    ]
}
```

## 16. Ambil Semua data Penarikan

### Endpoint: GET /withdrawals

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "All withdrawal requests retrieved successfully",
    "data": [
        {
            "id": "27135c43-75fe-42c1-9090-11d1a952d2b7",
            "user_id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
            "name": "lukman",
            "email": "lukman@email.com",
            "phone": "081234567890",
            "ewallet": "Nama E-Wallet",
            "amount": 5000,
            "status": "approved",
            "created_at": "2024-06-06T05:02:22.000Z"
        },
  ]
}
```
## 17. Ambil Penarikan Berdasarkan ID

### Endpoint: GET /withdrawals/{id}

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Withdrawal found",
    "data": {
        "id": "27135c43-75fe-42c1-9090-11d1a952d2b7",
        "user_id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
        "name": "lukman",
        "email": "lukman@email.com",
        "phone": "081234567890",
        "ewallet": "Nama E-Wallet",
        "amount": 5000,
        "status": "approved",
        "created_at": "2024-06-06T05:02:22.000Z"
    }
}
```

## 18. Ambil Total Poin Pengguna

### Endpoint: GET /points/{userId}

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "User points retrieved successfully",
    "data": {
        "id": "a006a692-7a20-408c-89fa-ded394e1eb3f",
        "user_id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
        "total_points": 10000
    }
}
```

## 19. Ambil Token Berdasarkan User ID

### Endpoint: GET /tokens/{userId}

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Tokens retrieved successfully",
    "data": [
        {
            "id": "e80a12d9-e8d2-4f54-a50f-681f41a20ff7",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmOTIyMjY0NC05NTVlLTRkMmItYTNiNy03ZDZkM2VjYzRkYjkiLCJyb2xlIjoidXNlciIsImlhdCI6MTcxNzY0OTQ0NSwiZXhwIjoxNzE3NjUzMDQ1fQ.0KSYH290QRX-jEh4XnN0Z3UDCEpfWV82yPgU-wMqL74",
            "user_id": "f9222644-955e-4d2b-a3b7-7d6d3ecc4db9",
            "created_at": "2024-06-06T04:50:45.000Z",
            "role": "user"
        }
    ]
}
```

## 20. Menghapus Penjemputan

### Endpoint: DELETE /hapus-pickups/{id}

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Pickup request deleted successfully",
    "data": null
}
```

## 21. Menghapus Penarikan

### Endpoint: DELETE /hapus-withdrawals/{id}

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "Withdrawal request deleted successfully",
    "data": null
}
```

## 22. Menghapus User

### Endpoint: DELETE /hapus-users/{id}

### Respons:
Berhasil: 200
```json
{
    "status": "success",
    "message": "user request deleted successfully",
    "data": null
}
```
