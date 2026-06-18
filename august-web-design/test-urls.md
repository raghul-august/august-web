# Test URLs for Migration Verification

Base domain: `https://www.meetaugust.ai`

## 1. Landing Page (Website Routes)

- [ ] `/` — Homepage (Hero, Testimonials, FAQ, etc.)
- [ ] `/about` — About page
- [ ] `/privacy` — Privacy Policy
- [ ] `/terms` — Terms & Conditions
- [ ] `/prescription-reader` — Prescription Reader tool page

## 2. Health Library — Main Pages

- [ ] `/en/library` — Library homepage (categories + search)
- [ ] `/en/library/symptoms` — Symptoms index
- [ ] `/en/library/medications` — Medications index
- [ ] `/en/library/diseases-conditions` — Diseases & Conditions index
- [ ] `/en/library/tests-procedures` — Tests & Procedures index
- [ ] `/en/library/blog` — Blog index

## 3. Health Library — Detail Pages (pick one from each section)

- [ ] `/en/library/symptoms/view/{any-symptom-slug}` — Symptom detail
- [ ] `/en/library/medications/view/{any-medication-slug}` — Medication detail
- [ ] `/en/library/diseases-conditions/view/{any-disease-slug}` — Disease detail
- [ ] `/en/library/tests-procedures/view/{any-test-slug}` — Test/Procedure detail
- [ ] `/en/library/blog/view/{any-blog-slug}` — Blog post detail

## 4. Health Library — Alphabet Index Pages

- [ ] `/en/library/symptoms/index/a` — Symptoms starting with A
- [ ] `/en/library/medications/index/a` — Medications starting with A
- [ ] `/en/library/diseases-conditions/index/a` — Diseases starting with A
- [ ] `/en/library/tests-procedures/index/a` — Tests starting with A
- [ ] `/en/library/blog/index/a` — Blog posts starting with A

## 5. Multi-language Support

- [ ] `/es/library` — Spanish library homepage
- [ ] `/hi/library/symptoms` — Hindi symptoms index
- [ ] `/fr/library/medications` — French medications index
- [ ] `/de/library` — German library homepage
- [ ] `/ja/library` — Japanese library homepage

## 6. Benchmarks (no language/library prefix)

- [ ] `/benchmarks` — Benchmarks overview page
- [ ] `/august-benchmark` — Original USMLE benchmark
- [ ] `/august-benchmark-2026` — 2026 benchmark
- [ ] `/benchmarks/safety-and-healthbench` — HealthBench page
- [ ] `/benchmarks/nature-medicine-emergency-triage-benchmark-august-ai` — Nature Medicine benchmark

## 7. Tools (no language prefix)

- [ ] `/tool/free-adhd-test` — ADHD Quiz
- [ ] `/tool/tdee-calculator` — TDEE Calculator
- [ ] `/tool/chronotype-test` — Chronotype Test
- [ ] `/tool/rice-purity-test` — Rice Purity Test
- [ ] `/tool/childhood-trauma-test` — Childhood Trauma Test
- [ ] `/tool/import-memory` — Import Memory tool
- [ ] `/tool/free-adhd-test/results?score=15` — ADHD results page
- [ ] `/tool/rice-purity-test/results?score=72` — Rice Purity results page

## 8. Tool Redirects (legacy /en/tool/ should redirect to /tool/)

- [ ] `/en/tool/free-adhd-test` → should 308 to `/tool/free-adhd-test`
- [ ] `/en/tool/tdee-calculator` → should 308 to `/tool/tdee-calculator`

## 9. Blog — Special Pages

- [ ] `/en/library/blog/it-is-not-users-but-households-that-use` — Static blog post
- [ ] `/behind-august` — Behind August (MDX page)

## 10. Search

- [ ] `/en/library/search/{any-search-id}` — Search results page

## 11. Author Pages

- [ ] `/en/library/author/view/{any-author-name}` — Author profile page

## 12. Redirects (should 301/308 to correct URLs)

### Legacy /library/:lang format
- [ ] `/library/en` → `/en/library`
- [ ] `/library/en/symptoms` → `/en/library/symptoms`
- [ ] `/library/es/medications` → `/es/library/medications`

### Bare section paths (without /library)
- [ ] `/en/symptoms` → `/en/library/symptoms`
- [ ] `/en/medications` → `/en/library/medications`
- [ ] `/en/diseases-conditions` → `/en/library/diseases-conditions`
- [ ] `/en/tests-procedures` → `/en/library/tests-procedures`
- [ ] `/en/blog` → `/en/library/blog`
- [ ] `/en/symptoms/view/headache` → `/en/library/symptoms/view/headache`

### Legacy benchmark paths (should redirect to root)
- [ ] `/en/library/benchmarks` → should 308 to `/benchmarks`
- [ ] `/en/library/august-benchmark` → should 308 to `/august-benchmark`
- [ ] `/en/library/august-benchmark-2026` → should 308 to `/august-benchmark-2026`
- [ ] `/en/library/benchmarks/safety-and-healthbench` → should 308 to `/benchmarks/safety-and-healthbench`
- [ ] `/en/library/behind-august` → should 308 to `/behind-august`

## 13. Sitemaps

- [ ] `/sitemap.xml` — Sitemap index
- [ ] `/sitemap-index.xml` — Alternate sitemap index URL
- [ ] `/sitemaps/static.xml` — Static pages sitemap
- [ ] `/sitemaps/blog.xml` — Blog sitemap
- [ ] `/sitemaps/symptoms.xml` — Symptoms sitemap
- [ ] `/sitemaps/medications.xml` — Medications sitemap
- [ ] `/sitemaps/diseasesconditions.xml` — Diseases sitemap
- [ ] `/sitemaps/testprocedures.xml` — Test procedures sitemap

## 14. API Routes

- [ ] `/api/languages` — Language list (JSON)
- [ ] `/api/health` — Health check

## 15. Static Assets

- [ ] `/favicon.ico` — Favicon
- [ ] `/august_logo_green.svg` — Logo
- [ ] `/website-images/hero-illustration.png` — Website hero image

## 16. Cloudflare Worker Redirects

- [ ] `/invite` → `https://www.meetaugust.ai/join/wa`
- [ ] `/invite/abc123` → `https://www.meetaugust.ai/join/wa?ref=abc123`
- [ ] `/wa` → `https://www.meetaugust.ai/join/wa`
- [ ] `/wa?utm=test` → `https://www.meetaugust.ai/join/wa?utm=test`
- [ ] `/rzp` → `https://rzp.io/rzp/augustai`

## 17. Internal Navigation (check in browser)

- [ ] Library NavBar: "Medications" → `/en/library/medications`
- [ ] Library NavBar: "Symptoms" → `/en/library/symptoms`
- [ ] Library NavBar: "Tests & Procedures" → `/en/library/tests-procedures`
- [ ] Library NavBar: "Diseases & Conditions" → `/en/library/diseases-conditions`
- [ ] Library NavBar: "Featured Articles" → `/en/library/blog`
- [ ] Library Footer: Home → `/`, About → `/about`, Health Library → `/en/library`
- [ ] Library Footer: Benchmarks → `/en/library/benchmarks`
- [ ] Website Navbar: "Benchmarks" → `/en/library/benchmarks`
- [ ] Website Footer: tool links → `/tool/...`
- [ ] Language switcher: `/en/library/symptoms` → `/es/library/symptoms`

## 18. Edge Cases

- [ ] `/en/library/symptoms/view/nonexistent-slug` — Should show error gracefully
- [ ] `/xx/library` — Invalid language code, should redirect to `/en/library`
- [ ] `/"https://malicious-site.com"` — Malformed external URL, should redirect cleanly
- [ ] `/en/library?source=webview` — Webview mode (no nav/footer)
