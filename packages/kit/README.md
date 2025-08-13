<p align="center"><a href="https://www.nemoprotocol.com/">
<img width="480" src="https://www.nemoprotocol.com/assets/logo-3l5o1FE6.svg"/>
</a></p>

# Nemo Wallet Kit — Connect Sui wallets in minutes

<a href="https://github.com/wallet-standard/wallet-standard">
  <img src="https://badgen.net/badge/wallet-standard/supported/green" />
</a>

Nemo Wallet Kit is a React toolkit that makes it easy for DApps to interact with Sui wallets. It supports the Sui Wallet Standard for automatic wallet discovery and provides a complete React integration via Provider, Hooks, and UI components.

> Playground and examples: [Website](https://www.nemoprotocol.com/#/wallet-kit) · [Vite](https://github.com/suiet/wallet-kit/tree/main/examples/with-vite) · [Next.js (pages)](https://github.com/suiet/wallet-kit/tree/main/examples/with-next) · [Next.js (app router)](https://github.com/suiet/wallet-kit/tree/main/examples/with-next-app-router)

## Features

- Wallet Standard support with auto-detection
- React Provider and Hooks for end-to-end wallet workflows
- Prebuilt UI components: `WalletProvider`, `ConnectButton`, `ConnectModal`
- Transaction signing and execution helpers
- Account, chain, and wallet event handling
- Out-of-the-box styling with light/dark themes

## Installation

```bash
# npm
npm install @nemoprotocol/wallet-kit @nemoprotocol/wallet-sdk @mysten/sui react react-dom

# or yarn
yarn add @nemoprotocol/wallet-kit @nemoprotocol/wallet-sdk @mysten/sui react react-dom

# or pnpm
pnpm add @nemoprotocol/wallet-kit @nemoprotocol/wallet-sdk @mysten/sui react react-dom
```

Then import the default styles once in your app entry:

```ts
import "@nemoprotocol/wallet-kit/style.css";
```

Peer dependencies: `react`, `react-dom`, `@mysten/sui` (tested around 1.28.x).

## Quick Start

Wrap your app with `WalletProvider`, then render `ConnectButton`.

```tsx
// App.tsx
import React from "react";
import { WalletProvider, ConnectButton } from "@nemoprotocol/wallet-kit";
import "@nemoprotocol/wallet-kit/style.css";

export default function App() {
  return (
    <WalletProvider>
      <div style={{ padding: 24 }}>
        <ConnectButton label="Connect Wallet" />
      </div>
    </WalletProvider>
  );
}
```

Use the `useWallet` hook anywhere under the provider:

```tsx
import { useWallet } from "@nemoprotocol/wallet-kit";

export function Profile() {
  const { address, connected, disconnect } = useWallet();
  if (!connected) return null;
  return (
    <div>
      <div>Address: {address}</div>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

## Examples

### Programmatic connect and sign + execute

```tsx
import { useWallet } from "@nemoprotocol/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";

export function TransferButton() {
  const { select, connected, signAndExecuteTransaction } = useWallet();

  async function handleTransfer() {
    if (!connected) {
      await select("Suiet"); // pick any available wallet name
    }

    const tx = new Transaction();
    // ... build your moves / transfers here
    const res = await signAndExecuteTransaction({ transaction: tx });
    console.log("Digest:", res.digest);
  }

  return <button onClick={handleTransfer}>Send</button>;
}
```

### Sign a personal message

```tsx
import { useWallet } from "@nemoprotocol/wallet-kit";

export function SignMessage() {
  const { connected, select, signPersonalMessage } = useWallet();

  async function onSign() {
    if (!connected) await select("Suiet");
    const message = new TextEncoder().encode("Hello Sui");
    const { messageBytes, signature } = await signPersonalMessage({ message });
    console.log({ messageBytes, signature });
  }

  return <button onClick={onSign}>Sign Message</button>;
}
```

### Balances with hooks

```tsx
import { useAccountBalance, useCoinBalance } from "@nemoprotocol/wallet-kit";

export function Balances() {
  const sui = useAccountBalance();
  const usdc = useCoinBalance({ typeArg: "0x...::usdc::USDC" });
  return (
    <div>
      <div>SUI balance: {sui.data?.toString()}</div>
      <div>USDC balance: {usdc.data?.toString()}</div>
    </div>
  );
}
```

### Access the Sui client bound to current chain

```tsx
import { useSuiClient } from "@nemoprotocol/wallet-kit";

export function LatestCheckpoint() {
  const client = useSuiClient();
  const [cp, setCp] = React.useState<string>("-");
  React.useEffect(() => {
    client.getLatestCheckpointSequenceNumber().then(setCp);
  }, [client]);
  return <span>Latest checkpoint: {cp}</span>;
}
```

## API Reference

### Components

#### `WalletProvider`
Wraps your React tree and exposes wallet state/actions via context.

Props:
- `defaultWallets?: IDefaultWallet[]` — default supported wallets (from SDK)
- `chains?: Chain[]` — supported chains (defaults to `DefaultChains`)
- `autoConnect?: boolean` — auto-connect last used wallet (default: `true`)

#### `ConnectButton`
One-click connect button with built-in modal and account display.

Props:
- `label?: string`
- `onConnectSuccess?: (walletName: string) => void`
- `onConnectError?: (error: BaseError) => void`
- `onDisconnectSuccess?: (walletName: string) => void`
- `onDisconnectError?: (error: BaseError) => void`

#### `ConnectModal`
Wallet selection modal. You can use it directly for custom triggers.

Props:
- `open?: boolean`
- `theme?: "dark" | "light"`
- `onOpenChange?: (open: boolean) => void`
- `onConnectSuccess?: (walletName: string) => void`
- `onConnectError?: (error: BaseError) => void`

### Hooks

#### `useWallet()`
Returns the full wallet context:

```ts
type WalletContextState = {
  // wallets & chain
  configuredWallets: IWallet[];
  detectedWallets: IWallet[];
  allAvailableWallets: IWallet[];
  chains: Chain[];
  chain: Chain | undefined;

  // connection
  name?: string;
  adapter?: IWalletAdapter;
  account?: WalletAccount;
  accounts?: WalletAccount[];
  address?: string;
  connecting: boolean;
  connected: boolean;
  status: "disconnected" | "connected" | "connecting";

  select(walletName: string): Promise<void>;
  disconnect(): Promise<void>;
  getAccounts(): readonly WalletAccount[];
  on<E extends WalletEvent>(event: E, listener: WalletEventListeners[E]): () => void;

  // signing
  signAndExecuteTransaction<Output extends SuiSignAndExecuteTransactionOutput>(
    input: { transaction: any },
    options?: ExecuteTransactionOptions
  ): Promise<Output>;
  signTransaction(input: { transaction: any }): Promise<SignedTransaction>;
  signPersonalMessage(input: { message: Uint8Array }): Promise<SuiSignPersonalMessageOutput>;

  // deprecated: prefer the methods above
  signMessage(input: { message: Uint8Array }): Promise<SuiSignMessageOutput>;
  signTransactionBlock(input: { transactionBlock: any }): Promise<SuiSignTransactionBlockOutput>;
  signAndExecuteTransactionBlock(input: { transactionBlock: any }): Promise<SuiSignAndExecuteTransactionBlockOutput>;

  // utils
  verifySignedMessage(
    input: SuiSignPersonalMessageOutput | SuiSignMessageOutput,
    publicKey: Uint8Array
  ): Promise<boolean>;
  reportTransactionEffects(input: { effects: string }): Promise<void>;
};
```

#### `useAccountBalance(params?)`
Convenience wrapper over `useCoinBalance` for a single coin (SUI by default).

Params: `{ typeArg?: string; chainId?: string; }` — returns React Query result with `data: bigint`.

#### `useCoinBalance({ address?, typeArg?, chainId? })`
Returns React Query result with the coin balance as `bigint`.

#### `useSuiClient()`
Returns a `SuiClient` bound to the current `chain` from `WalletProvider`.

## Styling and Theming

- Import `@nemoprotocol/wallet-kit/style.css` once in your app.
- `ConnectModal` supports a `theme` prop (`"dark"` | `"light"`).
- You can override CSS classes prefixed with `wkit-` in your app CSS.

## Framework Notes

- Next.js App Router: ensure client components (`"use client"`) where you use hooks/components.
- SSR: guard any direct `window` usage to client-side only; the kit itself is client-side.

## FAQ

- Wallet not found in the list?
  - The kit auto-detects any wallet implementing Wallet Standard. Ensure the extension is installed and the page is refreshed.
- Getting chain mismatch after connecting?
  - The provider syncs to wallet chain on `chainChange`. Ensure your app handles `chain` from `useWallet()` instead of assuming a fixed RPC.
- How do I customize the wallet list?
  - Pass a custom `defaultWallets` array to `WalletProvider`.

## License

MIT License
