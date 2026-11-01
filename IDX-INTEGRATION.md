# IDX Integration Guide for FindAnCHome.com

## Current setup (live)

`/search` is findanchome's own MLS search, fed by the Flexmls Spark API (RESO Web API), with listing pages at
`/listings/[ListingKey]`. Visitors never see a Flexmls login. "Schedule a tour" / "Ask a question" on each
listing posts to `/api/consultation`, so the request lands in **Leads** (`/dashboard/leads`) tagged with the MLS
number and emails Marc (when `RESEND_API_KEY` is set).

| Vercel env var | Purpose |
| --- | --- |
| `SPARK_ACCESS_TOKEN` | Spark IDX access token (server-only, never `NEXT_PUBLIC_`). Turns the native search on. |
| `SPARK_API_BASE` | Optional. Defaults to `https://sparkapi.com/Reso/OData`. |
| `NEXT_PUBLIC_FLEXMLS_SEARCH_URL` | Optional. Flexmls page used as the fallback (default `https://my.flexmls.com/marcspencer`). |

Until `SPARK_ACCESS_TOKEN` is set, or if the API errors, `/search` falls back to embedding the Flexmls portal
(`components/FlexmlsSearch.tsx`).

Search defaults to active listings in Onslow, Pender, New Hanover, Brunswick and Columbus counties. All query
building lives in `buildFilter()` in `lib/mls.ts`; if your MLS uses different values for `PropertySubType` or
`CountyOrParish`, adjust them there. Results are cached for 15 minutes.

### Getting the token
1. Sign in at https://sparkplatform.com with your Flexmls login and request an **IDX** API key (data access
   for your own website). Your MLS may need to approve it.
2. Once approved, copy the **access token** and add it to Vercel as `SPARK_ACCESS_TOKEN` (Production and
   Preview), then redeploy.

## Overview

This document explains how to integrate third-party IDX (Internet Data Exchange) services to display MLS listings on your Next.js website.

## What is IDX?

IDX allows real estate agents to display MLS listings from their local Multiple Listing Service on their website. It's a legal requirement that IDX displays follow specific rules set by the MLS.

## Recommended IDX Providers

### 1. IDX Broker (Most Popular)
- **Website**: https://www.idxbroker.com/
- **Pricing**: Starting at $60/month
- **Features**: 
  - Easy embed codes
  - Mobile responsive
  - Lead capture forms
  - Map search
  - Saved searches
  - Property alerts

### 2. Showcase IDX
- **Website**: https://showcaseidx.com/
- **Pricing**: Starting at $49/month
- **Features**:
  - Modern design
  - Advanced search filters
  - Multiple MLS support
  - Custom branding

### 3. Placester
- **Website**: https://placester.com/
- **Pricing**: Starting at $79/month
- **Features**:
  - Website builder + IDX
  - Open house management
  - Sold listings
  - Custom property pages

## Integration Steps

### Option 1: Embed IDX Search Widget

Most IDX providers give you an embed code that you can add to your Next.js pages.

**Example for homepage:**

```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      {/* Your existing content */}
      
      {/* IDX Search Widget */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Search MLS Listings</h2>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: `<!-- IDX Broker embed code here -->` 
            }}
          />
        </div>
      </section>
    </div>
  )
}
```

### Option 2: iFrame Integration

```typescript
<iframe 
  src="https://your-idx-provider.com/search" 
  width="100%" 
  height="800px"
  frameBorder="0"
/>
```

### Option 3: API Integration (Advanced)

Some IDX providers offer APIs for custom integrations:

```typescript
// lib/idx-api.ts
export async function getProperties(filters: PropertyFilters) {
  const response = await fetch('https://api.idxprovider.com/properties', {
    headers: {
      'Authorization': `Bearer ${process.env.IDX_API_KEY}`
    },
    body: JSON.stringify(filters)
  })
  return response.json()
}
```

## FlexMLS Spark API Integration

If you have access to FlexMLS Spark API:

### 1. Get API Credentials
- Contact your MLS board (NC Regional MLS or Cape Fear REALTORS®)
- Request Spark API access
- Obtain API key and secret

### 2. Install Spark API Client

```bash
npm install @fbsdata/spark-api
```

### 3. Configure API Client

```typescript
// lib/flexmls.ts
import { SparkAPI } from '@fbsdata/spark-api'

const spark = new SparkAPI({
  apiKey: process.env.FLEXMLS_API_KEY,
  apiSecret: process.env.FLEXMLS_API_SECRET
})

export async function searchListings(params: SearchParams) {
  return await spark.listings.search(params)
}
```

## Environment Variables

Add to `.env.local`:

```env
# IDX Broker
IDX_BROKER_API_KEY=your_key_here

# Or FlexMLS Spark API
FLEXMLS_API_KEY=your_key_here
FLEXMLS_API_SECRET=your_secret_here
```

## IDX Compliance Requirements

All IDX displays must include:

1. **MLS Attribution** - "Listing courtesy of [MLS Name]"
2. **Data Freshness** - Updates at least every 24 hours
3. **Sold/Pending Status** - Clear status indicators
4. **Agent Contact Info** - Listing agent information
5. **Equal Housing Opportunity Logo**

## Next Steps

1. Choose an IDX provider
2. Sign up and get embed codes or API credentials
3. Add environment variables to Vercel
4. Integrate embed codes into Next.js pages
5. Test on staging before going live

## Support

For questions about IDX integration:
- Contact your chosen IDX provider's support
- Reach out to your MLS board for Spark API access
- Email: marcspencer28461@gmail.com
