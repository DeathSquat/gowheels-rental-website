


export async function GET(
  request: Request,
  context: { params: { width: string; height: string } }
) {
  const { width, height } = context.params;
  const w = parseInt(width, 10);
  const h = parseInt(height, 10);

  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    return new Response("Invalid dimensions", { status: 400 });
  }

  // Simple SVG placeholder
  const svg = `<svg width='${w}' height='${h}' xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' fill='#eee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#aaa' font-size='20'>${w}x${h}</text></svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
