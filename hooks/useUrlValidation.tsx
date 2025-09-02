import { CANDIDATA_FORM_DATA } from "@/constants";
import { FormErrors } from "@/type";

export const useUrlValidation = () => {
  const validateUrls = (
    portfolioUrl: string,
    linkedinUrl: string
  ): FormErrors => {
    const errs: FormErrors = {};

    if (portfolioUrl && !CANDIDATA_FORM_DATA.URL_REGEX.test(portfolioUrl)) {
      errs.portfolio = "Invalid Portfolio URL";
    }
    if (linkedinUrl && !CANDIDATA_FORM_DATA.URL_REGEX.test(linkedinUrl)) {
      errs.linkedin = "Invalid LinkedIn URL";
    }

    return errs;
  };

  return { validateUrls };
};
