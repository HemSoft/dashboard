import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  getRedisClient,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} from "./redis";

// Mock @upstash/redis
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  })),
}));

describe("redis", () => {
  const originalEnv = {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  };

  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = originalEnv.url;
    process.env.UPSTASH_REDIS_REST_TOKEN = originalEnv.token;
  });

  describe("getRedisClient", () => {
    it("should return null when credentials are not configured", () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const client = getRedisClient();
      expect(client).toBeNull();
    });

    it("should return null when URL is missing", () => {
      delete process.env.UPSTASH_REDIS_REST_URL;

      const client = getRedisClient();
      expect(client).toBeNull();
    });

    it("should return null when token is missing", () => {
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const client = getRedisClient();
      expect(client).toBeNull();
    });

    it("should return a Redis client when credentials are configured", () => {
      const client = getRedisClient();
      expect(client).not.toBeNull();
    });
  });

  describe("getCache", () => {
    it("should return null when Redis client is unavailable", async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;

      const result = await getCache("test-key");
      expect(result).toBeNull();
    });

    it("should return cached value when available", async () => {
      const mockValue = { data: "test" };
      const client = getRedisClient();
      
      if (client) {
        vi.spyOn(client, "get").mockResolvedValue(mockValue);
      }

      const result = await getCache<typeof mockValue>("test-key");
      expect(result).toEqual(mockValue);
    });

    it("should return null when Redis get throws error", async () => {
      const client = getRedisClient();
      
      if (client) {
        vi.spyOn(client, "get").mockRejectedValue(new Error("Redis error"));
      }

      const result = await getCache("test-key");
      expect(result).toBeNull();
    });
  });

  describe("setCache", () => {
    it("should return false when Redis client is unavailable", async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;

      const result = await setCache("test-key", "test-value");
      expect(result).toBe(false);
    });

    it("should set cache value with default TTL", async () => {
      const client = getRedisClient();
      
      if (client) {
        const setSpy = vi.spyOn(client, "set").mockResolvedValue(undefined);
        
        const result = await setCache("test-key", "test-value");
        
        expect(result).toBe(true);
        expect(setSpy).toHaveBeenCalledWith("test-key", "test-value", { ex: 300 });
      }
    });

    it("should set cache value with custom TTL", async () => {
      const client = getRedisClient();
      
      if (client) {
        const setSpy = vi.spyOn(client, "set").mockResolvedValue(undefined);
        
        const result = await setCache("test-key", "test-value", 600);
        
        expect(result).toBe(true);
        expect(setSpy).toHaveBeenCalledWith("test-key", "test-value", { ex: 600 });
      }
    });

    it("should return false when Redis set throws error", async () => {
      const client = getRedisClient();
      
      if (client) {
        vi.spyOn(client, "set").mockRejectedValue(new Error("Redis error"));
      }

      const result = await setCache("test-key", "test-value");
      expect(result).toBe(false);
    });
  });

  describe("deleteCache", () => {
    it("should return false when Redis client is unavailable", async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;

      const result = await deleteCache("test-key");
      expect(result).toBe(false);
    });

    it("should delete cache key", async () => {
      const client = getRedisClient();
      
      if (client) {
        const delSpy = vi.spyOn(client, "del").mockResolvedValue(1);
        
        const result = await deleteCache("test-key");
        
        expect(result).toBe(true);
        expect(delSpy).toHaveBeenCalledWith("test-key");
      }
    });

    it("should return false when Redis delete throws error", async () => {
      const client = getRedisClient();
      
      if (client) {
        vi.spyOn(client, "del").mockRejectedValue(new Error("Redis error"));
      }

      const result = await deleteCache("test-key");
      expect(result).toBe(false);
    });
  });

  describe("deleteCachePattern", () => {
    it("should return 0 when Redis client is unavailable", async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;

      const result = await deleteCachePattern("test:*");
      expect(result).toBe(0);
    });

    it("should delete multiple keys matching pattern", async () => {
      const client = getRedisClient();
      
      if (client) {
        vi.spyOn(client, "keys").mockResolvedValue(["test:1", "test:2", "test:3"]);
        const delSpy = vi.spyOn(client, "del").mockResolvedValue(3);
        
        const result = await deleteCachePattern("test:*");
        
        expect(result).toBe(3);
        expect(delSpy).toHaveBeenCalledWith("test:1", "test:2", "test:3");
      }
    });

    it("should return 0 when no keys match pattern", async () => {
      const client = getRedisClient();
      
      if (client) {
        vi.spyOn(client, "keys").mockResolvedValue([]);
        
        const result = await deleteCachePattern("test:*");
        
        expect(result).toBe(0);
      }
    });

    it("should return 0 when Redis throws error", async () => {
      const client = getRedisClient();
      
      if (client) {
        vi.spyOn(client, "keys").mockRejectedValue(new Error("Redis error"));
      }

      const result = await deleteCachePattern("test:*");
      expect(result).toBe(0);
    });
  });
});
