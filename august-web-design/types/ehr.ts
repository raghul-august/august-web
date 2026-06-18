export interface EhrPatientProfile {
  resource_id: string;
  name_prefix: string;
  given_name: string;
  family_name: string;
  full_name: string;
  birth_date: string;
  gender: string;
  race_display: string;
  ethnicity_display: string;
  preferred_language_display: string;
  marital_status_display: string;
  is_deceased: boolean;
  deceased_at: string;
  mrn: string;
  address_text: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface EhrEncounterParticipant {
  participant_index: number;
  participant_name: string;
  role_display: string;
  created_at: string;
}

export interface EhrEncounterDiagnosis {
  condition_resource_id: string;
  code_display: string;
  rank: number;
  source: string;
  created_at: string;
}

export interface EhrEncounterSummaryRef {
  resource_id: string;
  display: string;
}

export interface EhrEncounter {
  resource_id: string;
  status: string;
  class_display: string;
  type_display: string;
  reason_display: string;
  start_at: string;
  end_at: string;
  provider_name: string;
  facility_name: string;
  location_name: string;
  discharge_disposition_display: string;
  created_at: string;
  participants: EhrEncounterParticipant[];
  diagnoses: EhrEncounterDiagnosis[];
  conditions: EhrEncounterSummaryRef[];
  medications: EhrEncounterSummaryRef[];
  allergies: EhrEncounterSummaryRef[];
  procedures: EhrEncounterSummaryRef[];
  diagnostic_reports: EhrEncounterSummaryRef[];
  observations: EhrEncounterSummaryRef[];
  care_plans: EhrEncounterSummaryRef[];
  clinical_notes: EhrEncounterSummaryRef[];
  immunizations: EhrEncounterSummaryRef[];
}

export interface EhrConditionData {
  name: string;
  description: string;
  category: {
    icd_chapter?: string;
    icd_category?: string;
    mesh_categories?: string[];
  };
  parent_condition: string;
  body_site: string[];
  synonyms: string[];
  symptoms: { name: string; frequency?: string }[];
  causes: string[];
  clinical_course: string[];
  [key: string]: unknown;
}

export interface EhrCondition {
  resource_id: string;
  encounter_resource_id: string;
  clinical_status_code: string;
  verification_status_code: string;
  category_display: string;
  severity_display: string;
  code_display: string;
  onset_at: string;
  abatement_at: string;
  recorded_at: string;
  note_text: string;
  created_at: string;
  condition_data: EhrConditionData[] | null;
}

export interface EhrMedicationData {
  name: string;
  status: string[];
  description: string;
  indication: string;
  mechanism_of_action: string;
  [key: string]: unknown;
}

export interface EhrMedication {
  resource_id: string;
  code_display: string;
  medication_data: EhrMedicationData[] | null;
}

export interface EhrAllergyReaction {
  reaction_index: number;
  manifestation_display: string;
  severity_code: string;
  note_text: string;
  created_at: string;
}

export interface EhrAllergy {
  resource_id: string;
  encounter_resource_id: string;
  clinical_status_code: string;
  verification_status_code: string;
  type: string;
  category: string;
  criticality: string;
  code_display: string;
  recorded_at: string;
  onset_at: string;
  onset_text: string;
  last_occurrence_at: string;
  reaction_summary: string;
  created_at: string;
  reactions: EhrAllergyReaction[];
}

export interface EhrProcedure {
  resource_id: string;
  encounter_resource_id: string;
  status: string;
  code_display: string;
  performed_start_at: string;
  performed_end_at: string;
  reason_display: string;
  reason_condition_resource_id: string;
  created_at: string;
}

export interface EhrObservationComponent {
  component_index: number;
  code_display: string;
  interpretation_display: string;
  value_num: number | null;
  value_unit: string;
  value_text: string;
  value_display: string;
  ref_range_low: number | null;
  ref_range_high: number | null;
  ref_range_text: string;
  data_absent_reason_display: string;
  created_at: string;
}

export interface EhrObservationSource {
  diagnostic_report_resource_id: string;
  code_display: string;
  category_display: string;
  effective_at: string;
  issued_at: string;
}

export interface EhrObservation {
  resource_id: string;
  encounter_resource_id: string;
  diagnostic_report_resource_id: string;
  status: string;
  category_display: string;
  code_display: string;
  effective_at: string;
  effective_end_at: string;
  issued_at: string;
  interpretation_display: string;
  value_num: number | null;
  value_unit: string;
  value_text: string;
  value_display: string;
  ref_range_low: number | null;
  ref_range_high: number | null;
  ref_range_text: string;
  data_absent_reason_display: string;
  note_text: string;
  created_at: string;
  components: EhrObservationComponent[];
  source: EhrObservationSource | null;
}

export interface EhrObservations {
  laboratory: EhrObservation[];
  'vital-signs': EhrObservation[];
  'social-history': EhrObservation[];
  uncategorized: EhrObservation[];
}

export interface EhrDiagnosticReport {
  resource_id: string;
  encounter_resource_id: string;
  status: string;
  category_display: string;
  code_display: string;
  effective_at: string;
  issued_at: string;
  performer_display: string;
  conclusion_text: string;
  presented_form_url: string;
  presented_form_mime_type: string;
  created_at: string;
}

export interface EhrImmunization {
  resource_id: string;
  encounter_resource_id: string;
  status: string;
  vaccine_display: string;
  occurrence_at: string;
  recorded_at: string;
  created_at: string;
}

export interface EhrCarePlanActivity {
  activity_index: number;
  status: string;
  code_display: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  created_at: string;
}

export interface EhrCarePlanAddress {
  condition_resource_id: string;
  source: string;
  created_at: string;
}

export interface EhrCarePlan {
  resource_id: string;
  encounter_resource_id: string;
  status: string;
  intent: string;
  category_display: string;
  title: string;
  description: string;
  period_start_at: string;
  period_end_at: string;
  created_at: string;
  activities: EhrCarePlanActivity[];
  addresses: EhrCarePlanAddress[];
}

export interface EhrClinicalNote {
  resource_id: string;
  encounter_resource_id: string;
  status: string;
  category_display: string;
  type_display: string;
  date_at: string;
  context_period_start_at: string;
  context_period_end_at: string;
  author_display: string;
  title: string;
  content_mime_type: string;
  content_url: string;
  content_text: string;
  created_at: string;
}

export interface EhrData {
  patient_profiles: EhrPatientProfile[];
  encounters: EhrEncounter[];
  conditions: EhrCondition[];
  medications: EhrMedication[];
  allergies: EhrAllergy[];
  procedures: EhrProcedure[];
  observations: EhrObservations;
  diagnostic_reports: EhrDiagnosticReport[];
  immunizations: EhrImmunization[];
  care_plans: EhrCarePlan[];
  clinical_notes: EhrClinicalNote[];
  connections: unknown[];
  export_jobs: unknown[];
}

export type EhrCategoryKey = keyof Omit<EhrData, 'connections' | 'export_jobs'>;

// ── Per-page contract (FE-side mirror) ─────────────────────────
//
// Source of truth: gatekeeper/src/types/ehr-pages.ts (frontend page contract block).
// This file mirrors that one. Update both together when the contract evolves.
//
// Contract conventions:
// - Item IDs are backend root table `id` values, never `fhir_resource_id`.
// - CodeableConcept display resolution: enrichment display → text → coding[0].display → omit.
// - Reference display resolution: resolved target row display (when in scope) → ehr_references.fhir_display → omit.
// - Choice-valued FHIR fields rendered as one display use: dateTime → period.start → age → range → string.
// - Singular fields sourced from 0..* arrays select the first non-empty reference display,
//   then the first non-empty CodeableConcept display. Additional values are dropped unless
//   the field type is an array.
// - "Omit field" means keep the response item without that field.
//   "Exclude item" means do not return the response item at all.

export type EhrPageName =
  | 'conditions'
  | 'medications'
  | 'encounters'
  | 'lab-reports'
  | 'procedures'
  | 'allergies'
  | 'immunizations';

export interface EhrLinkedItemTarget {
  page: EhrPageName;
  id: string;
}

export interface EhrLinkedItem {
  name: string;
  target?: EhrLinkedItemTarget;
}

export interface EhrCarePlanSummary {
  name: string;
  date?: string;
  team?: string[];
  addresses?: string[];
  goals?: string[];
  activities?: string[];
}

export interface EhrKeyBiomarkerSummary {
  name: string;
  value?: string;
  unit?: string;
  date?: string;
  interpretation?: string;
  lab_report?: EhrLinkedItem;
}

export interface EhrPeriodDisplay {
  start?: string;
  end?: string;
  display?: string;
}

export interface EhrNoteDisplay {
  text: string;
  time?: string;
  author?: string;
}

export interface EhrPageEnvelope<TData> {
  success: true;
  data: TData;
}

export interface EhrListPage<TItem> {
  items: TItem[];
}

export type EhrMedicationStatus = 'active' | 'completed' | 'stopped' | 'onhold';
export type EhrConditionStatus = 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
export type EhrEncounterStatus = 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished';
export type EhrEncounterClass = 'inpatient' | 'ed' | 'ambulatory' | 'virtual' | string;
export type EhrLabReportStatus = 'preliminary' | 'final' | 'amended' | 'corrected' | string;

export interface EhrMedicationDosage {
  /** FHIR: dosageInstruction[0].patientInstruction, fallback text. SQL: fhir_patient_instruction / fhir_text. */
  instruction?: string;
  /** FHIR: dosageInstruction[0].doseAndRate[0].doseQuantity. SQL: ehr_medication_request_dose_and_rates.fhir_dose_quantity_value/unit. */
  dose?: string;
  /** FHIR: dosageInstruction[0].timing. SQL: fhir_timing_jsonb. Render code first (BID/TID/QID -> twice/three/four times daily), else frequency x period, else omit timing. */
  timing?: string;
  /** FHIR: dosageInstruction[0].route. SQL: route_codeable_concept_id -> CodeableConcept/coding. */
  route?: string;
  /** FHIR: dosageInstruction[0].asNeededBoolean. SQL: fhir_as_needed_boolean. */
  as_needed?: boolean;
}

export interface EhrMedicationOrder {
  /** FHIR: MedicationRequest. SQL: ehr_medication_requests.id for this source order row. */
  id: string;
  /** FHIR: MedicationRequest.status. SQL: ehr_medication_requests.fhir_status for this order. */
  status?: EhrMedicationStatus;
  /** FHIR: MedicationRequest.authoredOn. SQL: ehr_medication_requests.fhir_authored_on for this order. */
  prescribed_on?: string;
  /** FHIR: MedicationRequest.reasonReference[], fallback reasonCode[]. SQL: order-local reason. */
  reason?: EhrLinkedItem;
  /** FHIR: MedicationRequest.dosageInstruction[0]. SQL: order-local dosage. */
  dosage?: EhrMedicationDosage;
  /** FHIR: MedicationRequest.note[]. SQL: ehr_medication_request_notes -> ehr_annotations for this source order. */
  notes?: EhrNoteDisplay[];
}

export interface EhrMedicationEnrichmentOverview {
  description?: string;
  benefits?: string;
}

export interface EhrMedicationEnrichmentHowToTake {
  instructions?: string;
  storage?: string;
}

export interface EhrMedicationEnrichmentSideEffects {
  common?: string[];
  note?: string;
}

export interface EhrMedicationEnrichmentMechanism {
  description?: string;
  drug_class?: string;
  therapeutic_class?: string;
  chemical_class?: string;
  action_class?: string;
}

export interface EhrMedicationEnrichmentInteraction {
  medication: string;
  severity?: string;
  effect?: string;
  note?: string;
}

export interface EhrMedicationEnrichmentSafety {
  alcohol?: string;
  pregnancy?: string;
  breastfeeding?: string;
  food?: string;
  driving?: string;
  kidney?: string;
  liver?: string;
  general?: string[];
  habit_forming?: boolean;
}

export interface EhrMedicationEnrichmentFaq {
  question: string;
  answers: string[];
}

export interface EhrMedicationEnrichment {
  overview?: EhrMedicationEnrichmentOverview;
  how_to_take?: EhrMedicationEnrichmentHowToTake;
  tips?: string[];
  side_effects?: EhrMedicationEnrichmentSideEffects;
  mechanism?: EhrMedicationEnrichmentMechanism;
  interactions?: EhrMedicationEnrichmentInteraction[];
  safety?: EhrMedicationEnrichmentSafety;
  faqs?: EhrMedicationEnrichmentFaq[];
}

export interface EhrMedicationPageItem {
  /**
   * FHIR: grouped MedicationRequest concept. SQL: canonical ehr_medication_requests.id.
   * Canonical row is selected by active-first, newest prescribed_on-first order.
   */
  id: string;
  /**
   * FHIR: MedicationRequest.medicationCodeableConcept.coding[] RxNorm;
   * fallback MedicationRequest.medicationReference -> Medication.code.coding[] RxNorm.
   * Resolution: RxNorm enrichment name, then explicit text/display from the
   * same medication source.
   */
  name: string;
  /** FHIR: MedicationRequest.status. SQL: grouped status; active wins, else canonical order status. Frontend wire convention normalizes on-hold -> onhold. */
  status?: EhrMedicationStatus;
  /** FHIR: MedicationRequest.authoredOn. SQL: earliest parseable authored date across grouped orders. */
  prescribed_on?: string;
  /** FHIR: MedicationRequest.authoredOn. SQL: latest parseable authored date across grouped orders. Present when orders is present. */
  last_prescribed_on?: string;
  /**
   * FHIR: grouped MedicationRequest rows for the same medication concept/display.
   * SQL: source ehr_medication_requests rows grouped by concept key, deduped by
   * prescribed_on/status/dosage. Omitted when there is only one distinct order.
   */
  orders?: EhrMedicationOrder[];
  /** FHIR: MedicationRequest.reasonReference[], fallback reasonCode[]. SQL: canonical order reason only; per-order reasons are preserved in orders[]. */
  reason?: EhrLinkedItem;
  /** FHIR: MedicationRequest.dosageInstruction[0]. SQL: canonical order dosage only; per-order dosages are preserved in orders[]. */
  dosage?: EhrMedicationDosage;
  /** FHIR: MedicationRequest.note[]. SQL: notes merged from grouped MedicationRequest orders, deduped by text/time/author. */
  notes?: EhrNoteDisplay[];
  /** FHIR: no reliable direct MedicationRequest field. SQL: populate only from explicit medication enrichment, never manufacturer. */
  brand?: string;
  /** FHIR: RxNorm code enrichment only. */
  composition?: string[];
  /** FHIR: not present. SQL: OneMG exact-name lookup against the rendered medication name. */
  enrichment?: EhrMedicationEnrichment;
}

export type EhrMedicationPageResponse =
  EhrPageEnvelope<EhrListPage<EhrMedicationPageItem>>;

export interface EhrConditionOccurrence {
  /** FHIR: Condition. SQL: ehr_conditions.id for this source occurrence row. Used for occurrence/history identity, not as the condition group id. */
  id: string;
  /** FHIR: Condition.clinicalStatus. SQL: ehr_conditions.fhir_clinical_status_code for this occurrence. */
  status?: EhrConditionStatus;
  /** FHIR: Condition.severity. SQL: ehr_conditions.severity_codeable_concept_id for this occurrence. */
  severity?: 'mild' | 'moderate' | 'severe' | string;
  /** FHIR: Condition.onset[x]. SQL: ehr_conditions.fhir_onset_* columns for this occurrence. */
  since?: string;
  /** FHIR: onset + abatement. SQL: occurrence-level onset/abatement period fields. */
  period?: EhrPeriodDisplay;
}

export interface EhrConditionPageItem {
  /**
   * FHIR: grouped Condition concept. SQL: canonical ehr_conditions.id.
   * Canonical row is selected by active-first, newest-first order within the group.
   */
  id: string;
  /**
   * FHIR: Condition.code. SQL: ehr_conditions.code_codeable_concept_id -> CodeableConcept/coding.
   * Resolution: scan all Condition.code codings for supported SNOMED/ICD-10-CM codes and prefer the matched enrichment name; fallback to code.text, then first coding display.
   * Never web-search. If missing, omit item and Slack.
   */
  name: string;
  /** FHIR: Condition.clinicalStatus. SQL: grouped status; active/recurrence/relapse/remission/inactive/resolved priority wins, else latest occurrence. */
  status?: EhrConditionStatus;
  /**
   * FHIR: Condition.severity. SQL: ehr_conditions.severity_codeable_concept_id -> CodeableConcept/coding.
   * Resolution: SNOMED 24484000 -> severe, 6736007 -> moderate,
   * 255604002 -> mild. Grouped severity uses max recognized severity
   * severe > moderate > mild; if all are unmapped strings, latest occurrence wins.
   */
  severity?: 'mild' | 'moderate' | 'severe' | string;
  /** FHIR: Condition.onset[x]. SQL: earliest parseable onset across grouped occurrences. Follows choice-valued display order for single occurrence. */
  since?: string;
  /** FHIR: Condition.onset[x]. SQL: latest parseable onset across grouped occurrences. Present when occurrences is present. */
  last_seen?: string;
  /** FHIR: onset + abatement. SQL: start from onsetPeriod.start/onsetDateTime; end from abatementPeriod.end/abatementDateTime. For multi-occurrence grouped conditions, backend omits this and uses since/last_seen. */
  period?: EhrPeriodDisplay;
  /**
   * FHIR: grouped Condition rows for the same concept/display.
   * SQL: source ehr_conditions rows grouped by concept key, deduped by date/status.
   * Omitted when there is only one distinct occurrence. When present, the
   * first occurrence is the canonical latest/active source row; top-level
   * status, severity, since, and last_seen are aggregated across occurrences.
   */
  occurrences?: EhrConditionOccurrence[];
  /** FHIR: inverse MedicationRequest.reasonReference/reasonCode. SQL: merged across grouped occurrences; reference match by resolved condition row id; code match by equal coding system+code; dedupe by medication id. */
  medications_or_treatments?: EhrLinkedItem[];
  /** FHIR: inverse CarePlan.addresses[]. SQL: merged across grouped occurrences; ehr_care_plan_addresses -> ehr_references resolved to this condition. */
  care_plans?: EhrCarePlanSummary[];
  /** FHIR: not direct. SQL: no FHIR table path; populate only from explicit condition enrichment for the same resolved condition code. */
  monitoring_or_followup?: string[];
  /** FHIR: Condition.evidence[].detail plus enrichment-listed biomarkers. SQL: ehr_observations / ehr_diagnostic_reports; direct evidence first, then enrichment, dedupe by Observation.id. */
  key_biomarkers?: EhrKeyBiomarkerSummary[];
  /** FHIR: no standard Condition.complication field. SQL: no current FHIR table path; populate only from explicit enrichment or a defined relationship source. */
  complications?: string[];
  /** FHIR: Condition.note[]. SQL: merged across grouped occurrences; ehr_condition_notes -> ehr_annotations. */
  notes?: EhrNoteDisplay[];
}

export type EhrConditionPageResponse =
  EhrPageEnvelope<EhrListPage<EhrConditionPageItem>>;

export interface EhrEncounterPageItem {
  id: string;
  name: string;
  period?: EhrPeriodDisplay;
  length?: string;
  status?: EhrEncounterStatus;
  class?: EhrEncounterClass;
  type?: string;
  hospitalization?: {
    duration?: string;
  };
  reason_for_visit?: string;
  diagnoses?: Array<{
    name: string;
    rank?: number;
    target?: EhrLinkedItemTarget;
  }>;
  participants?: string[];
  vitals?: {
    bp?: string;
    hr?: string;
    temp?: string;
    weight?: string;
    spo2?: string;
  };
  procedures?: EhrLinkedItem[];
  lab_reports?: EhrLinkedItem[];
  immunizations?: Array<EhrLinkedItem & {
    date?: string;
  }>;
  medications?: Array<EhrLinkedItem & {
    dosage?: string;
    reason?: string;
  }>;
  locations?: string[];
  notes?: EhrNoteDisplay[];
}

export type EhrEncounterPageResponse =
  EhrPageEnvelope<EhrListPage<EhrEncounterPageItem>>;

export interface EhrLabReportPageItem {
  id: string;
  name: string;
  date?: string;
  status?: EhrLabReportStatus;
  conclusion?: string;
  observations?: Array<{
    name: string;
    value?: string;
    unit?: string;
    reference_range?: string;
    interpretation?: string;
    notes?: string;
    loinc_code?: string;
    /** Enrichment: Observation LOINC code -> biomarker_mapping_data.panel -> biomarker_panels. Body-system / panel grouping (e.g. liver, kidney, heart). A biomarker may belong to multiple panels. */
    panels?: Array<{
      name: string;
      description?: string;
    }>;
    description?: string;
    clinical_note?: string;
    out_of_range?: boolean;
    out_of_range_display?: string;
  }>;
  encounter?: EhrLinkedItem;
}

export type EhrLabReportPageResponse =
  EhrPageEnvelope<EhrListPage<EhrLabReportPageItem>>;

export interface EhrProcedureOccurrence {
  /** FHIR: Procedure. SQL: ehr_procedures.id for this source procedure row. */
  id: string;
  /** FHIR: Procedure.performed[x]. SQL: occurrence-local ehr_procedures.fhir_performed_* columns. */
  date?: string;
  /** FHIR: Procedure.performedPeriod. SQL: occurrence-local ehr_procedures.fhir_performed_period_start/end. */
  period?: EhrPeriodDisplay;
  /** FHIR: Procedure.status. SQL: occurrence-local ehr_procedures.fhir_status. */
  status?: string;
  /** FHIR: Procedure.reasonCode[] / reasonReference[]. SQL: occurrence-local reason. */
  reason?: string;
  /** FHIR: Procedure.outcome. SQL: occurrence-local outcome CodeableConcept. */
  outcome?: string;
  /** FHIR: Procedure.followUp[]. SQL: occurrence-local followUp CodeableConcept rows. */
  followup?: string[];
  /** FHIR: Procedure.complication[] / complicationDetail[]. SQL: occurrence-local complication rows. */
  complications?: string[];
  /** FHIR: Procedure.bodySite[]. SQL: occurrence-local bodySite CodeableConcept rows. */
  body_sites?: string[];
  /** FHIR: Procedure.performer[].actor/function. SQL: occurrence-local performer rows. */
  performers?: string[];
  /** FHIR: Procedure.report[]. SQL: occurrence-local DiagnosticReport references. */
  reports?: EhrLinkedItem[];
  /** FHIR: Procedure.note[]. SQL: occurrence-local Annotation rows. */
  notes?: EhrNoteDisplay[];
  /** FHIR: Procedure.basedOn[]. SQL: occurrence-local CarePlan/ServiceRequest references. */
  based_on?: Array<EhrCarePlanBasedOn | EhrServiceRequestBasedOn>;
}

export interface EhrProcedurePageItem {
  /**
   * FHIR: grouped Procedure concept. SQL: canonical ehr_procedures.id.
   * Canonical row is selected by newest performed date order within the group.
   */
  id: string;
  name: string;
  /** FHIR: Procedure.performed[x]. SQL: earliest parseable performed date across grouped occurrences. */
  date?: string;
  /** FHIR: Procedure.performed[x]. SQL: latest parseable performed date across grouped occurrences. Present when occurrences is present. */
  last_performed_on?: string;
  /** FHIR: Procedure.performedPeriod. For multi-occurrence grouped procedures, backend omits this and uses date/last_performed_on. */
  period?: EhrPeriodDisplay;
  status?: string;
  /**
   * FHIR: grouped Procedure rows for the same procedure concept/display.
   * SQL: source ehr_procedures rows grouped by concept key, deduped by
   * performed date/status. Omitted when there is only one distinct occurrence.
   */
  occurrences?: EhrProcedureOccurrence[];
  /** FHIR: Procedure.reasonCode[] / reasonReference[]. Canonical occurrence reason; per-occurrence reasons live in occurrences[]. */
  reason?: string;
  outcome?: string;
  followup?: string[];
  complications?: string[];
  body_sites?: string[];
  performers?: string[];
  reports?: EhrLinkedItem[];
  notes?: EhrNoteDisplay[];
  based_on?: Array<EhrCarePlanBasedOn | EhrServiceRequestBasedOn>;
}

export interface EhrCarePlanBasedOn extends EhrCarePlanSummary {
  type: 'care_plan';
}

export interface EhrServiceRequestBasedOn {
  type: 'service_request';
  reason?: string;
  notes?: string[];
  patient_instructions?: string[];
}

export type EhrProcedurePageResponse =
  EhrPageEnvelope<EhrListPage<EhrProcedurePageItem>>;

export interface EhrAllergyPageItem {
  id: string;
  name: string;
  status?: string;
  criticality?: string;
  reactions?: string[];
  type?: 'allergy' | 'intolerance' | string;
  categories?: string[];
  last_occurrence?: string;
  onset_or_recorded?: string;
  notes?: EhrNoteDisplay[];
}

export type EhrAllergyPageResponse =
  EhrPageEnvelope<EhrListPage<EhrAllergyPageItem>>;

export interface EhrImmunizationPageItem {
  id: string;
  name: string;
  date?: string;
  status?: string;
  vaccine_series?: Array<{
    name?: string;
    target_diseases?: string[];
    dose_number?: string;
  }>;
  reason?: string;
  reactions?: string[];
  performers?: string[];
  location?: string;
  site?: string;
  route?: string;
  dose?: string;
  manufacturer?: string;
  education?: string[];
  notes?: EhrNoteDisplay[];
}

export type EhrImmunizationPageResponse =
  EhrPageEnvelope<EhrListPage<EhrImmunizationPageItem>>;

// Provider types
export interface EhrProvider {
  id: string;
  name: string;
  platformType: string;
  status: string;
}

// Person types
export interface PersonInfo {
  person_id: string;
  name: string | null;
  relationship: string;
  age: string | null;
  sex: string | null;
  color: string;
  icon: string;
}

export const RELATION_PRESETS = [
  { label: 'Father', value: 'father' },
  { label: 'Mother', value: 'mother' },
  { label: 'Son', value: 'son' },
  { label: 'Daughter', value: 'daughter' },
  { label: 'Spouse', value: 'spouse' },
  { label: 'Other', value: 'other' },
] as const;

export type RelationPreset = typeof RELATION_PRESETS[number]['value'];

// Bootstrap response
export interface FastenBootstrap {
  customerPublicId: string;
  externalId: string;
  externalState: string;
  apiMode: string;
  personId: string;
}

// Status response
export interface FastenStatusItem {
  person_id: string;
  org_connection_id: string;
  connection_status: string;
  worker_status: 'waiting' | 'queued' | 'claimed' | 'downloading' | 'parsing' | 'in_progress' | 'complete' | 'partial_failed' | 'failed';
  expected_file_count: number;
  downloaded_file_count: number;
  parsed_file_count: number;
  failed_file_count: number;
  failure_stage: string | null;
  failure_code: string | null;
  failure_detail: string | null;
  last_updated_at: string;
}

export interface FastenStatusResponse {
  success: boolean;
  data: {
    request_id: string;
    statuses: FastenStatusItem[];
  };
}

// Connection event from Fasten widget
export interface FastenConnectionEvent {
  type: string;
  external_id: string;
  external_state: string;
  org_connection_id?: string;
  brand_name?: string;
  person_id?: string;
}
