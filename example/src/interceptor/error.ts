import type { Next } from 'onion-interceptor'
export async function errorInterceptor(ctx: any, next: Next) {
  console.log('errorInterceptor start', ctx)
  await next()
  console.log('errorInterceptor end', ctx)
}