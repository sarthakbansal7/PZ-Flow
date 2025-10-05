"use client";
import React, { useEffect, useState } from 'react';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from '@/lib/wagmiConfig';
import { AuroraBackground } from '@/components/ui/aurora';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

export default function StreamingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Function to detect theme
    const detectTheme = () => {
      const htmlElement = document.documentElement;
      const isDark = htmlElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    // Initial detection
    detectTheme();

    // Create observer for theme changes
    const observer = new MutationObserver(() => {
      detectTheme();
    });

    // Observe class changes on html element
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const rainbowKitTheme = theme === 'dark' 
    ? darkTheme({
        accentColor: '#3b82f6',
        accentColorForeground: 'white',
      })
    : lightTheme({
        accentColor: '#3b82f6',
        accentColorForeground: 'white',
      });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>
          <AuroraBackground>
            <div className="relative z-10 min-h-screen">
              {children}
            </div>
          </AuroraBackground>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}