'use client';

import { useState, useEffect } from 'react';
import { Server } from '@stellar/stellar-sdk';

export default function AssetBalance({ publicKey }) {
  const [balance, setBalance] = useState('Cargando...');
  const server = new Server('https://horizon-testnet.stellar.org');

  useEffect(() => {
    if (!publicKey) return;

    const load = async () => {
      try {
        const account = await server.loadAccount(publicKey);
        const xlm = account.balances.find(b => b.asset_type === 'native');
        setBalance(`${parseFloat(xlm.balance).toFixed(2)} XLM`);
      } catch {
        setBalance('Error al cargar');
      }
    };

    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [publicKey]);

  if (!publicKey) return null;

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
      <p className="font-bold text-gray-700">Balance en Testnet</p>
      <p className="font-mono text-2xl text-blue-600">{balance}</p>
    </div>
  );
}