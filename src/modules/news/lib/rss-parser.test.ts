import { describe, expect, it } from "vitest";
import type { RssSource } from "../types";
import {
  extractLink,
  extractText,
  generateId,
  parseDate,
  parseRssFeed,
  stripHtml,
  truncate,
} from "./rss-parser";

describe("RSS Parser", () => {
  describe("generateId", () => {
    it("generates consistent ID for same URL", () => {
      const url = "https://example.com/article/1";
      const id1 = generateId(url);
      const id2 = generateId(url);
      expect(id1).toBe(id2);
    });

    it("generates different IDs for different URLs", () => {
      const id1 = generateId("https://example.com/article/1");
      const id2 = generateId("https://example.com/article/2");
      expect(id1).not.toBe(id2);
    });

    it("returns alphanumeric string", () => {
      const id = generateId("https://example.com");
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    it("generates different IDs when source differs", () => {
      const url = "https://example.com/article/1";
      const id1 = generateId(url, "Source A");
      const id2 = generateId(url, "Source B");
      expect(id1).not.toBe(id2);
    });

    it("generates consistent ID with same source", () => {
      const url = "https://example.com/article/1";
      const source = "Test Source";
      const id1 = generateId(url, source);
      const id2 = generateId(url, source);
      expect(id1).toBe(id2);
    });
  });

  describe("stripHtml", () => {
    it("removes HTML tags", () => {
      expect(stripHtml("<p>Hello <strong>World</strong></p>")).toBe(
        "Hello World"
      );
    });

    it("decodes HTML entities", () => {
      expect(stripHtml("Tom &amp; Jerry")).toBe("Tom & Jerry");
      expect(stripHtml("&lt;script&gt;")).toBe("<script>");
      expect(stripHtml("&quot;quoted&quot;")).toBe('"quoted"');
      expect(stripHtml("it&#39;s")).toBe("it's");
      expect(stripHtml("Hello&nbsp;World")).toBe("Hello World");
    });

    it("normalizes whitespace", () => {
      expect(stripHtml("Hello    World\n\nTest")).toBe("Hello World Test");
    });

    it("trims result", () => {
      expect(stripHtml("  <p>Hello</p>  ")).toBe("Hello");
    });
  });

  describe("truncate", () => {
    it("returns original text if shorter than max", () => {
      expect(truncate("Short text", 100)).toBe("Short text");
    });

    it("truncates and adds ellipsis", () => {
      const long = "A".repeat(250);
      const result = truncate(long, 200);
      expect(result.length).toBe(200);
      expect(result.endsWith("...")).toBe(true);
    });

    it("handles exact length", () => {
      const exact = "A".repeat(200);
      expect(truncate(exact, 200)).toBe(exact);
    });
  });

  describe("parseDate", () => {
    it("parses ISO date", () => {
      const date = parseDate("2025-12-20T10:00:00Z");
      expect(date).toBeInstanceOf(Date);
      expect(date?.getUTCFullYear()).toBe(2025);
    });

    it("parses RFC 2822 date", () => {
      const date = parseDate("Sat, 21 Dec 2025 10:00:00 GMT");
      expect(date).toBeInstanceOf(Date);
    });

    it("returns null for invalid date", () => {
      expect(parseDate("not a date")).toBeNull();
    });

    it("returns null for empty input", () => {
      expect(parseDate("")).toBeNull();
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
    });
  });

  describe("extractText", () => {
    it("returns string as-is", () => {
      expect(extractText("hello")).toBe("hello");
    });

    it("returns empty string for null/undefined", () => {
      expect(extractText(null)).toBe("");
      expect(extractText(undefined)).toBe("");
    });

    it("extracts #cdata-section", () => {
      expect(extractText({ "#cdata-section": "cdata content" })).toBe("cdata content");
    });

    it("extracts #text", () => {
      expect(extractText({ "#text": "text content" })).toBe("text content");
    });

    it("extracts _ property", () => {
      expect(extractText({ _: "underscore content" })).toBe("underscore content");
    });

    it("converts non-string/non-object to string", () => {
      expect(extractText(12345)).toBe("12345");
      expect(extractText(true)).toBe("true");
    });

    it("handles object without special properties", () => {
      expect(extractText({ other: "value" })).toBe("[object Object]");
    });
  });

  describe("extractLink", () => {
    it("returns string as-is", () => {
      expect(extractLink("https://example.com")).toBe("https://example.com");
    });

    it("extracts @_href from object", () => {
      expect(extractLink({ "@_href": "https://example.com/attr" })).toBe(
        "https://example.com/attr"
      );
    });

    it("extracts href from object", () => {
      expect(extractLink({ href: "https://example.com/href" })).toBe(
        "https://example.com/href"
      );
    });

    it("extracts #text from object", () => {
      expect(extractLink({ "#text": "https://example.com/text" })).toBe(
        "https://example.com/text"
      );
    });

    it("handles array of links", () => {
      expect(
        extractLink([
          { "@_href": "https://first.com" },
          { "@_href": "https://second.com" },
        ])
      ).toBe("https://first.com");
    });

    it("returns empty for empty array", () => {
      expect(extractLink([])).toBe("");
    });

    it("returns empty for non-matching object", () => {
      expect(extractLink({ rel: "alternate" })).toBe("");
    });

    it("returns empty for null/undefined", () => {
      expect(extractLink(null)).toBe("");
      expect(extractLink(undefined)).toBe("");
    });
  });

  describe("parseRssFeed", () => {
    const source: RssSource = {
      name: "Test Source",
      url: "https://example.com/rss",
      category: "tech",
    };

    it("parses RSS 2.0 format", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Test Article</title>
              <link>https://example.com/article/1</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
              <description>This is a test description.</description>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("Test Article");
      expect(items[0].url).toBe("https://example.com/article/1");
      expect(items[0].source).toBe("Test Source");
      expect(items[0].category).toBe("tech");
      expect(items[0].summary).toBe("This is a test description.");
    });

    it("parses Atom format", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Atom Article</title>
            <link href="https://example.com/atom/1"/>
            <published>2025-12-21T10:00:00Z</published>
            <summary>Atom summary content.</summary>
          </entry>
        </feed>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("Atom Article");
      expect(items[0].url).toBe("https://example.com/atom/1");
    });

    it("handles CDATA in title", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title><![CDATA[CDATA Title]]></title>
              <link>https://example.com/cdata</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("CDATA Title");
    });

    it("handles multiple items", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Article 1</title>
              <link>https://example.com/1</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
            <item>
              <title>Article 2</title>
              <link>https://example.com/2</link>
              <pubDate>Sat, 21 Dec 2025 11:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(2);
    });

    it("skips items without title", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <link>https://example.com/notitle</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(0);
    });

    it("skips items without link", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>No Link Article</title>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(0);
    });

    it("skips items without valid date", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>No Date Article</title>
              <link>https://example.com/nodate</link>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(0);
    });

    it("extracts content:encoded as summary", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Content Encoded</title>
              <link>https://example.com/ce</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
              <content:encoded><![CDATA[<p>Rich content here</p>]]></content:encoded>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].summary).toBe("Rich content here");
    });

    it("strips HTML from description", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>HTML Description</title>
              <link>https://example.com/html</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
              <description>&lt;p&gt;Paragraph&lt;/p&gt; with &amp;amp; entity</description>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items[0].summary).toBe("Paragraph with & entity");
    });

    it("handles single item (non-array)", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Single Item</title>
              <link>https://example.com/single</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
    });

    it("returns empty array for empty feed", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel></channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(0);
    });

    it("handles link as array", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Array Link</title>
            <link href="https://example.com/link1"/>
            <link href="https://example.com/link2"/>
            <published>2025-12-21T10:00:00Z</published>
          </entry>
        </feed>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].url).toBe("https://example.com/link1");
    });

    it("falls back to updated date", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Updated Only</title>
            <link href="https://example.com/updated"/>
            <updated>2025-12-21T10:00:00Z</updated>
          </entry>
        </feed>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
    });

    it("handles link with #text property", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Text Link</title>
              <link>https://example.com/textlink</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
    });

    it("handles link with href property (non-prefixed)", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Href Link</title>
            <link href="https://example.com/hreflink"/>
            <published>2025-12-21T10:00:00Z</published>
          </entry>
        </feed>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].url).toBe("https://example.com/hreflink");
    });

    it("handles title with underscore property", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Simple Title</title>
              <link>https://example.com/simple</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
    });

    it("handles content as summary fallback", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Content Entry</title>
            <link href="https://example.com/content"/>
            <published>2025-12-21T10:00:00Z</published>
            <content>This is the content field</content>
          </entry>
        </feed>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].summary).toBe("This is the content field");
    });

    it("handles empty link array", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>No Links</title>
            <published>2025-12-21T10:00:00Z</published>
          </entry>
        </feed>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(0);
    });

    it("handles single Atom entry (non-array)", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Single Atom Entry</title>
            <link href="https://example.com/single-atom"/>
            <published>2025-12-21T10:00:00Z</published>
          </entry>
        </feed>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("Single Atom Entry");
    });

    it("converts non-string title to string", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>12345</title>
              <link>https://example.com/numeric</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("12345");
    });

    it("handles title with #text nested property", () => {
      // fast-xml-parser can produce #text for mixed content
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title type="text">Text Title Here</title>
              <link>https://example.com/text</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
    });

    it("handles link with nested #text property from XML parser", () => {
      // Some parsers create #text for text nodes
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Link Test</title>
              <link type="text/html">https://example.com/linktext</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
    });

    it("returns empty for non-matching object in link extraction", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>No Valid Link</title>
              <link rel="alternate"/>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      // Should skip because link extraction returns empty
      expect(items).toHaveLength(0);
    });

    it("handles array of links with empty values", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Multi Link</title>
            <link rel="related"/>
            <link href="https://example.com/actual"/>
            <published>2025-12-21T10:00:00Z</published>
          </entry>
        </feed>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].url).toBe("https://example.com/actual");
    });

    it("skips items with 'Comments' title (Hacker News comment links)", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Comments</title>
              <link>https://news.ycombinator.com/item?id=123</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
            <item>
              <title>Real Article Title</title>
              <link>https://example.com/article</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("Real Article Title");
    });

    it("skips items with very short titles (less than 5 characters)", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Hi</title>
              <link>https://example.com/short</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
            <item>
              <title>Valid Title Here</title>
              <link>https://example.com/valid</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("Valid Title Here");
    });

    it("skips items with 'comments' title case-insensitively", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>COMMENTS</title>
              <link>https://example.com/comments</link>
              <pubDate>Sat, 21 Dec 2025 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const items = parseRssFeed(xml, source);
      expect(items).toHaveLength(0);
    });
  });
});
