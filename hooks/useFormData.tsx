"use client";
import { CANDIDATA_FORM_DATA } from "@/constants";
import { CandidateFormData, FormErrors, JobFormData } from "@/type";
import { useState } from "react";

export const useFormData = () => {
  const [jobData, setJobData] = useState<JobFormData>({
    title: "",
    description: "",
    selectedJobId: null,
  });

  const [candidateData, setCandidateData] = useState<CandidateFormData>({
    name: "",
    title: "",
    location: "",
    experience: "",
    deployment: "",
    highlights: "",
    englishLevel: CANDIDATA_FORM_DATA.DEFAULT_ENGLISH_LEVEL,
    salary: null,
    portfolioUrl: "",
    linkedinUrl: "",
    skills: "",
    opinion: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const updateJobData = (updates: Partial<JobFormData>) => {
    setJobData((prev) => ({ ...prev, ...updates }));
  };

  const updateCandidateData = (updates: Partial<CandidateFormData>) => {
    setCandidateData((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setJobData({
      title: "",
      description: "",
      selectedJobId: null,
    });
    setCandidateData({
      name: "",
      title: "",
      location: "",
      experience: null,
      deployment: "",
      englishLevel: CANDIDATA_FORM_DATA.DEFAULT_ENGLISH_LEVEL,
      salary: null,
      portfolioUrl: "",
      linkedinUrl: "",
      highlights: "",
      skills: "",
      opinion: "",
    });
    setErrors({});
  };

  return {
    jobData,
    candidateData,
    errors,
    updateJobData,
    updateCandidateData,
    setErrors,
    resetForm,
  };
};
