# 報名表英文專案簡述（200 字以內）

字數：185。可直接貼上。

```text
CareKitchen is a conversational AI meal advisor for older adults who cook alone, family caregivers, and relatives who help from a distance. Users describe the ingredients at home, the number of people, a purchase budget in NT$, available equipment, and any restrictions they have already confirmed. CareKitchen proposes two or three simple meals, then re-checks every condition whenever something changes, such as "no eggs", "two people", or "microwave only".

The service is built around honesty. Prices come only from what the user provides, so unknown prices stay unknown instead of being guessed. Confirmed exclusions are hard limits the model cannot lift, and medication or symptom questions are referred to professionals. Each role gets a different output: short choices for older adults, a condition checklist for caregivers, and a previewable shopping summary for relatives.

We improved the service through five tested versions on one model. On a fixed 16-round test, passing rounds rose from 5 to 16; on ten new rounds, from 7 to 10 after fixes. All cases are synthetic, and testing with real users is our next step. CareKitchen is not a medical tool.
```

數字來源：`docs/evidence/README.md` 與 `docs/evidence/iteration-development.md`。若之後新增真人測試或重跑，請同步更新此段與簡報第 2、15、18、25 頁。
