'use client';

import { useState, useEffect } from 'react';

export default function WalletConnect({ onConnect, publicKey: externalPublicKey }) {
  const [internalPublicKey, setInternalPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [freighterReady, setFreighterReady] = useState(false);

  // Usa la key que viene de fuera (page.tsx) o la interna
  const displayKey = externalPublicKey || internalPublicKey;

  // Detectar Freighter
  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && (window.freighter || window.freighterApi)) {
        setFreighterReady(true);
      }
    };

    check();
    const interval = setInterval(check, 1000);
    setTimeout(() => clearInterval(interval), 10000);

    return () => clearInterval(interval);
  }, []);

  const connect = async () => {
    if (!freighterReady) return;

    setLoading(true);
    setError('');

    try {
      const { getPublicKey } = await import('@stellar/freighter-api');
      const key = await getPublicKey();
      setInternalPublicKey(key);
      onConnect?.(key); // ENVÍA LA KEY AL PADRE
    } catch (err) {
      setError('Freighter denegó acceso o no está instalada');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setInternalPublicKey('');
    onConnect?.(''); // LIMPIA EN EL PADRE
  };

  const format = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Stellar Wallet
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {!displayKey ? (
          <button
            onClick={connect}
            disabled={!freighterReady || loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              freighterReady
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Conectando...' : freighterReady ? 'Conectar Wallet' : 'Esperando Freighter...'}
          </button>
        ) : (
          <div>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-green-800 font-bold">Conectado</p>
              <p className="font-mono text-sm break-all">{format(displayKey)}</p>
            </div>
            <button
              onClick={disconnect}
              className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Desconectar
            </button>
          </div>
        )}

        <p className="text-xs text-center text-gray-500 mt-4">
          <a href="https://freighter.app" target="_blank" className="text-blue-600 underline">
            ¿No tienes Freighter?
          </a>
        </p>
      </div>
    </div>
  );
}