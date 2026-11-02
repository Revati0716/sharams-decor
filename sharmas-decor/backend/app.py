import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

DATABASE_URL = os.getenv("DATABASE_URL", "")

def get_conn():
    if not DATABASE_URL or DATABASE_URL == "YOUR_NEON_DATABASE_URL":
        raise RuntimeError("Set DATABASE_URL in backend/.env to your Neon PostgreSQL connection string.")
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor, sslmode="require")

def init_db():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(180) NOT NULL,
                    category VARCHAR(80) NOT NULL DEFAULT 'Decor',
                    description TEXT NOT NULL DEFAULT '',
                    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
                    image_url TEXT NOT NULL DEFAULT '',
                    seller_name VARCHAR(120) NOT NULL DEFAULT 'Sharam''s Decor',
                    stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("SELECT COUNT(*) AS count FROM products")
            if cur.fetchone()["count"] == 0:
                cur.executemany("""
                    INSERT INTO products (name, category, description, price, image_url, seller_name, stock)
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                """, [
                    ("Festive Pearl Toran", "Torans", "A colourful handcrafted toran for your entrance.", 799, "/products/toran.jpg", "Sharam's Decor", 12),
                    ("Traditional Wall Hanging", "Wall Hangings", "A bright traditional wall accent with decorative tassels.", 649, "/products/wall-hanging.jpg", "Sharam's Decor", 8),
                    ("Pearl Flower Tea Light Set", "Diyas & Lights", "Decorative flower-shaped tea light holders for festive evenings.", 999, "/products/tea-lights.jpg", "Sharam's Decor", 10),
                    ("Handmade Door Hanging Set", "Wall Hangings", "Colourful handcrafted hanging decorations for your home.", 899, "/products/hanging-set.jpg", "Sharam's Decor", 6),
                    ("Decorative Mirror", "Wall Decor", "A statement mirror with a traditional geometric frame.", 1199, "/products/mirror.jpg", "Sharam's Decor", 5),
                    ("Festive Rangoli Mat", "Rangoli", "Bright festive floor decoration for celebrations.", 549, "/products/rangoli.jpg", "Sharam's Decor", 14),
                    ("Handmade Beaded Bandhanwar", "Torans", "A vibrant handmade decorative bandhanwar for special occasions.", 749, "/products/bandhanwar.jpg", "Sharam's Decor", 9)
                ])
        conn.commit()

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "Sharam's Decor API"})

@app.get("/api/products")
def list_products():
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM products ORDER BY created_at DESC, id DESC")
                return jsonify(cur.fetchall())
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

@app.post("/api/products")
def create_product():
    data = request.get_json(silent=True) or {}
    required = ["name", "category", "price"]
    missing = [field for field in required if data.get(field) in (None, "")]
    if missing:
        return jsonify({"error": "Missing required fields: " + ", ".join(missing)}), 400
    try:
        price = float(data["price"])
        stock = int(data.get("stock", 1))
        if price < 0 or stock < 0:
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({"error": "Price and stock must be valid non-negative numbers."}), 400
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO products (name, category, description, price, image_url, seller_name, stock)
                    VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING *
                """, (
                    data["name"].strip(), data["category"], data.get("description", ""),
                    price, data.get("image_url", ""), data.get("seller_name", "Community Seller"), stock
                ))
                product = cur.fetchone()
            conn.commit()
        return jsonify(product), 201
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

@app.put("/api/products/<int:product_id>")
def update_product(product_id):
    data = request.get_json(silent=True) or {}
    allowed = ["name", "category", "description", "price", "image_url", "seller_name", "stock"]
    updates = {key: data[key] for key in allowed if key in data}
    if not updates:
        return jsonify({"error": "No fields supplied to update."}), 400
    assignments = ", ".join(f"{key} = %s" for key in updates)
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE products SET {assignments} WHERE id = %s RETURNING *",
                    list(updates.values()) + [product_id]
                )
                product = cur.fetchone()
            conn.commit()
        if not product:
            return jsonify({"error": "Product not found."}), 404
        return jsonify(product)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

@app.delete("/api/products/<int:product_id>")
def delete_product(product_id):
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM products WHERE id = %s RETURNING id", (product_id,))
                deleted = cur.fetchone()
            conn.commit()
        if not deleted:
            return jsonify({"error": "Product not found."}), 404
        return jsonify({"message": "Product deleted.", "id": product_id})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

if __name__ == "__main__":
    try:
        init_db()
        print("Database connected and products table is ready.")
    except Exception as exc:
        print("Database setup warning:", exc)
        print("Check DATABASE_URL in backend/.env")
    app.run(host="127.0.0.1", port=5000, debug=os.getenv("FLASK_DEBUG", "true").lower() == "true")
