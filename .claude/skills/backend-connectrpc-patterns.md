---
name: backend-connectrpc-patterns
description: Connect RPC を使用したバックエンドの場合に参照。Protocol Buffers による型安全な API 設計、サービス定義、エラーハンドリングのベストプラクティス。
---

# Backend Development Patterns (Connect RPC)

> **Note:** このスキルは Connect RPC を使用してバックエンドが作られている場合に適用してください。RESTful API を使用している場合は `backend-restful-patterns.md` を参照してください。

Connect RPC patterns and best practices for type-safe, scalable server-side applications.

## Connect RPC の特徴

- **Protocol Buffers** による型安全な API 定義
- **gRPC 互換** でありながらブラウザフレンドリー
- **HTTP/1.1, HTTP/2, HTTP/3** サポート
- **JSON と Binary** 両方のシリアライゼーション

## サービス定義 (Protocol Buffers)

### 基本的なサービス定義

```protobuf
// proto/market/v1/market.proto
syntax = "proto3";

package market.v1;

service MarketService {
  // 単一リソース取得
  rpc GetMarket(GetMarketRequest) returns (GetMarketResponse);

  // リソース一覧取得
  rpc ListMarkets(ListMarketsRequest) returns (ListMarketsResponse);

  // リソース作成
  rpc CreateMarket(CreateMarketRequest) returns (CreateMarketResponse);

  // リソース更新
  rpc UpdateMarket(UpdateMarketRequest) returns (UpdateMarketResponse);

  // リソース削除
  rpc DeleteMarket(DeleteMarketRequest) returns (DeleteMarketResponse);

  // ストリーミング（サーバー→クライアント）
  rpc WatchMarkets(WatchMarketsRequest) returns (stream MarketUpdate);
}
```

### メッセージ定義

```protobuf
message Market {
  string id = 1;
  string name = 2;
  string description = 3;
  MarketStatus status = 4;
  google.protobuf.Timestamp created_at = 5;
  google.protobuf.Timestamp updated_at = 6;
}

enum MarketStatus {
  MARKET_STATUS_UNSPECIFIED = 0;
  MARKET_STATUS_ACTIVE = 1;
  MARKET_STATUS_CLOSED = 2;
  MARKET_STATUS_RESOLVED = 3;
}

message GetMarketRequest {
  string id = 1;
}

message GetMarketResponse {
  Market market = 1;
}

message ListMarketsRequest {
  int32 page_size = 1;
  string page_token = 2;
  MarketStatus status_filter = 3;
}

message ListMarketsResponse {
  repeated Market markets = 1;
  string next_page_token = 2;
}
```

## サーバー実装 (TypeScript)

### サービス実装

```typescript
// src/services/market-service.ts
import { ConnectRouter } from "@connectrpc/connect";
import { MarketService } from "./gen/market/v1/market_connect";
import { Code, ConnectError } from "@connectrpc/connect";

export default (router: ConnectRouter) =>
  router.service(MarketService, {
    async getMarket(req) {
      const market = await db.markets.findUnique({
        where: { id: req.id }
      });

      if (!market) {
        throw new ConnectError(
          "Market not found",
          Code.NotFound
        );
      }

      return { market };
    },

    async listMarkets(req) {
      const markets = await db.markets.findMany({
        take: req.pageSize || 10,
        cursor: req.pageToken ? { id: req.pageToken } : undefined,
        where: req.statusFilter
          ? { status: req.statusFilter }
          : undefined,
      });

      return {
        markets,
        nextPageToken: markets.length > 0
          ? markets[markets.length - 1].id
          : "",
      };
    },

    async createMarket(req) {
      const market = await db.markets.create({
        data: {
          name: req.name,
          description: req.description,
          status: "MARKET_STATUS_ACTIVE",
        },
      });

      return { market };
    },

    async updateMarket(req) {
      const market = await db.markets.update({
        where: { id: req.id },
        data: {
          name: req.name,
          description: req.description,
        },
      });

      return { market };
    },

    async deleteMarket(req) {
      await db.markets.delete({
        where: { id: req.id },
      });

      return {};
    },

    async *watchMarkets(req) {
      // Server-side streaming
      for await (const update of marketUpdates.subscribe()) {
        yield { market: update };
      }
    },
  });
```

### サーバーセットアップ

```typescript
// src/server.ts
import { fastify } from "fastify";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import routes from "./routes";

const server = fastify();

await server.register(fastifyConnectPlugin, {
  routes,
});

await server.listen({ host: "0.0.0.0", port: 8080 });
```

## クライアント実装

### クライアント生成と使用

```typescript
// src/client.ts
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { MarketService } from "./gen/market/v1/market_connect";

const transport = createConnectTransport({
  baseUrl: "https://api.example.com",
});

const client = createClient(MarketService, transport);

// 使用例
async function fetchMarket(id: string) {
  const response = await client.getMarket({ id });
  return response.market;
}

async function listMarkets(pageSize: number = 10) {
  const response = await client.listMarkets({ pageSize });
  return response.markets;
}
```

### React での使用 (TanStack Query)

```typescript
// src/hooks/use-markets.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/connect-client";

export function useMarket(id: string) {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => client.getMarket({ id }),
  });
}

export function useMarkets(pageSize: number = 10) {
  return useQuery({
    queryKey: ["markets", pageSize],
    queryFn: () => client.listMarkets({ pageSize }),
  });
}

export function useCreateMarket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      client.createMarket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}
```

## エラーハンドリング

### Connect エラーコード

```typescript
import { Code, ConnectError } from "@connectrpc/connect";

// エラーコードの使い分け
const errorCodes = {
  // クライアントエラー
  InvalidArgument: Code.InvalidArgument,   // バリデーションエラー
  NotFound: Code.NotFound,                 // リソースが見つからない
  AlreadyExists: Code.AlreadyExists,       // 重複
  PermissionDenied: Code.PermissionDenied, // 権限なし
  Unauthenticated: Code.Unauthenticated,   // 未認証

  // サーバーエラー
  Internal: Code.Internal,                 // 内部エラー
  Unavailable: Code.Unavailable,           // サービス利用不可
  DeadlineExceeded: Code.DeadlineExceeded, // タイムアウト
};

// エラーの投げ方
throw new ConnectError(
  "Market with this name already exists",
  Code.AlreadyExists,
  { marketName: req.name } // メタデータ
);
```

### 集中エラーハンドリング

```typescript
// src/interceptors/error-handler.ts
import { Interceptor, ConnectError, Code } from "@connectrpc/connect";

export const errorInterceptor: Interceptor = (next) => async (req) => {
  try {
    return await next(req);
  } catch (error) {
    if (error instanceof ConnectError) {
      // 既に ConnectError なら再スロー
      throw error;
    }

    // Prisma エラーの変換
    if (error.code === "P2025") {
      throw new ConnectError("Resource not found", Code.NotFound);
    }

    if (error.code === "P2002") {
      throw new ConnectError("Resource already exists", Code.AlreadyExists);
    }

    // その他は内部エラー
    console.error("Unexpected error:", error);
    throw new ConnectError("Internal server error", Code.Internal);
  }
};
```

## バリデーション

### protovalidate を使用

```protobuf
// proto/market/v1/market.proto
import "buf/validate/validate.proto";

message CreateMarketRequest {
  string name = 1 [(buf.validate.field).string = {
    min_len: 1,
    max_len: 100,
  }];

  string description = 2 [(buf.validate.field).string = {
    max_len: 1000,
  }];
}
```

### カスタムバリデーション

```typescript
// src/services/market-service.ts
async createMarket(req) {
  // バリデーション
  if (!req.name || req.name.trim().length === 0) {
    throw new ConnectError(
      "Name is required",
      Code.InvalidArgument
    );
  }

  if (req.name.length > 100) {
    throw new ConnectError(
      "Name must be 100 characters or less",
      Code.InvalidArgument
    );
  }

  // 処理続行...
}
```

## 認証・認可

### Interceptor による認証

```typescript
// src/interceptors/auth.ts
import { Interceptor, ConnectError, Code } from "@connectrpc/connect";

export const authInterceptor: Interceptor = (next) => async (req) => {
  const token = req.header.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ConnectError("Missing authorization token", Code.Unauthenticated);
  }

  try {
    const user = await verifyToken(token);
    req.header.set("x-user-id", user.id);
    req.header.set("x-user-role", user.role);
  } catch (error) {
    throw new ConnectError("Invalid token", Code.Unauthenticated);
  }

  return next(req);
};
```

### メソッドレベルの認可

```typescript
// src/services/market-service.ts
async deleteMarket(req, context) {
  const userId = context.requestHeader.get("x-user-id");
  const userRole = context.requestHeader.get("x-user-role");

  if (userRole !== "admin") {
    throw new ConnectError(
      "Only admins can delete markets",
      Code.PermissionDenied
    );
  }

  await db.markets.delete({ where: { id: req.id } });
  return {};
}
```

## ストリーミング

### Server Streaming

```typescript
// サーバー側
async *watchMarkets(req) {
  const subscription = pubsub.subscribe("market-updates");

  try {
    for await (const event of subscription) {
      yield {
        market: event.market,
        eventType: event.type,
      };
    }
  } finally {
    subscription.unsubscribe();
  }
}

// クライアント側
async function watchMarkets() {
  for await (const update of client.watchMarkets({})) {
    console.log("Market update:", update);
  }
}
```

### Client Streaming

```typescript
// サーバー側
async batchCreateMarkets(req) {
  const markets = [];

  for await (const item of req) {
    const market = await db.markets.create({
      data: item,
    });
    markets.push(market);
  }

  return { markets, count: markets.length };
}
```

## テスト

### サービスのユニットテスト

```typescript
// src/services/market-service.test.ts
import { createRouterTransport } from "@connectrpc/connect";
import { createClient } from "@connectrpc/connect";
import { MarketService } from "./gen/market/v1/market_connect";
import routes from "./routes";

describe("MarketService", () => {
  const transport = createRouterTransport(routes);
  const client = createClient(MarketService, transport);

  it("creates a market", async () => {
    const response = await client.createMarket({
      name: "Test Market",
      description: "Test description",
    });

    expect(response.market).toBeDefined();
    expect(response.market?.name).toBe("Test Market");
  });

  it("returns NotFound for non-existent market", async () => {
    await expect(
      client.getMarket({ id: "non-existent" })
    ).rejects.toThrow(/not found/i);
  });
});
```

## ベストプラクティス

### 1. API バージョニング

```protobuf
// バージョンを package 名に含める
package market.v1;
package market.v2;
```

### 2. メッセージの進化

```protobuf
message Market {
  string id = 1;
  string name = 2;
  // 新しいフィールドは既存の番号を再利用しない
  string category = 4;  // 3 は以前削除されたフィールド

  // 予約済みフィールド
  reserved 3;
  reserved "old_field_name";
}
```

### 3. 空のレスポンス

```protobuf
// google.protobuf.Empty を使用
import "google/protobuf/empty.proto";

rpc DeleteMarket(DeleteMarketRequest) returns (google.protobuf.Empty);
```

### 4. ページネーション

```protobuf
message ListMarketsRequest {
  int32 page_size = 1;      // デフォルト値を設定
  string page_token = 2;    // カーソルベース
}

message ListMarketsResponse {
  repeated Market markets = 1;
  string next_page_token = 2;  // 空なら最後のページ
}
```

## RESTful との比較

| 観点 | RESTful | Connect RPC |
|------|---------|-------------|
| 型安全性 | ランタイムのみ | コンパイル時 |
| コード生成 | OpenAPI から可能 | Protocol Buffers から |
| ストリーミング | WebSocket 別途必要 | ネイティブサポート |
| ブラウザサポート | ネイティブ | Connect-Web |
| デバッグ | curl, ブラウザ | buf curl, 専用ツール |

**Remember**: Connect RPC は型安全性と開発者体験を重視する場合に最適です。Protocol Buffers による厳密なスキーマ定義が、チーム開発での API 契約を明確にします。
