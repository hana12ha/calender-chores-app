import { useState, useCallback } from 'react'
import { loadFromStorage, saveToStorage, KEYS } from '../utils/localStorage'
import type { Category } from '../types'

interface UseCategoriesReturn {
  categories: Category[]
  addCategory: (name: string) => Category
  updateCategory: (id: string, name: string) => void
  deleteCategory: (id: string) => void
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage<Category[]>(KEYS.CATEGORIES, [])
  )

  const persist = useCallback((updated: Category[]) => {
    setCategories(updated)
    saveToStorage(KEYS.CATEGORIES, updated)
  }, [])

  const addCategory = useCallback((name: string): Category => {
    const category: Category = { id: crypto.randomUUID(), name: name.trim() }
    persist([...categories, category])
    return category
  }, [categories, persist])

  const updateCategory = useCallback((id: string, name: string): void => {
    persist(categories.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)))
  }, [categories, persist])

  const deleteCategory = useCallback((id: string): void => {
    persist(categories.filter((c) => c.id !== id))
  }, [categories, persist])

  return { categories, addCategory, updateCategory, deleteCategory }
}
