import { useEffect } from 'react';
import { useCompanyStore } from '../stores/companyStore';

export function useCompany() {
  const {
    companies,
    companyMap,
    isLoading,
    fetchCompanies,
    getCompanyName
  } = useCompanyStore();

  useEffect(() => {
    if (companies.length === 0 && !isLoading) {
      fetchCompanies();
    }
  }, []);

  return {
    companies,
    companyMap,
    isLoading,
    fetchCompanies,
    getCompanyName
  };
}
