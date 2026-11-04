'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      })
  );

  useState(() => {
    if (typeof window === 'undefined') return null;
    const savedTheme = window.localStorage.getItem('theme') || 'light';
    const root = document.documentElement;
    root.classList.toggle('dark', savedTheme === 'dark');
    root.classList.toggle('light', savedTheme !== 'dark');
    root.style.colorScheme = savedTheme === 'dark' ? 'dark' : 'light';
    return null;
  });

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
