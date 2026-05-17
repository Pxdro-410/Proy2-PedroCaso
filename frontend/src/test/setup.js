import '@testing-library/jest-dom'

// Suprimir warnings de React Router v7 future flags 
const originalError = console.error
beforeEach(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) return
    originalError(...args)
  }
})
afterEach(() => {
  console.error = originalError
})
