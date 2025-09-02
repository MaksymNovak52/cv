const CANDIDATA_FORM_DATA = {
  ORGANIZATION_ID: "11111111-1111-1111-1111-111111111111",
  DEFAULT_ENGLISH_LEVEL: "B1",
  STEPS: {
    JOB_SELECTION: 1,
    CANDIDATE_INFO: 2,
    RM_OPINION: 3,
  },
  ENGLISH_LEVELS: ["A1", "A2", "B1", "B2", "C1", "C2"],
  URL_REGEX: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/,
} as const;
export { CANDIDATA_FORM_DATA };
