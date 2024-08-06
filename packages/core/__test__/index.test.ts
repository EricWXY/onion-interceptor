import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { createInterceptor, createFetchInterceptor, operate } from "../src";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import axios from "axios";

import type { Middleware, AxiosInstanceLike } from "../src";

const server = setupServer();

const API_URL = "https://api.test.com/" as const;

// 模拟 Axios 实例
class MockAxiosInstance implements AxiosInstanceLike {
  defaults = {
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async request(..._args: any[]): Promise<any> {
    return {
      ok: true,
      data: "mocked data",
    };
  }
}

describe("index.ts", () => {
  // 在所有测试之前启动服务器
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  // 所有测试后关闭服务器
  afterAll(() => server.close());

  // 每次测试后重置处理程序 `对测试隔离很重要`
  afterEach(() => server.resetHandlers());

  // createInterceptor 应该创建一个 OnionInterceptor 实例
  it("should create an interceptor", () => {
    const http = new MockAxiosInstance();
    const interceptor = createInterceptor(http);

    expect(interceptor).toBeTruthy();
  });

  // 拦截器应该能拦截请求和响应
  it("should intercept requests and responses", async () => {
    const http = new MockAxiosInstance();
    createInterceptor(http, false).use(async (ctx, next) => {
      expect(ctx.cfg?.baseURL).toBe(API_URL);
      expect(ctx.args).toEqual(["/users"]);
      expect(ctx.res).toBeFalsy();
      await next();
      expect(ctx.res).toBeTruthy();
      expect(ctx.res!.ok).toBe(true);
      return ctx.res!.data;
    });

    // 模拟请求
    const response = await http.request("/users");
    expect(response).toBe("mocked data");
  });

  it("should create an interceptor when argument is axios instance", async () => {
    server.use(
      http.get(API_URL + "users", () =>
        HttpResponse.json({ data: "mocked data" })
      ),
      http.all(API_URL + "users", () =>
        HttpResponse.json({ data: "mocked data" })
      )
    );

    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
    createInterceptor(instance).use(async (ctx, next) => {
      expect(ctx.cfg!.headers?.["Content-Type"]).toBe("application/json");
      expect(ctx.args?.[0].url).toBe("/users");
      await next();
      expect(ctx.res).toBeTruthy();
    });

    try {
      await instance.get("/users");
      await instance.post("/users", { data: "test" });
      await instance.postForm("/users", { data: "test" });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // noop
    }
  });

  it("should execute interceptors in the correct order", async () => {
    const order: string[] = [];
    const mockAuthInterceptor: Middleware = async (_, next) => {
      order.push("auth start");
      await next();
      order.push("auth end");
    };
    const mockLoadingInterceptor: Middleware = async (_, next) => {
      order.push("loading start");
      await next();
      order.push("loading end");
    };

    const mockErrorInterceptor: Middleware = async (_, next) => {
      order.push("error start");
      await next();
      order.push("error end");
    };

    const http = new MockAxiosInstance();
    createInterceptor(http).use(
      mockErrorInterceptor,
      mockLoadingInterceptor,
      mockAuthInterceptor
    );

    await http.request("/test");

    expect(order).toEqual([
      "error start",
      "loading start",
      "auth start",
      "auth end",
      "loading end",
      "error end",
    ]);
  });

  it("createFetchInterceptor should add interceptor to fetch", async () => {
    server.use(
      http.get(API_URL, () => HttpResponse.json({ data: "mock data" }))
    );
    const order: string[] = [];
    createFetchInterceptor(async (_, next) => {
      order.push("interceptor start");
      await next();
      order.push("interceptor end");
    });

    await fetch(API_URL);
    expect(!!order.length).toEqual(true);
  });

  it("should create a pipe with operate", async () => {
    server.use(
      http.get(API_URL, () => HttpResponse.json({ data: "mock data" }))
    );
    const order: string[] = [];
    const finalize = (cb: Function) =>
      operate(async (_, next) => {
        try {
          await next();
          // eslint-disable-next-line no-useless-catch
        } catch (e) {
          throw e;
        } finally {
          cb();
        }
      });

    const mockLoaidngInterceptor: Middleware = async (_, next) => {
      order.push("interceptor start");
      await next(finalize(() => order.push("interceptor end")));
    };

    createFetchInterceptor(mockLoaidngInterceptor);
    await fetch(API_URL);
    expect(order).toEqual(["interceptor start", "interceptor end"]);
  });

  it("should throw error when operate argument is not a function", () => {
    expect(() => operate("test" as any)).toThrowError(
      "operate must be a function"
    );
  });

  it("should throw error when middleware is not a function", async () => {
    expect(() => {
      // eslint-disable-next-line no-useless-catch
      try {
        createFetchInterceptor("test" as any);
      } catch (error) {
        throw error;
      }
    }).toThrowError("middleware or intercept must be a function!");
  });

  it("should work when interceptors is empty", async () => {
    server.use(
      http.get(API_URL, () => HttpResponse.json({ data: "mock data" }))
    );
    createFetchInterceptor();
    fetch(API_URL, { method: "GET" }).then((res) => {
      expect(res.status).toBeTruthy();
    });
  });
});
