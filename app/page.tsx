'use client';

import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import AssetBalance from './components/AssetBalance';
import CreateTrustline from './components/CreateTrustline';

export default function Home() {
  const [publicKey, setPublicKey] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <WalletConnect onConnect={setPublicKey} publicKey={publicKey} />
        {publicKey && <AssetBalance publicKey={publicKey} />}
        {publicKey && <CreateTrustline publicKey={publicKey} />}
      </div>
    </div>
  );
}