import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFinanceData() {
  const { data: transactions, error: tError, isLoading: tLoading } = useSWR('/api/transactions', fetcher);
  const { data: goals, error: gError, isLoading: gLoading } = useSWR('/api/goals', fetcher);
  const { data: credits, error: cError, isLoading: cLoading } = useSWR('/api/credits', fetcher);
  const { data: budgets, error: bError, isLoading: bLoading } = useSWR('/api/budget/plan', fetcher);

  return {
    transactions: transactions || [],
    goals: goals || [],
    credits: credits || [],
    budgets: budgets || [],
    isLoading: tLoading || gLoading || cLoading || bLoading,
    isError: tError || gError || cError || bError,
    refresh: () => {
      mutate('/api/transactions');
      mutate('/api/goals');
      mutate('/api/credits');
      mutate('/api/budget/plan');
    }
  };
}
