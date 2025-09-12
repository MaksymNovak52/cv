import { CANDIDATA_FORM_DATA } from "@/constants";
import { FormErrors } from "@/type";

export const useUrlValidation = () => {
  const validateUrls = (linkedinUrl: string): FormErrors => {
    const errs: FormErrors = {};

    if (linkedinUrl && !CANDIDATA_FORM_DATA.URL_REGEX.test(linkedinUrl)) {
      errs.linkedin = "Invalid LinkedIn URL";
    }

    return errs;
  };

  return { validateUrls };
};
