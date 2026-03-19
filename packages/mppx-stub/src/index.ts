/**
 * mppx type stub — placeholder until the real mppx package is published.
 * Provides the Method, Credential, and Receipt types used by @caypo/mpp-canton.
 */
import { z } from "zod";

export { z };

export interface MethodDefinition<TName extends string = string> {
  intent: string;
  name: TName;
  schema: {
    credential: { payload: z.ZodType };
    request: z.ZodType;
  };
}

export interface Challenge<TRequest = unknown> {
  request: TRequest;
}

export interface CredentialData<TPayload = unknown, TRequest = unknown> {
  challenge: Challenge<TRequest>;
  payload: TPayload;
}

export interface ClientHandler<TRequest = unknown> {
  createCredential(params: { challenge: Challenge<TRequest> }): Promise<string>;
}

export interface ServerHandler<TPayload = unknown, TRequest = unknown> {
  verify(params: { credential: CredentialData<TPayload, TRequest> }): Promise<ReceiptData>;
}

export interface ReceiptData {
  method: string;
  reference: string;
  status: string;
  timestamp: string;
}

export const Method = {
  from<TName extends string>(def: MethodDefinition<TName>): MethodDefinition<TName> {
    return def;
  },
  toClient<TName extends string>(
    _method: MethodDefinition<TName>,
    handler: ClientHandler,
  ): ClientHandler {
    return handler;
  },
  toServer<TName extends string>(
    _method: MethodDefinition<TName>,
    handler: ServerHandler,
  ): ServerHandler {
    return handler;
  },
};

export const Credential = {
  serialize(data: CredentialData): string {
    return Buffer.from(JSON.stringify(data)).toString("base64");
  },
  deserialize<TPayload = unknown, TRequest = unknown>(
    encoded: string,
  ): CredentialData<TPayload, TRequest> {
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));
  },
};

export const Receipt = {
  from(data: ReceiptData): ReceiptData {
    return data;
  },
};
