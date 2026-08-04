'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({ onCredential }: { onCredential: (credential: string) => Promise<void> }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const initializedClientRef = useRef<string | null>(null);
  const [error, setError] = useState('');
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  callbackRef.current = onCredential;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    const render = () => {
      if (!window.google || !buttonRef.current) return;
      if (initializedClientRef.current === clientId) return;
      buttonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          void callbackRef.current(response.credential).catch((err: unknown) => {
            setError(err instanceof Error ? err.message : 'Đăng nhập Google thất bại');
          });
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'signin_with',
        shape: 'rectangular',
      });
      initializedClientRef.current = clientId;
    };

    if (window.google) {
      render();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
    return () => { script.onload = null; };
  }, [clientId]);

  if (!clientId) {
    return <p className="text-center text-sm text-red-600">Google OAuth chưa được cấu hình.</p>;
  }

  return (
    <div className="space-y-2">
      <div ref={buttonRef} className="flex justify-center" />
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
