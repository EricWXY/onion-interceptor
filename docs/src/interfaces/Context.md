[**onion-interceptor**](../README.md) • **Docs**

***

# 接口: Context

上下文类型

## Indexable

 \[`key`: `string`\]: `any`

## Properties

### args?

> `optional` **args**: `RequestConfig`[]

请求参数 调用 request 时候传入的 （只有一个config）

#### 查看源码

[types.ts:164](https://github.com/coverjs/onion-interceptor/blob/0d4864b4abe76f2775e8aa0322864f4fcb048baa/packages/core/src/types.ts#L164)

***

### cfg?

> `optional` **cfg**: `RequestConfig`

默认配置 调用 axios.create 时候传入的配置

#### 查看源码

[types.ts:168](https://github.com/coverjs/onion-interceptor/blob/0d4864b4abe76f2775e8aa0322864f4fcb048baa/packages/core/src/types.ts#L168)

***

### res?

> `optional` **res**: `RequestResponse`

请求响应

#### 查看源码

[types.ts:172](https://github.com/coverjs/onion-interceptor/blob/0d4864b4abe76f2775e8aa0322864f4fcb048baa/packages/core/src/types.ts#L172)
