# CareKitchen | Project Overview and Acceptance

> Status: Local web prototype and GPT-6 Luna synthetic-case runs are documented. Public deployment and real-user research remain unverified. The product requirements are in [product-spec.md](product-spec.md); official competition requirements are tracked in [competition.md](competition.md).

## Purpose

CareKitchen is a conversational meal-planning service for older adults living alone, family caregivers, and family members. It helps users discuss a practical meal based on ingredients on hand, a budget for additional purchases, cooking equipment, preferences, and dietary restrictions the user has confirmed.

It does not diagnose disease, assess medication-food interactions, prescribe therapeutic diets, provide clinical or pharmacist approval, or check live market prices. The problem statement remains a user-needs hypothesis pending real-user research.

## Intended roles

- **Older adult living alone:** one-person meals, fewer purchases, easy cooking, readable steps.
- **Family caregiver:** preserve explicitly confirmed restrictions and identify questions requiring professional confirmation.
- **Family member:** compare meal options and organize purchases while respecting the older adult's choice.

## Competition goals (not all delivered)

1. An operable, conversational LLM meal-planning service.
2. Meaningful differences among the three role experiences.
3. Multi-turn collection and retention of people, budget, ingredients, prices, equipment, preferences, and confirmed restrictions.
4. Two or three meal options, concise steps, substitutions, and a shopping summary.
5. Transparent unknown prices, budget conflicts, hard restrictions, and medical referrals.
6. Reproducible baseline, versioned iterations, and failure evidence.
7. An evaluator-accessible live experience, a shareable final conversation with at least ten message exchanges, and a complete English PDF.

These are acceptance goals, not a claim that every competition deliverable is complete.

## Scope boundaries

Out of scope for the first release: voice, image OCR, saved favorites, weekly menus, ordering, nutrition databases, live price feeds, disease-risk prediction, medication advice, prescription recognition, health records, accounts, multi-agent systems, native apps, CMS, and separate backend services.

The only executable component is `web/`, using Next.js App Router, TypeScript, Node.js 24 LTS, and pnpm. Server Route Handlers own AI calls and safety checks. Vercel Hobby is planned for hosting; no Vercel project or persistent conversation store has been created.

## Handoff and acceptance

Follow [implementation-roadmap.md](implementation-roadmap.md), [agent-design.md](agent-design.md), [API and data contracts](api-and-data-contracts.md), and the [evaluation plan](evaluation-and-iteration.md). P0 acceptance is defined by CK-01–CK-10 and AC-01–AC-14 in the product specification. Mark untested items as planned or unverified. Never fabricate interviews, model results, prices, or external acceptance.

Open decisions include GitHub import eligibility, evaluator access, storage and retention, consent and withdrawal for shared conversations, real-user study and permissions, official eligibility/deadline confirmation, and repository licensing. Deployment is not authorized or completed by this overview.
