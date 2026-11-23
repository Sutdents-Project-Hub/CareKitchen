# Submission Form Project Description (under 200 words)

**Word count: 192.** Copy-ready draft; verify names, team division, and current form requirements before submission.

```text
CareKitchen is a conversational AI meal advisor for older adults who cook alone, family caregivers, and relatives who help from a distance. Users describe the ingredients at home, the number of people, a purchase budget in NT$, available equipment, and any restrictions they have already confirmed. CareKitchen proposes two or three simple meals, then re-checks every condition whenever something changes, such as "no eggs", "two people", or "microwave only".

The service is built around honesty. Prices come only from what the user provides, so unknown prices stay unknown instead of being guessed. Confirmed exclusions are hard limits the model cannot lift, and medication or symptom questions are referred to professionals. Each role gets a different output: short choices for older adults, a condition checklist for caregivers, and a previewable shopping summary for relatives.

In a historical Traditional Chinese test, passing rounds rose from 5/16 in V1 to 16/16 in V4. A separate English V5 run passed 16/16 turns and 59/59 checks; its direct baseline completed the same 16 synthetic cases without scored assertions. All cases are synthetic, and testing with real users is our next step. CareKitchen is not a medical tool.
```

The counts are supported by the [evaluation index](../evidence/README.md) and [iteration record](../evidence/iteration-development.md). If user research or new runs are added, update this draft and the deck's corresponding summary/results slides together.
