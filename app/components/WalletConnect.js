'use client';

import { useState, useEffect } from 'react';

export default function WalletConnect({ onConnect }) {
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Asegurar que solo se renderice en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Importar dinámicamente la API de Freighter
      const freighter = await import('@stellar/freighter-api');
      
      console.log('🔍 Verificando Freighter...');
      
      // ✅ FORMA CORRECTA: Usar isConnected()
      const isInstalled = await freighter.isConnected();
      
      if (!isInstalled) {
        throw new Error('Freighter no está instalado. Descárgalo desde https://freighter.app');
      }
      
      console.log('✅ Freighter detectado');
      
      // ⭐ PASO CRÍTICO: Solicitar acceso (esto abre el popup)
      console.log('🔑 Solicitando acceso...');
      const accessResult = await freighter.requestAccess();
      
      if (accessResult.error) {
        throw new Error('Acceso denegado: ' + accessResult.error);
      }
      
      console.log('✅ Acceso concedido');
      
      // Obtener la dirección pública
      console.log('📍 Obteniendo dirección...');
      const addressResult = await freighter.getAddress();
      
      if (addressResult.error) {
        throw new Error('Error al obtener dirección: ' + addressResult.error);
      }
      
      if (addressResult.address) {
        console.log('✅ Wallet conectada:', addressResult.address);
        setPublicKey(addressResult.address);
        onConnect(addressResult.address);
      } else {
        throw new Error('No se pudo obtener la dirección');
      }
      
    } catch (err) {
      console.error('❌ Error al conectar:', err);
      setError(err.message || 'Error desconocido al conectar la wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey('');
    setError('');
    onConnect('');
  };

  // No renderizar hasta que el componente esté montado en el cliente
  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {!publicKey ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Conectar Wallet
            </h2>
            
            <button
              onClick={connectWallet}
              disabled={loading}
              className={
                'w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform ' +
                (loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105 active:scale-95'
                )
              }
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Conectando...
                </span>
              ) : (
                '🔗 Conectar Freighter'
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  <strong>❌ Error:</strong> {error}
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Asegúrate de:</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Tener Freighter instalado</li>
                <li>Estar en la red <strong>TESTNET</strong></li>
                <li>Permitir popups en tu navegador</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4 text-center">
              ✅ Wallet Conectada
            </h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Tu dirección pública:</strong>
              </p>
              <p className="font-mono text-xs break-all text-gray-800 bg-white p-3 rounded border">
                {publicKey}
              </p>
            </div>

            <button
              onClick={disconnectWallet}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-red-500 to-pink-500
                       hover:from-red-600 hover:to-pink-600
                       transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              🔌 Desconectar
            </button>
          </>
        )}
      </div>
    </div>
  );
}