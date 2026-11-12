export enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

const idempotentMethods = new Set<HttpMethod>([HttpMethod.Get, HttpMethod.Put, HttpMethod.Delete]);

export function isIdempotent(method: HttpMethod): boolean {
  return idempotentMethods.has(method);
}
