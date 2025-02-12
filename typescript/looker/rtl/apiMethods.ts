/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {
  SDKResponse,
  HttpMethod,
  sdkError,
  IAuthorizer,
  ITransportSettings,
} from './transport'

export class APIMethods {
  constructor(public authSession: IAuthorizer) {
    this.authSession = authSession
  }

  /** A helper method for simplifying error handling of SDK responses.
   *
   * Pass in a promise returned by any SDK method, and it will return a promise
   * that rejects if the `SDKResponse` is not `ok`. This will swallow the type
   * information in the error case, but allows you to route all the error cases
   * into a single promise rejection.
   *
   * The promise will have an `Error` rejection reason with a string `message`.
   * If the server error contains a `message` field, it will be provided, otherwise a
   * generic message will occur.
   *
   * ```ts
   * const sdk = LookerSDK({...})
   * let look
   * try {
   *    look = await sdk.ok(sdk.create_look({...}))
   *    // do something with look
   * }
   * catch(e) {
   *    // handle error case
   * }
   * ```
   */
  async ok<TSuccess, TError>(promise: Promise<SDKResponse<TSuccess, TError>>) {
    const result = await promise
    if (result.ok) {
      return result.value
    } else {
      throw sdkError(result as any)
    }
  }

  /**
   *
   * A helper method to decorate an API request with authentication information
   * before submitting the request to the API
   *
   * @param {HttpMethod} method type of HTTP method
   * @param {string} path API endpoint path
   * @param {any} queryParams Optional query params collection for request
   * @param {any} body Optional body for request
   * @param {Partial<ITransportSettings>} options Optional overrides like timeout and verify_ssl
   */
  async authRequest<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authSession.transport.request<TSuccess, TError>(
      method,
      path,
      queryParams,
      body,
      (init: any) => {
        return this.authSession.authenticate(init)
      },
      options,
    )
  }

  // // dynamically evaluate a template string
  // macro(template: string, vars: any) {
  //   // replace {foo} from spec path with ${foo} for template string
  //   template = template.replace(/{/gi, '${')
  //   return new Function('return `+ template +`;').call(vars)
  // }
  //
  // pathify(path: string, pathParams?: any) {
  //   if (!pathParams) return path
  //   if (path.indexOf('{') < 0) return path
  //   return this.macro(path, pathParams)
  // }

  /** Make a GET request */
  async get<TSuccess, TError>(
    path: string,
    queryParams?: any,
    body?: any,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'GET',
      path,
      queryParams,
      body,
      options,
    )
  }

  /** Make a HEAD request */
  async head<TSuccess, TError>(
    path: string,
    queryParams?: any,
    body?: any,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'HEAD',
      path,
      queryParams,
      body,
      options,
    )
  }

  /** Make a DELETE request */
  async delete<TSuccess, TError>(
    path: string,
    queryParams?: any,
    body?: any,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'DELETE',
      path,
      queryParams,
      body,
      options,
    )
  }

  /** Make a POST request */
  async post<TSuccess, TError>(
    path: string,
    queryParams?: any,
    body?: any,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'POST',
      path,
      queryParams,
      body,
      options,
    )
  }

  /** Make a PUT request */
  async put<TSuccess, TError>(
    path: string,
    queryParams?: any,
    body?: any,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'PUT',
      path,
      queryParams,
      body,
      options,
    )
  }

  /** Make a PATCH request */
  async patch<TSuccess, TError>(
    path: string,
    queryParams?: any,
    body?: any,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'PATCH',
      path,
      queryParams,
      body,
      options,
    )
  }
}
