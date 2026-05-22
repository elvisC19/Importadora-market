import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.order_item import OrderItem


def test_create_order_and_items(db: Session):
    # 1. Create a Category and Product
    category = Category(nombre="Electrónicos", descripcion="Equipos electrónicos")
    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        categoria_id=category.id,
        nombre="Laptop Asus",
        precio=1200.0,
        stock=10
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # 2. Create a User
    user = User(
        email="test_user@example.com",
        nombre="Test User",
        telefono="78945612",
        role="cliente"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 3. Create an Order
    order = Order(
        usuario_id=user.id,
        tipo_venta="retail",
        total=1200.0,
        shipping_address="Calle Falsa 123",
        phone="71234567"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Verify defaults
    assert order.id is not None
    assert order.metodo_pago == "Manual Transfer / Cash"
    assert order.estado == "pendiente"
    assert order.order_date is not None

    # 4. Create an OrderItem
    order_item = OrderItem(
        pedido_id=order.id,
        producto_id=product.id,
        cantidad=1,
        unit_price=1200.0,
        subtotal=1200.0
    )
    db.add(order_item)
    db.commit()
    db.refresh(order_item)

    # 5. Verify relationships
    assert order_item.id is not None
    assert len(order.items) == 1
    assert order.items[0].id == order_item.id

    # Verify User backref
    assert len(user.orders) == 1
    assert user.orders[0].id == order.id

    # Verify Product backref
    assert len(product.order_items) == 1
    assert product.order_items[0].id == order_item.id

    # Verify OrderItem relationships
    assert order_item.pedido.id == order.id
    assert order_item.producto.id == product.id


def test_order_cascade_delete(db: Session):
    # 1. Create a Category, Product, User
    category = Category(nombre="Moda", descripcion="Ropa de marca")
    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        categoria_id=category.id,
        nombre="Camisa Polo",
        precio=50.0,
        stock=20
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    user = User(
        email="cascade_user@example.com",
        nombre="Cascade User",
        telefono="78901234",
        role="cliente"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Create Order and OrderItem
    order = Order(
        usuario_id=user.id,
        tipo_venta="retail",
        total=50.0,
        shipping_address="Calle A 456",
        phone="71112222"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    order_item = OrderItem(
        pedido_id=order.id,
        producto_id=product.id,
        cantidad=1,
        unit_price=50.0,
        subtotal=50.0
    )
    db.add(order_item)
    db.commit()
    db.refresh(order_item)

    order_item_id = order_item.id

    # Verify item exists in DB
    assert db.query(OrderItem).filter_by(id=order_item_id).first() is not None

    # 3. Delete Order
    db.delete(order)
    db.commit()

    # 4. Verify cascade deletion of OrderItem
    assert db.query(OrderItem).filter_by(id=order_item_id).first() is None
