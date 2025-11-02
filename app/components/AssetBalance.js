'use client';

import { useState, useEffect } from 'react';

export default function AssetBalance({ publicKey }) {
  const [balance, setBalance] = useState('Cargando...');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!publicKey || !mounted) return;

    let intervalId;

    const loadBalance = async () => {
      try {
        // Importar dinámicamente el SDK de Stellar
        const StellarSdk = await import('@stellar/stellar-sdk');
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

        console.log('📊 Cargando balance para:', publicKey);

        const account = await server.loadAccount(publicKey);
        const xlmBalance = account.balances.find(b => b.asset_type === 'native');
        
        if (xlmBalance) {
          const formattedBalance = parseFloat(xlmBalance.balance).toFixed(2);
          setBalance(formattedBalance + ' XLM');
          console.log('✅ Balance cargado:', formattedBalance, 'XLM');
        } else {
          setBalance('0.00 XLM');
        }
      } catch (err) {
        console.error('❌ Error al cargar balance:', err);
        setBalance('Error al cargar');
      }
    };

    // Cargar inmediatamente
    loadBalance();

    // Actualizar cada 10 segundos
    intervalId = setInterval(loadBalance, 10000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [publicKey, mounted]);

  if (!mounted || !publicKey) return null;

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-center shadow-md">
      <p className="font-bold text-gray-700 text-sm mb-2">💰 Balance en Testnet</p>
      <p className="font-mono text-3xl text-blue-600 font-bold">{balance}</p>
      <p className="text-xs text-gray-500 mt-2">Actualizado cada 10 segundos</p>
    </div>
  );
}