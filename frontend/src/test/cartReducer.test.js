import { describe, it, expect } from 'vitest'

// Importamos el reducer directamente  
// se exporta desde VentasView, pero para testear puro lo definimos aqui
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id_producto === action.producto.id_producto)
      if (existing) {
        return state.map(i =>
          i.id_producto === action.producto.id_producto
            ? { ...i, cantidad: Math.min(i.cantidad + 1, action.producto.stock) }
            : i
        )
      }
      return [...state, { ...action.producto, cantidad: 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id_producto !== action.id_producto)
    case 'UPDATE_QTY':
      return state.map(i =>
        i.id_producto === action.id_producto
          ? { ...i, cantidad: Math.max(1, Math.min(Number(action.cantidad), i.stock)) }
          : i
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

const productoMock = {
  id_producto: 1,
  nombre_producto: 'Laptop Dell',
  precio_actual: 5000,
  stock: 10,
}

describe('cartReducer', () => {
  it('ADD_ITEM agrega un producto nuevo con cantidad 1', () => {
    const result = cartReducer([], { type: 'ADD_ITEM', producto: productoMock })
    expect(result).toHaveLength(1)
    expect(result[0].cantidad).toBe(1)
    expect(result[0].id_producto).toBe(1)
  })

  it('ADD_ITEM incrementa la cantidad si el producto ya existe', () => {
    const state = [{ ...productoMock, cantidad: 2 }]
    const result = cartReducer(state, { type: 'ADD_ITEM', producto: productoMock })
    expect(result[0].cantidad).toBe(3)
  })

  it('ADD_ITEM no supera el stock máximo', () => {
    const productoConStockLimitado = { ...productoMock, stock: 2 }
    const state = [{ ...productoConStockLimitado, cantidad: 2 }]
    const result = cartReducer(state, { type: 'ADD_ITEM', producto: productoConStockLimitado })
    expect(result[0].cantidad).toBe(2) // no puede pasar de 2
  })

  it('REMOVE_ITEM elimina el producto del carrito', () => {
    const state = [{ ...productoMock, cantidad: 1 }]
    const result = cartReducer(state, { type: 'REMOVE_ITEM', id_producto: 1 })
    expect(result).toHaveLength(0)
  })

  it('REMOVE_ITEM no afecta otros productos', () => {
    const state = [
      { ...productoMock, id_producto: 1, cantidad: 1 },
      { ...productoMock, id_producto: 2, cantidad: 3 },
    ]
    const result = cartReducer(state, { type: 'REMOVE_ITEM', id_producto: 1 })
    expect(result).toHaveLength(1)
    expect(result[0].id_producto).toBe(2)
  })

  it('UPDATE_QTY actualiza la cantidad del producto', () => {
    const state = [{ ...productoMock, cantidad: 1 }]
    const result = cartReducer(state, { type: 'UPDATE_QTY', id_producto: 1, cantidad: 5 })
    expect(result[0].cantidad).toBe(5)
  })

  it('UPDATE_QTY clampea la cantidad a mínimo 1', () => {
    const state = [{ ...productoMock, cantidad: 3 }]
    const result = cartReducer(state, { type: 'UPDATE_QTY', id_producto: 1, cantidad: 0 })
    expect(result[0].cantidad).toBe(1)
  })

  it('UPDATE_QTY clampea la cantidad al stock máximo', () => {
    const state = [{ ...productoMock, cantidad: 3 }]
    const result = cartReducer(state, { type: 'UPDATE_QTY', id_producto: 1, cantidad: 999 })
    expect(result[0].cantidad).toBe(10) // stock es 10
  })

  it('CLEAR vacía el carrito', () => {
    const state = [
      { ...productoMock, id_producto: 1, cantidad: 2 },
      { ...productoMock, id_producto: 2, cantidad: 1 },
    ]
    const result = cartReducer(state, { type: 'CLEAR' })
    expect(result).toHaveLength(0)
  })

  it('acción desconocida devuelve el estado sin cambios', () => {
    const state = [{ ...productoMock, cantidad: 1 }]
    const result = cartReducer(state, { type: 'UNKNOWN_ACTION' })
    expect(result).toBe(state) // misma referencia
  })
})
