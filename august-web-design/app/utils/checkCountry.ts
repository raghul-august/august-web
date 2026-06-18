export function checkCountry(): string | null {
    if (typeof window === "undefined") return null

    try {
        // 1️⃣ URL param takes highest priority
        const urlCountry = new URL(window.location.href).searchParams.get(
            "country"
        )
        if (urlCountry) return urlCountry

        // 2️⃣ Fallback to Cloudflare country cookie
        const cookieCountry = document.cookie
            .split("; ")
            .find((c) => c.startsWith("cf_country="))
            ?.split("=")[1]

        return cookieCountry ?? null
    } catch {
        return null
    }
}

export function getLocationVariant(): string {
    if (typeof window === "undefined") return "Global"

    const isMobile = window.innerWidth < 810

    try {
        const country = checkCountry()
        if (country === "US") {
            return isMobile ? "Us-Mobile" : "Us"
        }
        if (country === "IN") {
            return isMobile ? "India-Mobile" : "India"
        } else {
            return isMobile ? "Global-Mobile" : "Global"
        }
    } catch {
        return isMobile ? "Global-Mobile" : "Global"
    }
}
