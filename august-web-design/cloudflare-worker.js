const WEBSITE_ORIGIN = "https://landing.meetaugust.ai";

function withCountryCookie(req, response) {
  const country = req.cf?.country
  if (!country) return response

  const headers = new Headers(response.headers)

  // Set cookie only if not already present
  headers.append(
    "Set-Cookie",
    `cf_country=${country}; Path=/; Max-Age=86400; SameSite=Lax`
  )

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // /invite → app deep link
    if (path === "/invite" || path.startsWith("/invite/")) {
      const code = path.split("/invite/")[1] || "";
      return Response.redirect(
        `https://www.meetaugust.ai/join/wa${code ? `?ref=${code}` : ""}`,
        302
      );
    }

    // /wa → WhatsApp join link
    if (path === "/wa" || path.startsWith("/wa/")) {
      const params = url.searchParams.toString();
      return Response.redirect(
        `https://www.meetaugust.ai/join/wa${params ? `?${params}` : ""}`,
        302
      );
    }

    // /rzp → Razorpay payment link
    if (path === "/rzp" || path.startsWith("/rzp/")) {
      return Response.redirect("https://rzp.io/rzp/augustai", 302);
    }

    const originUrl = new URL(request.url);
    originUrl.hostname = new URL(WEBSITE_ORIGIN).hostname;
    originUrl.protocol = new URL(WEBSITE_ORIGIN).protocol;
    originUrl.port = new URL(WEBSITE_ORIGIN).port || "";

    const originRequest = new Request(originUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "manual",
    });

    // Pass the original Host header so Next.js sees www.meetaugust.ai
    originRequest.headers.set("Host", "www.meetaugust.ai");
    originRequest.headers.set("X-Forwarded-Host", "www.meetaugust.ai");
    originRequest.headers.set("X-Forwarded-Proto", "https");

    const response = await fetch(originRequest);
    return withCountryCookie(request, response);
  },
};
