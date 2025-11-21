import { useEffect } from 'react';
import { useCategoryStore } from '../stores/categoryStore';

export function useCategory() {
  const {
    categories,
    categoryMap,
    isLoading,
    fetchCategories,
    getCategoryName
  } = useCategoryStore();

  useEffect(() => {
    if (categories.length === 0 && !isLoading) {
      fetchCategories();
    }
  }, []);

  return {
    categories,
    categoryMap,
    isLoading,
    fetchCategories,
    getCategoryName
  };
}
