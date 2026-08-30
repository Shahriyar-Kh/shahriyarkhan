# P01A.5H — Yango Media Privacy Audit

**Date:** 2026-08-30
**Scope:** Every file under `frontend/public/images/yangowing_images/` as of `origin/main`, visually inspected for phone numbers, email addresses, names tied to records, customer identifiers, tokens, credentials, internal URLs, account numbers, vehicle/driver identifiers, or private operational records. No claim about authenticity (real vs. synthetic) is made for any image — presence of apparent personal data is treated as sufficient reason to exclude, per the same standard applied in P01A4/P01A5.

---

## Findings

| File | Referenced in code (before this hotfix)? | Content | Privacy verdict |
|---|---|---|---|
| `Landing_Preview_page.png` | Yes | Public marketing landing page (Rawalpindi city page) | Safe — no personal/operational data |
| `homepage.png` | Yes | Public homepage hero + offer card | Safe |
| `Registration_page.png` | Yes | Public registration **form**, all fields are empty placeholder text (`"Muhammad Ahmad"`, `"0300-1234567"`, etc. as `placeholder=` attributes, not submitted data) | Safe |
| `Rawalpindi_Registration.png` | Yes | Public city landing page; only the site's own published business support numbers (0323-1213999, 0324-4110141) and support email | Safe — intentionally public business contact info |
| `Services_page.png` | Yes | Public services page | Safe |
| `custom_dashbaord_image1.png` | Yes | Admin "Analytics Overview" — **aggregate counts only** (Total Registrations: 5, Today: 2, etc.), no individual records | Safe |
| `custom_dashbaord_image2.png` | Yes (until this hotfix) | Admin "Registration Management" table — **individual rows with names ("Khan," "asad," "Shahriyar Khan1," "Shahriyar Khan333333333") and a repeated phone number pattern (03295448590 / 03295448434)** | **Not safe — removed by this hotfix** (§ below) |
| `homepage1.png` | No (unreferenced) | Public marketing — "How much can you earn per month?" earnings-tier cards | Safe — no personal data (unverified earnings figures are a content-truth concern, not a privacy one, and this file isn't rendered anywhere) |
| `homepage2.png` | No (unreferenced) | Public marketing — "City-wise trip bonuses" tier tables | Safe — no personal data |
| `homepage3.png` | No (unreferenced) | Public marketing — "Active across Pakistan" city coverage + support contact block (same business numbers as above) | Safe — no personal data |

## Conclusion

**`custom_dashbaord_image2.png` was the only file in this directory showing apparent individual-record personal data** (names and a phone number tied to specific registration rows). It has been deleted from `frontend/public/` entirely by this hotfix (not just unreferenced) — see `P01A5H_PRIVACY_HOTFIX_REPORT.md`. No other file in `yangowing_images/` requires exclusion on privacy grounds. The three unreferenced files (`homepage1.png`/`2`/`3`) were left in place, unreferenced, exactly as found — they render nowhere and introduce no exposure themselves; deleting genuinely unused, non-sensitive assets is unrelated portfolio cleanup and out of this hotfix's narrow scope.
