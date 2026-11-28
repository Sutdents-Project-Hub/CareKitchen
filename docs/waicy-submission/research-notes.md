# External Research Notes and Verification Status

**Snapshot date: November 27, 2026.** This register distinguishes primary-source facts, project records, and claims that remain unverified. Search-result snippets are not treated as sufficient support for a final competition claim. Confirm the original page and wording before exporting the final PDF.

## Sources used in the 33-page deck (checked November 27, 2026)

| Claim or use | Source | Verification and limits |
|---|---|---|
| 2.1 billion people aged 60+ by 2050, from 1 billion in 2020 (page 4) | [WHO, Ageing and health](https://www.who.int/news-room/fact-sheets/detail/ageing-and-health) | Primary page read; page dated October 1, 2025. Projection. |
| 40% of women and 19% of men aged 65+ in the EU live alone (page 4) | [Eurostat, June 23, 2020](https://ec.europa.eu/eurostat/web/products-eurostat-news/-/ddn-20200623-1) | Primary page read; 2019 data. |
| About half of those delegating food activities were malnourished or at risk, versus 4% with no help (page 4) | [Van Wymelbeke-Delannoy et al., Age and Ageing, 2022](https://doi.org/10.1093/ageing/afab208) | Article page read. Observational; not causal. |
| 25.8% of people aged 65+ in one-person households, about 1.18 million, June 2025 (page 4) | [Taiwan Ministry of the Interior](https://www.moi.gov.tw/News_Content.aspx?Create=1&n=9&s=334815&sms=9009) | Primary release read; published November 29, 2025. |
| Project results and plain-chat failures | [Raw evaluation records](../evidence/README.md) | Synthetic cases; not user preference, safety or general accuracy. |
| Competition requirements | [Guidebook](https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf), [rubrics](https://www.waicy.org/rubrics/), [form](https://www.waicy.org/2026-submission/) | Read November 27, 2026. |

## Removed from the deck

| Claim | Reason |
|---|---|
| 28% of older Americans living alone (U.S. ACL) | The source refused automated access, so it could not be checked. |
| 8.5% / 17.5% / 28.0% malnutrition prevalence (Leij-Halfwerk et al.) | The primary article could not be read; only secondary support was found. |
| ChatGPT food-allergy diet pilot (Niszczota & Rybicka) | The abstract could not be read and search summaries conflicted. Replaced by the project's own recorded baseline cases. |
| Earlier rejected claims (a “4 of 56” allergen reading, a “more than 23% live alone” figure, market or impact estimates) | Not supported. |

## Research not completed

- No survey of existing meal-planning, nutrition, or older-adult applications. The project does not claim to outperform commercial products.
- No comprehensive nutrition or caregiving literature review; the meal catalogue has not been reviewed by a dietitian. The few context studies listed above do not validate CareKitchen's recommendations.
- No interviews or usability study with older adults, caregivers, or relatives. The target users are product personas, not research participants.
- No clinical validation or evidence of improved nutrition, health, safety, or independence.

## Research-linked test scenarios, November 28

| Study or data | Finding in its original context | Design inference tested here |
|---|---|---|
| [Taiwan Ministry of the Interior (2025), household registration bulletin](https://www.moi.gov.tw/News_Content.aspx?Create=1&n=9&s=334815&sms=9009) | In June 2025, 25.8% of registered residents aged 65+ belonged to one-person households. Registration cannot establish how frequently people cook alone or what support they receive. | The elder scenario starts with “Dinner for 1” and proceeds without repeating a recognized serving count. |
| [Whitelock & Ensaff (2018), *On Your Own*, Nutrients, 10(4), 413](https://doi.org/10.3390/nu10040413) | Focus groups with 30 adults aged 63–90 in one UK city surfaced cooking and shopping for one, food cost, and support with food as themes. The qualitative study provides context; it does not estimate Taiwan prevalence. | Try one-serving amounts, expose missing prices, and make the shopping preview understandable on its own. |
| [Low et al. (2020), *Food Habits of Older Australians Living Alone in the Australian Capital Territory*, Geriatrics, 5(3), 55](https://pubmed.ncbi.nlm.nih.gov/32962146/) | Three focus groups with 22 participants highlighted community connectedness in food choices. The study used qualitative sampling within one territory. | Let a relative copy a meal and shopping summary without sharing chat history. The caregiver restriction example is a project design hypothesis. |

The scenarios informed an agent-operated walkthrough of the actual deployed app. Product usability for older adults, caregiver workload, and the usefulness of the family handoff remain open questions for a consent-based study.
