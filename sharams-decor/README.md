# Sharam's Decor

A starter full-stack marketplace for handmade Indian home and festive decorations.

## Stack
- Frontend: React + Vite
- Backend: Python Flask
- Database: Neon PostgreSQL

## 1. Requirements
- Node.js 18+
- Python 3.10+
- A Neon PostgreSQL database (free tier is enough for development)

## 2. Configure Neon
1. Create a project at https://neon.tech
2. Copy the PostgreSQL connection string.
3. Open `backend/.env` and replace `YOUR_NEON_DATABASE_URL` with your connection string.

Do not share or commit your real database password. The `.env` file is ignored by Git.

## 3. Run the backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
The API runs at http://127.0.0.1:5000. The database tables are created automatically on first run.

## 4. Run the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL printed by Vite (normally http://localhost:5173).

## Included
- Responsive decor storefront
- Product search and category filtering
- Add-to-cart interaction (demo cart in browser memory)
- Seller form to submit a product listing to Flask
- Flask product CRUD API
- Neon PostgreSQL persistence
- Sample decor products and supplied product photos

## Important before selling publicly
This is a starter MVP, not a production payment platform. Before accepting real orders:
- Add secure customer/seller authentication and role permissions.
- Add image uploads to Cloudinary or another storage provider.
- Integrate a payment provider such as Razorpay and verify payments server-side.
- Add shipping, returns, privacy policy, terms, and seller verification.
- Never store card details yourself.
