import { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import {
  SignedTransaction,
  SuiSignAndExecuteTransactionOutput,
  SuiSignAndExecuteTransactionInput,
} from "@mysten/wallet-standard";

export type RpcClientExecuteTransactionResult = SuiTransactionBlockResponse;
export type GraphQLClientExecuteTransactionResult = {
  digest: string;
  effects?: {
    bcs?: string;
  };
};

export type ExecuteTransactionResult =
  | RpcClientExecuteTransactionResult
  | GraphQLClientExecuteTransactionResult;

export type ExecuteTransactionOptions = {
  execute?: (
    signedTransaction: SignedTransaction
  ) => Promise<ExecuteTransactionResult>;
};

// 扩展原有的输入类型，支持自定义client
export type ExtendedSuiSignAndExecuteTransactionInput = 
  Omit<SuiSignAndExecuteTransactionInput, "account" | "chain"> & {
    client?: SuiClient; // SuiClient类型
    options?: {
      showRawEffects?: boolean;
      showObjectChanges?: boolean;
      showEvents?: boolean;
      showInput?: boolean;
      showEffects?: boolean;
      showBalanceChanges?: boolean;
    };
  };
