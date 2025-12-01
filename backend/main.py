import os
import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

# Required for DB2 on Windows
os.add_dll_directory(
    r"E:\Project\shopify\my-web-market\backend\venv\Lib\site-packages\clidriver\bin"
)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "FastAPI + DB2 running"}


# ===============================================================
# 1) CREATE PRODUCT
# ===============================================================
@app.post("/products")
def create_product(product: dict, db: Session = Depends(get_db)):

    sql = text("""
        INSERT INTO ASUS.PRODUCTS
        (NAME, PRICE, IMAGE_MAIN, DESCRIPTION, CATEGORY, RATING, REVIEWS,
         IMAGES_JSON, FEATURES_JSON, SPECS_JSON)
        VALUES
        (:name, :price, :image_main, :description, :category, :rating, :reviews,
         :images_json, :features_json, :specs_json)
    """)

    db.execute(sql, {
        "name": product["name"],
        "price": product["price"],
        "image_main": product["image_main"],
        "description": product["description"],
        "category": product["category"],
        "rating": product["rating"],
        "reviews": product["reviews"],
        "images_json": json.dumps(product.get("images", [])),
        "features_json": json.dumps(product.get("features", [])),
        "specs_json": json.dumps(product.get("specifications", {})),
    })

    db.commit()
    return {"message": "Product created successfully"}


# ===============================================================
# 2) GET ALL PRODUCTS
# ===============================================================
@app.get("/products")
def get_products(db: Session = Depends(get_db)):

    rows = db.execute(text("SELECT * FROM ASUS.PRODUCTS")).fetchall()
    products = []

    for row in rows:
        r = row._mapping

        products.append({
            "id": r["id"],
            "name": r["name"],
            "price": float(r["price"]),
            "image": r["image_main"],
            "description": r["description"],
            "category": r["category"],
            "rating": float(r["rating"]) if r["rating"] else None,
            "reviews": int(r["reviews"]) if r["reviews"] else None,
        })

    return products


# ===============================================================
# 3) GET SINGLE PRODUCT
# ===============================================================
@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):

    row = db.execute(
        text("SELECT * FROM ASUS.PRODUCTS WHERE ID = :id"),
        {"id": product_id}
    ).fetchone()

    if not row:
        raise HTTPException(404, "Product not found")

    r = row._mapping

    return {
        "id": r["id"],
        "name": r["name"],
        "price": float(r["price"]),
        "image": r["image_main"],
        "images": json.loads(r["images_json"] or "[]"),
        "description": r["description"],
        "category": r["category"],
        "rating": float(r["rating"]) if r["rating"] else None,
        "reviews": int(r["reviews"]) if r["reviews"] else None,
        "features": json.loads(r["features_json"] or "[]"),
        "specifications": json.loads(r["specs_json"] or "{}"),
    }


# ===============================================================
# 4) UPDATE PRODUCT
# ===============================================================
@app.put("/products/{product_id}")
def update_product(product_id: int, product: dict, db: Session = Depends(get_db)):

    exists = db.execute(
        text("SELECT id FROM ASUS.PRODUCTS WHERE ID = :id"),
        {"id": product_id}
    ).fetchone()

    if not exists:
        raise HTTPException(404, "Product not found")

    sql = text("""
        UPDATE ASUS.PRODUCTS SET
          NAME = :name,
          PRICE = :price,
          IMAGE_MAIN = :image_main,
          DESCRIPTION = :description,
          CATEGORY = :category,
          RATING = :rating,
          REVIEWS = :reviews,
          IMAGES_JSON = :images_json,
          FEATURES_JSON = :features_json,
          SPECS_JSON = :specs_json
        WHERE ID = :id
    """)

    db.execute(sql, {
        "id": product_id,
        "name": product["name"],
        "price": product["price"],
        "image_main": product["image_main"],
        "description": product["description"],
        "category": product["category"],
        "rating": product["rating"],
        "reviews": product["reviews"],
        "images_json": json.dumps(product.get("images", [])),
        "features_json": json.dumps(product.get("features", [])),
        "specs_json": json.dumps(product.get("specifications", {})),
    })

    db.commit()
    return {"message": "Product updated successfully"}


# ===============================================================
# 5) PLACE ORDER
# ===============================================================
@app.post("/orders")
def create_order(payload: dict, db: Session = Depends(get_db)):

    user_id = payload["userId"]
    total_amount = payload["total"]
    items = payload["items"]

    # Insert order
    db.execute(
        text("INSERT INTO ASUS.ORDERS (USER_ID, TOTAL_AMOUNT, STATUS) VALUES (:u, :t, 'Pending Confirmation')"),
        {"u": user_id, "t": total_amount}
    )
    db.commit()

    # Get latest order ID
    result = db.execute(text("SELECT MAX(order_id) AS id FROM ASUS.ORDERS")).fetchone()
    order_id = result._mapping["id"]

    # Insert order items
    for item in items:
        db.execute(
            text("""
                INSERT INTO ASUS.ORDER_ITEMS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE)
                VALUES (:oid, :pid, :qty, :price)
            """),
            {"oid": order_id, "pid": item["id"], "qty": item["quantity"], "price": item["price"]}
        )

    db.commit()
    return {"success": True, "orderId": order_id}


# ===============================================================
# 6) GET USER ORDERS
# ===============================================================
@app.get("/orders/user/{user_id}")
def get_user_orders(user_id: int, db: Session = Depends(get_db)):

    sql = text("""
        SELECT
            o.order_id,
            o.total_amount,
            o.status,
            o.created_at,
            i.product_id,
            i.quantity,
            i.price,
            p.name AS product_name
        FROM ASUS.ORDERS o
        JOIN ASUS.ORDER_ITEMS i ON o.order_id = i.order_id
        JOIN ASUS.PRODUCTS p ON i.product_id = p.id
        WHERE o.user_id = :uid
        ORDER BY o.created_at DESC
    """)

    rows = db.execute(sql, {"uid": user_id}).fetchall()

    orders = {}
    for row in rows:
        r = row._mapping
        oid = r["order_id"]

        if oid not in orders:
            orders[oid] = {
                "id": oid,
                "total": float(r["total_amount"]),
                "status": r["status"],
                "date": str(r["created_at"]),
                "items": []
            }

        orders[oid]["items"].append({
            "name": r["product_name"],
            "quantity": int(r["quantity"]),
            "price": float(r["price"])
        })

    return list(orders.values())


# ===============================================================
# 7) ADMIN — GET ALL ORDERS
# ===============================================================
@app.get("/orders")
def get_all_orders(db: Session = Depends(get_db)):

    sql = text("""
        SELECT
            o.order_id,
            o.user_id,
            u.name AS user_name,
            u.email AS user_email,
            o.total_amount,
            o.status,
            o.created_at,
            i.product_id,
            i.quantity,
            i.price,
            p.name AS product_name
        FROM ASUS.ORDERS o
        JOIN ASUS.USERS u ON o.user_id = u.user_id
        JOIN ASUS.ORDER_ITEMS i ON o.order_id = i.order_id
        JOIN ASUS.PRODUCTS p ON i.product_id = p.id
        ORDER BY o.created_at DESC
    """)

    rows = db.execute(sql).fetchall()
    orders = {}

    for row in rows:
        r = row._mapping
        oid = r["order_id"]

        if oid not in orders:
            orders[oid] = {
                "id": oid,
                "total": float(r["total_amount"]),
                "status": r["status"],
                "date": str(r["created_at"]),
                "user": {
                    "id": r["user_id"],
                    "name": r["user_name"],
                    "email": r["user_email"]
                },
                "items": []
            }

        orders[oid]["items"].append({
            "name": r["product_name"],
            "quantity": int(r["quantity"]),
            "price": float(r["price"])
        })

    return list(orders.values())


# ===============================================================
# 8) UPDATE ORDER STATUS
# ===============================================================
@app.put("/orders/{order_id}/status")
def update_order_status(order_id: int, data: dict, db: Session = Depends(get_db)):

    new_status = data["status"]

    db.execute(
        text("UPDATE ASUS.ORDERS SET STATUS = :st WHERE ORDER_ID = :oid"),
        {"st": new_status, "oid": order_id}
    )

    db.commit()
    return {"success": True, "message": "Order status updated"}

# ===============================================================
# 9) GET SINGLE ORDER (FOR INVOICE)
# ===============================================================
@app.get("/orders/{order_id}")
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):

    sql = text("""
        SELECT
            o.order_id,
            o.user_id,
            u.name AS user_name,
            u.email AS user_email,
            o.total_amount,
            o.status,
            o.created_at,
            i.product_id,
            i.quantity,
            i.price,
            p.name AS product_name,
            p.image_main
        FROM ASUS.ORDERS o
        JOIN ASUS.USERS u ON o.user_id = u.user_id
        JOIN ASUS.ORDER_ITEMS i ON o.order_id = i.order_id
        JOIN ASUS.PRODUCTS p ON i.product_id = p.id
        WHERE o.order_id = :oid
        ORDER BY o.created_at DESC
    """)

    rows = db.execute(sql, {"oid": order_id}).fetchall()

    if not rows:
        raise HTTPException(404, "Order not found")

    order = None

    for row in rows:
        r = row._mapping

        if order is None:
            order = {
                "id": r["order_id"],
                "total": float(r["total_amount"]),
                "status": r["status"],
                "date": str(r["created_at"]),
                "user": {
                    "id": r["user_id"],
                    "name": r["user_name"],
                    "email": r["user_email"],
                },
                "items": []
            }

        order["items"].append({
            "name": r["product_name"],
            "quantity": int(r["quantity"]),
            "price": float(r["price"]),
            "product_id": r["product_id"],
            "image": r["image_main"]
        })

    return order

