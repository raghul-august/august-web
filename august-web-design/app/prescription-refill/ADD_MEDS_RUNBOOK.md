# Runbook: Add N new medications to the prescription-refill catalog

Paste this whole file into a fresh session, then append the list of new
medication slugs at the bottom. The agent should follow these steps to add
each med with a complete, clinically realistic prescription block and feature
it in the selector.

## Goal

For each new medication slug provided, ensure it has a complete, clinically
realistic `prescription` block in `medications.json` and is featured in the
medication selector.

## Files

- `app/prescription-refill/medications.json` — dict keyed by slug. Each entry:
  `name`, `conditions`, `drugClass`, `brandName`, `doseForm`, and a
  `prescription` object:
  `{dose, sig, dispense, refills, prescribedDaysAgo, prescriber, credential}`.
- `app/prescription-refill/_select-medication.tsx` — `FEATURED_IDS` set
  (mirrors backend `VALID_MEDICATION_IDS`); featured slugs float to the top of
  the selector.
- `~/Downloads/drug_data.json` (if present) — FDA source with fields:
  `drug_name, brand_name, drug_class, dispense_form, dose_form_category,
  dispense_unit, directions, mock_quantity, days_supply`.

## Constants (reuse verbatim)

- `prescriber`: `"Dr. John Doe"`
- `credential`: `"NPI 1487201930"`
- `refills`: `"0 remaining"`

## Steps

1. **Inspect first.** For each new slug, check `medications.json`: does the key
   exist? does it already have a `prescription` block? what are
   `brandName`/`drugClass`/`doseForm`? Also check `drug_data.json` for a
   matching `drug_name`. Match slugs by lowercasing + replacing non-alphanumerics
   with `-`, **but match against existing keys** — some use underscores
   (`folic_acid`, `lidocaine_patch`). Never invent a new key spelling.

2. **Seed from FDA data where available.** If a med is in `drug_data.json`,
   derive `dispense` = `"<mock_quantity> <dispense_unit>(s) · <days_supply>-day supply"`,
   a starting `dose`, and a draft `sig` from `directions`. Note: FDA `directions`
   is monograph-style and **must** be cleaned in step 3.

3. **Review with batched agents — NOT one agent per med.** Group the meds by
   therapeutic class into ~4 batches of ~5. Spawn one `general-purpose` agent
   per batch (in parallel, background). Each agent does the *complete* review in
   one pass and returns **JSON only** (state this explicitly — agents that can
   edit files may otherwise edit `medications.json` directly; harmless, but you
   want deterministic output). Per-med, the agent validates/refines four fields
   under these rules:
   - **sig** = real pharmacy-label style: action verb + quantity + route +
     frequency (+ timing or PRN indication). NO titration ranges, NO
     "target dose", NO indications/monograph phrasing. One sentence, ends in a
     period.
   - **dose** = single strength + form (e.g. `"20 mg tablet"`).
   - **dispense** = `"<qty> <unit> · <N>-day supply"`, with qty consistent with
     the sig's max frequency over the supply window.
   - **prescribedDaysAgo** (days since last fill, for a patient needing a refill
     *now*):
     - chronic **daily** med → slightly *under* days_supply (days 26-29 of a
       30-day supply);
     - **PRN/as-needed** med → sporadic use, so it may *exceed* the nominal
       days_supply (a 7-day supply requested at ~14-18 days is realistic).
   - Tell agents: **keep values that are already clinically sound; don't change
     for the sake of changing.**
   - Return shape:
     `[{"slug","dose","sig","dispense","prescribedDaysAgo","notes"}, ...]`
     (add `"doseForm"` only when it's missing).

4. **Apply via one idempotent Python script.** Consolidate all agents' JSON,
   then set the fields explicitly per slug. Create the `prescription` block if
   missing, filling `refills`/`prescriber`/`credential` from the constants.
   Idempotent apply means the result is deterministic even if an agent
   pre-edited the file.

5. **Feature them.** Add every new slug to `FEATURED_IDS` in
   `_select-medication.tsx`; keep the set alphabetically sorted; don't add slugs
   that aren't in `medications.json`.

6. **Verify scope.** Confirm `medications.json` is valid JSON, print key count +
   with-prescription count, and confirm no entries were added/dropped
   unexpectedly. Spot-check the new meds' `prescribedDaysAgo`.

7. **Confirm branch, then commit.** Run `git branch --show-current` and confirm
   it's the intended branch *before* committing (it's easy to commit to the
   wrong branch). Stage only `medications.json` + `_select-medication.tsx`. Use
   a descriptive message. Do not push unless asked.

## The next medications to add

<paste new slugs here>
