'use client';

import { useState } from 'react';
import { Networks, TransactionBuilder, Asset, Operation, Server } from '@stellar/stellar-sdk';

export default function CreateTrustline({ publicKey }) {
  const [status, setStatus] = useState('');

  const create = async () => {
    setStatus('Preparando transacción...');
    const server = new Server('https://horizon-testnet.stellar.org');

    try {
      const account = await server.loadAccount(publicKey);

      // Crea un asset personalizado (cambia el issuer por tu wallet)
      const asset = new Asset('TIBURONA', publicKey);

      const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(Operation.changeTrust({ asset }))
        .setTimeout(30)
        .build();

      const xdr = tx.toXDR();

      const signed = await window.freighterApi.signTx({
        xdr,
        publicKey,
        networkPassphrase: Networks.TESTNET
      });

      await server.submitTransaction(signed);
      setStatus('Trustline creada con éxito!');
    } catch (err) {
      setStatus('Error o cancelado');
    }
  };

  if (!publicKey) return null;

  return (
    <div className="mt-6">
      <button
        onClick={create}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
      >
        Crear Trustline (TIBURONA)
      </button>
      {status && <p className="mt-2 text-center text-sm">{status}</p>}
    </div>
  );
}