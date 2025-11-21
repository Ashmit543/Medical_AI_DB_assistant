export type Role = "patient" | "doctor" | "admin";

export type PatientRecord = {
  id: string;
  display_id: string;
  name: string;
  demographics: string;
  updated_at: string;
  alerts: string[];
  medications: { name: string; dosage: string }[];
  summaries: { type: "patient" | "doctor" | "labs"; content: string }[];
  labs: Array<{
    report_id: string;
    title: string;
    collected_at: string;
    abnormal_markers: string[];
    summary: string;
  }>;
};

