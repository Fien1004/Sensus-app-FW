const STRAPI_BASE_URL = import.meta.env.VITE_STRAPI_URL

function buildStrapiUrl(path) {
  if (!STRAPI_BASE_URL) {
    throw new Error('VITE_STRAPI_URL is not configured')
  }

  return `${STRAPI_BASE_URL.replace(/\/$/, '')}${path}`
}

function mapScenario(item) {
  const data = item ?? {}

  return {
    id: item?.id,
    title: data.title ?? '',
    slug: data.slug ?? '',
    description: data.description ?? '',
    theme: data.theme ?? '',
    duration: data.duration ?? null,
    age_min: data.age_min ?? null,
    age_max: data.age_max ?? null,
    is_active: data.is_active ?? null,
    engine_json: data.engine_json ?? null,
  }
}

export async function getScenarios() {
  try {
    const res = await fetch(buildStrapiUrl('/api/scenarios?populate=*'))
    if (!res.ok) {
      console.error('Failed to fetch scenarios from Strapi:', res.status, res.statusText)
      return []
    }

    const json = await res.json()
    const items = json?.data ?? []

    const mapped = items.map(mapScenario)

    // If is_active exists on items, filter to active only
    if (mapped.some((m) => m.is_active !== null)) {
      return mapped.filter((m) => m.is_active)
    }

    return mapped
  } catch (err) {
    console.error('Error fetching scenarios from Strapi:', err)
    return []
  }
}

export async function getScenarioBySlug(slug) {
  try {
    if (!slug) return null
    const encoded = encodeURIComponent(slug)
    const url = buildStrapiUrl(`/api/scenarios?filters[slug][$eq]=${encoded}&populate=*`)
    const res = await fetch(url)
    if (!res.ok) {
      console.error('Failed to fetch scenario by slug from Strapi:', res.status, res.statusText)
      return null
    }

    const json = await res.json()
    const item = json?.data?.[0]
    if (!item) return null

    return mapScenario(item)
  } catch (err) {
    console.error('Error fetching scenario by slug from Strapi:', err)
    return null
  }
}