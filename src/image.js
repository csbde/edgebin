import { CustomError, stringToNumber } from "./utils.js";

const MAX_DIMENSION = 65535;
const HEX_COLOR = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const FORMATS = ["png", "jpeg", "webp", "svg"];

function parseDimension(str, name) {
  const num = stringToNumber(str);
  if (!Number.isInteger(num) || num < 1 || num > MAX_DIMENSION) {
    throw new CustomError(
      `${name} must be an integer in range [1, ${MAX_DIMENSION}]`,
      400,
    );
  }
  return num;
}

function parseColor(value, fallback, name) {
  if (value === null || value === "") {
    return fallback;
  }
  if (!HEX_COLOR.test(value)) {
    throw new CustomError(
      `Invalid ${name} color: "${value}", expect a hex color like "cccccc" or "#ccc"`,
      400,
    );
  }
  return value.startsWith("#") ? value : `#${value}`;
}

function escapeXml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/**
 * Generate a placeholder SVG image with custom dimensions.
 * Called when the path has segments after /image, e.g.:
 *   /image/:size                -> square image
 *   /image/:width/:height       -> image with given size
 *   /image/:width/:height/svg   -> same as above with explicit svg suffix
 * Query parameters: text, background, foreground
 */
export function handleImage(parts, searchParams) {
  let segments = parts.slice(1);
  const trailing = segments[segments.length - 1];
  if (trailing === "svg") {
    segments = segments.slice(0, -1);
  } else if (FORMATS.includes(trailing)) {
    throw new CustomError(
      `Custom dimensions are only supported for svg format, got "${trailing}"`,
      400,
    );
  }
  if (segments.length === 0 || segments.length > 2) {
    throw new CustomError(
      "Expect /image/:size or /image/:width/:height[/svg]",
      400,
    );
  }

  const width = parseDimension(segments[0], "Width");
  const height =
    segments.length > 1 ? parseDimension(segments[1], "Height") : width;
  const background = parseColor(
    searchParams.get("background"),
    "#cccccc",
    "background",
  );
  const foreground = parseColor(
    searchParams.get("foreground"),
    "#969696",
    "foreground",
  );
  const text = escapeXml(searchParams.get("text") ?? `${width}x${height}`);
  const fontSize = Math.max(12, Math.floor(Math.min(width, height) / 8));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${background}"/>
  <text x="50%" y="50%" fill="${foreground}" font-family="Helvetica,Arial,sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">${text}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
