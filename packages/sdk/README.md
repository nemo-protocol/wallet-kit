<p align="center"><a href="https://www.nemoprotocol.com/">
<img width="480" src="https://www.nemoprotocol.com/assets/logo-3l5o1FE6.svg"/>
</a></p>

# Nemo Wallet SDK

<a href="https://github.com/wallet-standard/wallet-standard">
  <img src="https://badgen.net/badge/wallet-standard/supported/green" />
</a>

A TypeScript SDK based on the Sui Wallet Standard that provides wallet discovery, a unified adapter, account asset helpers, and utilities. It is framework-agnostic, object-oriented, and easy to integrate in both Web and Node environments.

## Features

- **Wallet discovery (WalletRadar)**: Listen for and collect Wallet Standard-compatible wallets
- **Unified adapter (WalletAdapter)**: Wrap standard features with a consistent API and built-in error handling
- **Preset wallet list**: `AllDefaultWallets`, `defineSlushWallet` for quick integration of extension/web wallets
- **Account asset helpers**: `AccountAssetManager`, `AccountCoinManager` for SUI/custom coin balances and owned coins
- **Utilities**: Verify signed messages, serialize/normalize transactions, formatting and checks
- **Error system**: `WalletError`, `KitError`, `handleConnectionError` for consistent error semantics

## Installation

```bash
npm install @nemoprotocol/wallet-sdk @mysten/sui
# or
yarn add @nemoprotocol/wallet-sdk @mysten/sui
# or
pnpm add @nemoprotocol/wallet-sdk @mysten/sui
```

## Quick Start

```typescript
import { WalletRadar, WalletAdapter, AllDefaultWallets } from '@nemoprotocol/wallet-sdk';

// 1) Activate wallet discovery
const radar = new WalletRadar();
radar.activate();

// Optional: subscribe to updates when wallets register
const unsubscribe = radar.subscribe((adapters) => {
  console.log('Detected wallets:', adapters.map((a) => a.name));
});

// 2) Get detected wallet adapters
const adapters = radar.getDetectedWalletAdapters();
const adapter: WalletAdapter | undefined = adapters[0];
if (!adapter) throw new Error('No wallet detected');

// 3) Connect (Wallet Standard)
const { accounts } = await adapter.connect();
const account = accounts[0];
console.log('Connected account:', account?.address);

// 4) Disconnect
await adapter.disconnect();

// Stop listening when done
unsubscribe();
radar.deactivate();
```

## Core Concepts

### Wallet discovery: `WalletRadar`
- `activate()` / `deactivate()`: Start/stop listening for wallet registration
- `getDetectedWalletAdapters()`: Get current `IWalletAdapter[]`
- `subscribe(cb)`: Subscribe to changes, returns an unsubscribe function

### Unified adapter: `WalletAdapter`
Wraps Wallet Standard features. Key methods:
- `connect(input?)`, `disconnect()`, `on(event, listener)`
- Transaction: `signTransaction`, `signAndExecuteTransaction`
- Message: `signPersonalMessage`, `signMessage` (deprecated)
- Others: `reportTransactionEffects`, `hasFeature(name)`

### Preset wallets and registration
- Presets: `AllDefaultWallets`, `PresetWallet`
- Quick Slush Web Wallet registration: `defineSlushWallet({ appName, origin?, network? })`

### Account assets
- `AccountAssetManager`: Query SUI/custom coin balances by address and RPC
- `AccountCoinManager`: Paginated owned coin objects by `coinType`

### Utilities
- `verifySignedMessage(input, publicKey)`: Verify a personal message signature
- `serializeTransaction(tx)`, `normalizeTransaction(tx)`: Serialize/normalize into a `Transaction`
- More helpers under `utils/format`, `utils/check`, `utils/binary`, etc.

## Examples

### Detect and connect a wallet
```typescript
import { WalletRadar } from '@nemoprotocol/wallet-sdk';

const radar = new WalletRadar();
radar.activate();

const adapters = radar.getDetectedWalletAdapters();
if (adapters.length === 0) {
  console.warn('No wallet extension detected');
}

const adapter = adapters[0];
await adapter.connect();
console.log('Accounts:', adapter.accounts.length);
```

### Send a transaction (sign and execute)
```typescript
import { WalletRadar, normalizeTransaction } from '@nemoprotocol/wallet-sdk';
import { Transaction } from '@mysten/sui/transactions';

const radar = new WalletRadar();
radar.activate();
const adapter = radar.getDetectedWalletAdapters()[0];
if (!adapter) throw new Error('No wallet detected');

await adapter.connect();

// Build a transaction
const tx = new Transaction();
// ... compose tx based on your business logic

// Normalize to a standard Transaction (supports various inputs)
const normalized = await normalizeTransaction(tx);

// Sign and execute
const res = await adapter.signAndExecuteTransaction({
  transaction: normalized,
  account: adapter.accounts[0],
  chain: adapter.chains[0],
});

console.log('Execution result:', res);
```

### Verify a personal message signature
```typescript
import { verifySignedMessage } from '@nemoprotocol/wallet-sdk';

// Assume you have the signature output and public key
const ok = await verifySignedMessage(output, publicKeyBytes);
console.log('verify:', ok);
```

### Query account balances
```typescript
import { AccountAssetManager } from '@nemoprotocol/wallet-sdk';

const assets = new AccountAssetManager('0xYourAddress', {
  chainRpcUrl: 'https://sui-mainnet.blockvision.org',
});

const sui = await assets.getSuiBalance();
const usdc = await assets.getCoinBalance('0x...::usdc::USDC');
console.log('SUI:', sui.toString(), 'USDC:', usdc.toString());
```

## API Reference

### WalletRadar
- `activate(): void`
- `deactivate(): void`
- `getDetectedWalletAdapters(): IWalletAdapter[]`
- `subscribe(cb: (adapters: IWalletAdapter[]) => void): () => void`

### WalletAdapter (main methods)
- `connect(input?)`, `disconnect()`, `on(event, listener)`, `hasFeature(name)`
- `signTransaction(input)`, `signAndExecuteTransaction(input)`
- `signPersonalMessage(input)`, `reportTransactionEffects(input)`
- Deprecated but supported for compatibility: `signMessage`, `signTransactionBlock`, `signAndExecuteTransactionBlock`

### Account management
- `AccountAssetManager(address, { chainRpcUrl })`
  - `getSuiBalance(): Promise<bigint>`
  - `getCoinBalance(coinType: string): Promise<bigint>`
  - `getAddress(): string`, `getChainRpcUrl(): string`, `setChainRpcUrl(url: string)`
- `AccountCoinManager`
  - `getOwnedCoins(address: string): Promise<CoinObject[]>`
  - `getBalance(address: string): Promise<bigint>`

### Utilities
- `verifySignedMessage(input, publicKey: Uint8Array): Promise<boolean>`
- `serializeTransaction(tx: any): Promise<string | Uint8Array>`
- `normalizeTransaction(tx: any): Promise<Transaction>`

### Types and constants (excerpt)
- `IWalletAdapter`, `IWallet`, `IDefaultWallet`, `WalletType`
- Presets: `PresetWallet`, `AllDefaultWallets`
- Register Slush Web Wallet: `defineSlushWallet({ appName, origin?, network? })`

## Error Handling

The SDK exposes consistent error semantics via `WalletError`, `KitError`, and `handleConnectionError`. Example:

```typescript
import { WalletRadar, WalletError } from '@nemoprotocol/wallet-sdk';

try {
  const radar = new WalletRadar();
  radar.activate();
  const adapter = radar.getDetectedWalletAdapters()[0];
  await adapter.connect();
} catch (e) {
  if (e && typeof e === 'object' && 'code' in (e as any)) {
    console.error('WalletError:', (e as any).code, (e as any).message);
  } else {
    console.error('Unknown error:', e);
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes and add tests
4. Open a pull request

## License

MIT License

## Development

```bash
pnpm install
pnpm run build
pnpm test
```