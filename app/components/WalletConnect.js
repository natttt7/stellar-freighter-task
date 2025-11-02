'use client';

import { useState } from 'react';

export default function WalletConnect() {
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setLoading(true);
    setError('');

    try {
      await new Promise(r => setTimeout(r, 1000));

      if (!window.freighter) {
        throw new Error('Freighter no está instalado');
      }

      const key = await window.freighter.getPublicKey();
      setPublicKey(key);
    } catch (err) {
      setError(err.message || 'Error al conectar');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setPublicKey('');
    setError('');
  };

  const format = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border">
      <h1 className="text-3xl font-bold text-center mb-6">Stellar Wallet</h1>
      <p className="text-center text-gray-600 mb-8">Conecta tu Freighter Wallet</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!publicKey ? (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Conectando...' : 'Conectar Wallet'}
        </button>
      ) : (
        <div>
          <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-300">
            <p className="font-bold text-green-800 mb-2">✅ Wallet Conectada</p>
            <p className="font-mono text-sm p-2 bg-white rounded border break-all">
              {format(publicKey)}
            </p>
          </div>
          <button
            onClick={disconnect}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
          >
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}