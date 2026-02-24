'use strict';

// src/errors.ts
var BabySeaError = class extends Error {
  constructor(status, body, rateLimit) {
    super(body.error.message);
    this.name = "BabySeaError";
    this.status = status;
    this.body = body;
    this.code = body.error.code;
    this.type = body.error.type;
    this.retryable = body.error.retryable;
    this.rateLimit = rateLimit;
    this.requestId = body.request_id ?? void 0;
  }
};
var BabySeaTimeoutError = class extends Error {
  constructor(timeoutMs) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "BabySeaTimeoutError";
  }
};
var BabySeaRetryError = class extends Error {
  constructor(lastError, attempts) {
    super(`All ${attempts} attempts failed. Last error: ${lastError.message}`);
    this.name = "BabySeaRetryError";
    this.lastError = lastError;
    this.attempts = attempts;
  }
};

// src/client.ts
var API_BASE_DOMAIN = "babysea.ai";
var REGION_URLS = {
  us: `https://api.us.${API_BASE_DOMAIN}`,
  eu: `https://api.eu.${API_BASE_DOMAIN}`
};
var DEFAULT_BASE_URL = REGION_URLS.us;
var DEFAULT_TIMEOUT = 3e4;
var DEFAULT_MAX_RETRIES = 2;
var SDK_VERSION = "1.0.0";
var BabySea = class {
  constructor(options) {
    if (!options.apiKey) {
      throw new Error(
        `BabySea: apiKey is required. Get one at https://${REGION_URLS.us.replace("https://api.", "")} or https://${REGION_URLS.eu.replace("https://api.", "")}`
      );
    }
    if (!options.baseUrl && !options.region) {
      throw new Error(
        "BabySea: region is required. Use 'us' or 'eu' (e.g. { region: 'us' })."
      );
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? REGION_URLS[options.region] ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.library = {
      providers: () => this.request("GET", "/v1/library/providers"),
      models: () => this.request("GET", "/v1/library/models")
    };
    this.health = {
      providers: () => this.request("GET", "/v1/health/inference/providers"),
      models: () => this.request("GET", "/v1/health/inference/models"),
      storage: () => this.request("GET", "/v1/health/storage"),
      cache: () => this.request("GET", "/v1/health/cache")
    };
  }
  // ─── Public API methods ───
  /**
   * API status
   *
   * `GET /v1/status`
   */
  async status() {
    return this.request("GET", "/v1/status");
  }
  /**
   * API usage
   *
   * `GET /v1/usage`
   *
   * @param days - Lookback window in days (1–90, default 30).
   */
  async usage(days) {
    const params = days !== void 0 ? `?days=${days}` : "";
    return this.request("GET", `/v1/usage${params}`);
  }
  /**
   * User account
   *
   * `GET /v1/user/account`
   */
  async account() {
    return this.request("GET", "/v1/user/account");
  }
  /**
   * User billing
   *
   * `GET /v1/user/billing`
   */
  async billing() {
    return this.request("GET", "/v1/user/billing");
  }
  /**
   * Cost estimate
   *
   * `GET /v1/estimate/{model_identifier}`
   *
   * @param model - Model identifier (e.g. `"{model_identifier}"`).
   * @param count - Number of generations to estimate (default 1).
   */
  async estimate(model, count) {
    const params = count !== void 0 ? `?count=${count}` : "";
    return this.request(
      "GET",
      `/v1/estimate/${model}${params}`
    );
  }
  /**
   * Cancel generation
   *
   * `POST /v1/content/generation/cancel/{generation_id}`
   *
   * @param generationId - The `generation_id` of the generation to cancel.
   */
  async cancelGeneration(generationId) {
    return this.request(
      "POST",
      `/v1/content/generation/cancel/${generationId}`
    );
  }
  /**
   * Delete generation
   *
   * `DELETE /v1/content/{generation_id}`
   *
   * @param generationId - The `generation_id` of the generation to delete.
   */
  async deleteGeneration(generationId) {
    return this.request(
      "DELETE",
      `/v1/content/${generationId}`
    );
  }
  /**
   * Content info
   *
   * `GET /v1/content/{generation_id}`
   *
   * @param generationId - The `generation_id` to retrieve.
   */
  async getGeneration(generationId) {
    return this.request(
      "GET",
      `/v1/content/${generationId}`
    );
  }
  /**
   * List content
   *
   * `GET /v1/content/list`
   *
   * @param options.limit - Page size (1–100, default 50).
   * @param options.offset - Offset (default 0).
   */
  async listGenerations(options) {
    const params = new URLSearchParams();
    if (options?.limit !== void 0) {
      params.set("limit", String(options.limit));
    }
    if (options?.offset !== void 0) {
      params.set("offset", String(options.offset));
    }
    const qs = params.toString();
    const path = `/v1/content/list${qs ? `?${qs}` : ""}`;
    return this.request("GET", path);
  }
  /**
   * Generate image
   *
   * `POST /v1/generate/image/{model_identifier}`
   *
   * @param model - Model identifier (e.g. `"{model_identifier}"`).
   * @param params - Generation parameters. See {@link ImageGenerationParams}.
   */
  async generate(model, params) {
    return this.request(
      "POST",
      `/v1/generate/image/${model}`,
      params
    );
  }
  /**
   * Generate video
   *
   * `POST /v1/generate/video/{model_identifier}`
   *
   * @param model - Model identifier (e.g. `"{model_identifier}"`).
   * @param params - Generation parameters. See {@link VideoGenerationParams}.
   */
  async generateVideo(model, params) {
    return this.request(
      "POST",
      `/v1/generate/video/${model}`,
      params
    );
  }
  // ─── HTTP Layer ───
  async request(method, path, body) {
    let lastError;
    const maxAttempts = this.maxRetries + 1;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.doRequest(method, path, body);
      } catch (err) {
        if (err instanceof BabySeaError && err.retryable && attempt < maxAttempts) {
          lastError = err;
          const waitMs = err.rateLimit?.retryAfter ? err.rateLimit.retryAfter * 1e3 : Math.min(1e3 * Math.pow(2, attempt - 1), 3e4);
          await sleep(waitMs);
          continue;
        }
        throw err;
      }
    }
    throw new BabySeaRetryError(lastError, maxAttempts);
  }
  async doRequest(method, path, body) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": `babysea/${SDK_VERSION}`,
      Accept: "application/json"
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : void 0,
        signal: controller.signal
      });
      const rateLimit = parseRateLimitHeaders(response.headers);
      if (!response.ok) {
        const errorBody = await response.json();
        throw new BabySeaError(response.status, errorBody, rateLimit);
      }
      return await response.json();
    } catch (err) {
      if (err instanceof BabySeaError) {
        throw err;
      }
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new BabySeaTimeoutError(this.timeout);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
};
function parseRateLimitHeaders(headers) {
  const limit = headers.get("X-RateLimit-Limit");
  if (!limit) {
    return void 0;
  }
  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(headers.get("X-RateLimit-Remaining") ?? "0", 10),
    reset: parseInt(headers.get("X-RateLimit-Reset") ?? "0", 10),
    retryAfter: headers.has("Retry-After") ? parseInt(headers.get("Retry-After"), 10) : void 0
  };
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.BabySea = BabySea;
exports.BabySeaError = BabySeaError;
exports.BabySeaRetryError = BabySeaRetryError;
exports.BabySeaTimeoutError = BabySeaTimeoutError;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map