'use client';

import { useState, useEffect } from 'react';

export default function CreateTrustline({ publicKey }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createTrustline = async () => {
    setLoading(true);
    setStatus('🔄 Preparando transacción...');

    try {
      // Importar dinámicamente el SDK de Stellar y Freighter
      const StellarSdk = await import('@stellar/stellar-sdk');
      const freighter = await import('@stellar/freighter-api');

      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

      console.log('📝 Cargando cuenta:', publicKey);

      // Cargar la cuenta desde Horizon
      const account = await server.loadAccount(publicKey);

      // Crear un asset personalizado
      // IMPORTANTE: Cambia 'ISSUER_PUBLIC_KEY' por la clave pública del emisor del asset
      // Si quieres crear tu propio asset, usa otra wallet como issuer
      const assetCode = 'TIBURONA';
      const issuerPublicKey = publicKey; // ⚠️ Cámbialo por el issuer real
      
      const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);

      console.log('🎯 Creando trustline para:', assetCode);

      // Construir la transacción
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: asset
          })
        )
        .setTimeout(180) // 3 minutos
        .build();

      // Convertir a XDR
      const xdr = transaction.toXDR();

      console.log('🔑 Solicitando firma...');
      setStatus('🔑 Esperando firma en Freighter...');

      // Firmar con Freighter
      const signedTransaction = await freighter.signTransaction(xdr, {
        network: 'TESTNET',
        networkPassphrase: StellarSdk.Networks.TESTNET,
        accountToSign: publicKey
      });

      if (signedTransaction.error) {
        throw new Error('Error al firmar: ' + signedTransaction.error);
      }

      console.log('📤 Enviando transacción...');
      setStatus('📤 Enviando transacción a la red...');

      // Reconstruir la transacción firmada
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedTransaction.signedTransaction,
        StellarSdk.Networks.TESTNET
      );

      // Enviar a la red
      const result = await server.submitTransaction(signedTx);

      console.log('✅ Trustline creada:', result);
      setStatus('✅ Trustline creada con éxito!');

    } catch (err) {
      console.error('❌ Error:', err);
      
      if (err.message && err.message.includes('User declined')) {
        setStatus('❌ Transacción cancelada por el usuario');
      } else {
        setStatus('❌ Error: ' + (err.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !publicKey) return null;

  return (
    <div className="mt-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-2">
          🏦 Crear Trustline
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Una trustline te permite recibir assets personalizados en tu wallet.
        </p>
        
        <button
          onClick={createTrustline}
          disabled={loading}
          className={
            'w-full py-3 px-6 rounded-lg font-bold text-white transition-all transform ' +
            (loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95')
          }
        >
          {loading ? '⏳ Procesando...' : '🚀 Crear Trustline (TIBURONA)'}
        </button>

        {status && (
          <div className={
            'mt-4 p-3 rounded-lg text-sm text-center ' +
            (status.includes('✅') ? 'bg-green-100 text-green-800' : 
             status.includes('❌') ? 'bg-red-100 text-red-800' : 
             'bg-blue-100 text-blue-800')
          }>
            {status}
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Nota:</strong> Para crear un asset real, necesitas usar una wallet diferente como <strong>issuer</strong> (emisor del asset).
          </p>
        </div>
      </div>
    </div>
  );
}