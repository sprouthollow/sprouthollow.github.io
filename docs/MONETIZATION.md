# Sprout Hollow: monetization and entitlement architecture

## Principles
- All gameplay is free forever: crops, quests, Whisperwood, companions, crafting and the cottage.
- The only things for sale are cosmetics and a supporter membership. Nothing paid gives a gameplay advantage, and there are no paid energy refills or timer skips.
- The game on the player's device never decides ownership. It only displays what the server says the player owns.

## Catalog (shown in the Market as "Coming soon")
| ID | Item | Type |
|---|---|---|
| `pack_sakura` | Sakura Cottage Pack | Decoration pack |
| `pack_lantern` | Lantern Festival Collection | Seasonal collection |
| `skin_scarves` | Cozy Scarf Skins | Companion skins |
| `cottage_loft` | Cottage Loft Upgrade | Cottage customization |
| `patron` | Sprout Patron | Supporter membership (subscription) |

## Target architecture (to build once the provider is chosen)
```
Player (GitHub Pages, static)            Backend (e.g. Cloudflare Workers / Supabase)          Payment provider
-------------------------------          ---------------------------------------------         ----------------
1. Tap "Buy"  ───────────────────────▶   POST /checkout {itemId}  (session token)
                                          creates a hosted checkout session  ───────────────▶  Stripe / Paddle / Lemon Squeezy
2. Redirect to the hosted checkout ◀───────────────────────────────────────────────────────────  (card data never touches our code)
                                          3. Webhook (signature verified with the secret key) ◀── payment succeeded / refunded / renewed
                                          4. Write the entitlement row (user, item, status, expiry)
5. GET /entitlements ────────────────▶   returns {items, exp, sig}
6. js/entitlements.js stores the list for display only
```

### Security rules
- Secret keys (the provider's secret key and the webhook signing secret) live only in backend environment variables. They never appear in this repo or in any file the game loads.
- Ownership is granted only by a verified webhook, never by a "success" redirect or by anything the game reports.
- Refunds and cancellations remove the entitlement through the same webhook path.
- Player sign-in uses a short-lived session token (an email magic link, or a sign-in provider). The local save stays separate from purchases, so editing the save can't unlock paid items.
- Any future cloud-save or gift features check the server's ownership records again before honoring paid content.

### Already in the code
- `js/entitlements.js`: a read-only client. `ENDPOINT` is `null`, so nothing is owned and no network calls are made.
- The Market tab lists the catalog with disabled "Coming soon" buttons and reads `SHEnt.has(id)` to show ownership.

### Open decisions
1. Payment provider. Paddle or Lemon Squeezy act as the merchant of record and handle VAT for a solo developer; Stripe gives more control.
2. Backend host. Cloudflare Workers + D1, or Supabase (Postgres plus built-in sign-in).
3. Player identity: an email magic link, or an optional Google sign-in.
