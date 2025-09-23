"use client";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignInContainer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({ email: emailErr, password: passErr });
    return !emailErr && !passErr;
  };

  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (touched.email) {
      setErrors((e) => ({ ...e, email: validateEmail(v) }));
    }
  };

  const handlePasswordChange = (v: string) => {
    setPassword(v);
    if (touched.password) {
      setErrors((e) => ({ ...e, password: validatePassword(v) }));
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setTouched({ email: true, password: true });

    if (!validateForm()) return;

    setErrorMsg("");
    setIsSubmitting(true);

    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMsg(error.message || "Sign-in failed");
      setIsSubmitting(false);
      return;
    }

    document.cookie = `sb-access-token=${data?.session?.access_token}; path=/; secure; samesite=Lax`;

    setIsSubmitting(false);
    router.push("/dashboard");
  };

  const canSubmit =
    !!email && !!password && !errors.email && !errors.password && !isSubmitting;

  return (
    <div
      className="h-screen leading-[-0.14px]"
      style={{ backgroundImage: "url('/signInLogo.png')" }}
    >
      <Image
        src="/singInUpLogo.png"
        alt="logo"
        width={200}
        height={60}
        className="top-[5%] left-1/2 translate-x-[-50%] translate-y-[-50%] absolute"
      />

      <form
        onSubmit={onSubmit}
        className="flex flex-col w-[377px] sm:w-[400px] lg:w-[464px] h-[430px] mx-auto p-6  bg-white shadow-lg rounded-xl absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] py-[65px]"
        noValidate
      >
        <div className="w-[330px] mx-auto">
          <div className=" flex items-center justify-center relative pb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              className="absolute -top-2 right-[125px]"
            >
              <path opacity="0.2" d="M-2.38419e-07 1H16V17" stroke="black" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              className="absolute -top-2 left-[125px]"
            >
              <path
                opacity="0.2"
                d="M17 1H5C2.79086 1 1 2.79086 1 5V17"
                stroke="black"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              className="absolute bottom-1 left-[125px]"
            >
              <path opacity="0.2" d="M17 16H1V-2.38419e-07" stroke="black" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              className="absolute bottom-1 right-[125px]"
            >
              <path
                opacity="0.2"
                d="M-2.38419e-07 16H12C14.2091 16 16 14.2091 16 12V-2.38419e-07"
                stroke="black"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
            >
              <circle cx="28" cy="28" r="28" fill="#E4D9CB" />
              <path
                d="M23.2562 18.5745C25.3058 20.6223 26.3456 21.6624 26.3756 21.6949C26.4122 21.7338 26.4324 21.7853 26.4321 21.8388C26.4355 22.5322 26.4364 24.0462 26.4347 26.3808C26.4347 26.3936 26.4287 26.4064 26.4167 26.4193C26.4098 26.4261 26.4 26.4296 26.3872 26.4296C24.0516 26.4321 22.537 26.4321 21.8436 26.4296C21.7904 26.4292 21.7394 26.4085 21.701 26.3718C21.6685 26.3418 20.6278 25.3029 18.579 23.2552C16.5294 21.2074 15.4896 20.1672 15.4597 20.1347C15.4229 20.0963 15.4022 20.0453 15.4019 19.9922C15.3984 19.2987 15.3976 17.7843 15.3993 15.4489C15.3993 15.436 15.4057 15.4232 15.4186 15.4104C15.4254 15.4044 15.4353 15.4009 15.4481 15.4001C17.7837 15.3975 19.2978 15.3979 19.9904 15.4014C20.0438 15.401 20.0953 15.4213 20.1342 15.4579C20.1668 15.4878 21.2074 16.5267 23.2562 18.5745Z"
                fill="#242537"
              />
              <path
                d="M32.725 18.5678C34.7815 16.5235 35.826 15.4863 35.8585 15.4563C35.8972 15.4193 35.9488 15.3986 36.0024 15.3986C36.6967 15.3977 38.2125 15.4016 40.5498 15.4101C40.5627 15.411 40.5755 15.4174 40.5884 15.4294C40.5943 15.4362 40.5973 15.4461 40.5973 15.4589C40.5931 17.796 40.5884 19.3118 40.5832 20.006C40.5832 20.0596 40.5625 20.1112 40.5254 20.1499C40.4955 20.1815 39.4522 21.2196 37.3958 23.2639C35.3393 25.3083 34.2952 26.3458 34.2635 26.3767C34.2246 26.4133 34.1731 26.4335 34.1197 26.4332C33.4254 26.434 31.9095 26.4302 29.5722 26.4216C29.5594 26.4216 29.5466 26.4152 29.5337 26.4023C29.5269 26.3963 29.5234 26.3865 29.5234 26.3728C29.5277 24.0357 29.5324 22.52 29.5376 21.8257C29.5379 21.7725 29.5586 21.7215 29.5954 21.6831C29.6262 21.6506 30.6694 20.6122 32.725 18.5678Z"
                fill="#242537"
              />
              <path
                d="M23.2696 37.3912C21.2242 39.4493 20.1853 40.4933 20.1528 40.5233C20.1144 40.56 20.0634 40.5807 20.0102 40.581C19.315 40.5862 17.7983 40.5913 15.4602 40.5965C15.4465 40.5965 15.4336 40.59 15.4217 40.5772C15.4148 40.5712 15.4114 40.5614 15.4114 40.5477C15.402 38.2097 15.3977 36.6935 15.3985 35.9992C15.3986 35.9456 15.4193 35.8941 15.4563 35.8554C15.4863 35.8229 16.524 34.7776 18.5693 32.7196C20.6147 30.6624 21.6536 29.6188 21.6861 29.5888C21.7245 29.5521 21.7755 29.5314 21.8287 29.531C22.5239 29.525 24.0405 29.5199 26.3787 29.5156C26.3924 29.5156 26.4052 29.522 26.4172 29.5349C26.4241 29.5409 26.4275 29.5507 26.4275 29.5644C26.4369 31.9024 26.4408 33.4186 26.4391 34.1128C26.4394 34.1663 26.4192 34.2178 26.3826 34.2567C26.3526 34.2892 25.3149 35.3341 23.2696 37.3912Z"
                fill="#242537"
              />
              <path
                d="M37.4078 32.7076C39.4608 34.7614 40.5028 35.8045 40.5336 35.8371C40.5701 35.8759 40.5903 35.9274 40.5901 35.9809C40.5935 36.676 40.5935 38.1943 40.5901 40.5357C40.5901 40.5486 40.5871 40.558 40.5811 40.564C40.5683 40.5768 40.555 40.5832 40.5413 40.5832C38.2006 40.585 36.6826 40.5841 35.9874 40.5807C35.9337 40.5805 35.8822 40.5599 35.8436 40.5229C35.8111 40.4929 34.7683 39.4506 32.7152 37.396C30.6622 35.3422 29.6207 34.2991 29.5907 34.2666C29.5537 34.2279 29.533 34.1764 29.5329 34.1227C29.5303 33.4276 29.5308 31.9097 29.5342 29.5692C29.5342 29.5555 29.5372 29.5456 29.5432 29.5396C29.556 29.5268 29.5689 29.5204 29.5817 29.5204C31.9233 29.5187 33.4417 29.5195 34.1369 29.523C34.1906 29.5231 34.2421 29.5438 34.2807 29.5807C34.3124 29.6107 35.3547 30.653 37.4078 32.7076Z"
                fill="#242537"
              />
            </svg>
          </div>

          <h2 className="text-[12px] font-semibold text-center text-[#211C1A] leading-[-0.12px] w-[186px] mx-auto mt-[17px]">
            Enter the information we have provided to you to continue
          </h2>

          <div className="flex flex-col gap-2">
            <div>
              <div className="flex flex-row items-center justify-between w-full">
                <p className="text-[#BCBBBA] text-[10px] font-bold">[01]</p>
                {errors.email && touched.email && (
                  <p className="text-[10px] font-bold uppercase text-[#FF3636] mr-1">
                    Enter a valid email
                  </p>
                )}
              </div>
              <input
                type="email"
                placeholder="E-mail*"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => {
                  setTouched((t) => ({ ...t, email: true }));
                  setErrors((e) => ({ ...e, email: validateEmail(email) }));
                }}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                autoComplete="email"
                className={`w-full border rounded-md placeholder-[#4D4D4D] font-bold focus:placeholder-[#4D4D4D]/50 font-fold px-3 py-2 outline-none text-[16px] lg:text-[12px]  text-[#4D4D4D]
                  ${errors.email ? "border-[#FF3636] " : "border-[#CCCCCC]  "}`}
              />
            </div>
            <div>
              <div className="flex flex-row items-center justify-between w-full">
                <p className="text-[#BCBBBA] text-[10px] font-bold">[02]</p>
                {errors.password && touched.password && (
                  <p className="text-[10px] font-bold uppercase text-[#FF3636] mr-1">
                    Enter a valid password
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password*"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, password: true }));
                    setErrors((e) => ({
                      ...e,
                      password: validatePassword(password),
                    }));
                  }}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  autoComplete="current-password"
                  minLength={6}
                  className={`w-full border rounded-md placeholder-[#4D4D4D] font-bold focus:placeholder-[#4D4D4D]/50 font-fold px-3 py-2 pr-10 outline-none text-[16px] lg:text-[12px] text-[#0a0a0a]
        ${errors.password ? "border-[#FF3636]" : "border-[#CCCCCC]"}`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded "
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M3 3l18 18"
                        stroke="#4D4D4D"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17.94 17.94C16.17 19.23 14.18 20 12 20 5 20 1 12 1 12a18.6 18.6 0 0 1 5.06-5.94"
                        stroke="#4D4D4D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.87"
                        stroke="#4D4D4D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12s-1.64-2.94-4.53-4.94"
                        stroke="#4D4D4D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
                        stroke="#4D4D4D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="#4D4D4D"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="bg-[#242537] text-white rounded-lg px-4 py-2 disabled:opacity-50 text-[14px] leading-[-0.14px] mt-[14px]"
              style={{ backdropFilter: "blur(20px)" }}
            >
              {isSubmitting ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
        {errorMsg && (
          <div className="flex items-center justify-center w-[330px]  pt-[17px] mx-auto">
            <p className="text-[10px] font-bold uppercase text-[#FF3636]  text-center ">
              You’re trying to log in with credentials that are no longer valid.
              Please contact your manager to get current access.
            </p>
          </div>
        )}
      </form>

      <p className="bottom-[0%]  sm:bottom-[5%] left-1/2 translate-x-[-50%] translate-y-[-50%] absolute text-white/50 text-[10px] leading-[-0.1px] font-bold max-w-[350px] text-center">
        Unlisted talenе. Confidential roles.
        <br />
        We operate off-grid — sourcing minds too sharp for the spotlight
      </p>
    </div>
  );
}
