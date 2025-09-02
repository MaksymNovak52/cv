"use client";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignInContainer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const router = useRouter();

  const validateForm = () => {
    let valid = true;
    let newErrors = { email: "", password: "" };

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email";
      valid = false;
    }

    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setErrorMsg("");
    setIsSubmitting(true);

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      document.cookie = `sb-access-token=${data?.session?.access_token}; path=/; secure; SameSite=Strict`;

      router.push("/dashboard");
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className="h-screen leading-[-0.14px]"
      style={{ backgroundImage: "url('/signInLogo.png')" }}
    >
      <Image
        src="/singInUpLogo.png"
        alt="logo"
        width={186}
        height={32}
        className="top-[5%] left-1/2 translate-x-[-50%] translate-y-[-50%] absolute"
      />
      <form
        onSubmit={onSubmit}
        className="flex flex-col w-[464px] h-[430px] mx-auto p-6 bg-white shadow-lg rounded-xl absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] py-[65px]"
      >
        <div className="w-[330px] mx-auto">
          <div className=" flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
            >
              <circle cx="28" cy="28" r="28" fill="#E4D9CB" />
              <path
                d="M23.2577 18.5774C25.3073 20.6252 26.3471 21.6654 26.3771 21.6979C26.4137 21.7368 26.4339 21.7883 26.4336 21.8417C26.437 22.5352 26.4378 24.0492 26.4361 26.3837C26.4361 26.3966 26.4301 26.4094 26.4182 26.4222C26.4113 26.4291 26.4015 26.4325 26.3886 26.4325C24.053 26.4351 22.5385 26.4351 21.845 26.4325C21.7919 26.4322 21.7409 26.4115 21.7025 26.3747C21.6699 26.3448 20.6293 25.3059 18.5805 23.2581C16.5309 21.2104 15.4911 20.1702 15.4611 20.1377C15.4244 20.0993 15.4037 20.0483 15.4033 19.9951C15.3999 19.3017 15.399 17.7873 15.4008 15.4518C15.4008 15.439 15.4072 15.4262 15.42 15.4133C15.4269 15.4073 15.4367 15.4039 15.4496 15.403C17.7851 15.4005 19.2992 15.4009 19.9919 15.4043C20.0453 15.404 20.0968 15.4242 20.1357 15.4608C20.1682 15.4908 21.2089 16.5297 23.2577 18.5774Z"
                fill="#242537"
              />
              <path
                d="M32.7275 18.5693C34.7839 16.5249 35.8284 15.4878 35.861 15.4578C35.8997 15.4207 35.9512 15.4 36.0048 15.4C36.6992 15.3992 38.215 15.403 40.5523 15.4116C40.5651 15.4124 40.578 15.4189 40.5908 15.4308C40.5968 15.4377 40.5998 15.4475 40.5998 15.4604C40.5955 17.7975 40.5908 19.3132 40.5857 20.0075C40.5856 20.0611 40.5649 20.1126 40.5279 20.1513C40.4979 20.183 39.4547 21.221 37.3982 23.2654C35.3417 25.3097 34.2976 26.3473 34.266 26.3781C34.2271 26.4147 34.1756 26.435 34.1221 26.4346C33.4278 26.4355 31.912 26.4316 29.5747 26.4231C29.5618 26.4231 29.549 26.4166 29.5362 26.4038C29.5293 26.3978 29.5259 26.388 29.5259 26.3743C29.5302 24.0371 29.5349 22.5214 29.54 21.8271C29.5404 21.774 29.561 21.723 29.5978 21.6846C29.6286 21.6521 30.6718 20.6136 32.7275 18.5693Z"
                fill="#242537"
              />
              <path
                d="M23.271 37.391C21.2257 39.449 20.1868 40.493 20.1542 40.523C20.1158 40.5598 20.0648 40.5804 20.0117 40.5808C19.3165 40.5859 17.7998 40.591 15.4617 40.5962C15.448 40.5962 15.4351 40.5898 15.4231 40.5769C15.4163 40.5709 15.4129 40.5611 15.4129 40.5474C15.4034 38.2094 15.3992 36.6933 15.4 35.999C15.4 35.9454 15.4207 35.8938 15.4578 35.8551C15.4878 35.8226 16.5254 34.7773 18.5708 32.7193C20.6161 30.6621 21.6551 29.6185 21.6876 29.5885C21.726 29.5518 21.777 29.5311 21.8301 29.5308C22.5253 29.5248 24.042 29.5196 26.3802 29.5154C26.3939 29.5154 26.4067 29.5218 26.4187 29.5346C26.4255 29.5406 26.429 29.5505 26.429 29.5641C26.4384 31.9021 26.4422 33.4183 26.4405 34.1126C26.4409 34.166 26.4206 34.2175 26.384 34.2564C26.3541 34.2889 25.3164 35.3338 23.271 37.391Z"
                fill="#242537"
              />
              <path
                d="M37.4068 32.7079C39.4599 34.7617 40.5018 35.8048 40.5326 35.8374C40.5691 35.8762 40.5893 35.9277 40.5891 35.9812C40.5926 36.6763 40.5926 38.1946 40.5891 40.536C40.5891 40.5489 40.5861 40.5583 40.5801 40.5643C40.5673 40.5771 40.554 40.5836 40.5403 40.5836C38.1996 40.5853 36.6817 40.5844 35.9865 40.581C35.9328 40.5809 35.8813 40.5602 35.8426 40.5232C35.8101 40.4932 34.7673 39.4509 32.7142 37.3963C30.6612 35.3426 29.6197 34.2994 29.5897 34.2669C29.5527 34.2282 29.5321 34.1767 29.5319 34.123C29.5294 33.4279 29.5298 31.91 29.5332 29.5695C29.5332 29.5558 29.5362 29.5459 29.5422 29.54C29.555 29.5271 29.5679 29.5207 29.5807 29.5207C31.9223 29.519 33.4407 29.5198 34.1359 29.5233C34.1896 29.5234 34.2411 29.5441 34.2797 29.581C34.3114 29.611 35.3538 30.6533 37.4068 32.7079Z"
                fill="#242537"
              />
            </svg>
          </div>
          <h2 className="text-[12px] font-semibold text-center text-[#211C1A] leading-[-0.12px] w-[186px] mx-auto mt-[17px] mb-[px]">
            Enter the information we have provided to you to continue
          </h2>

          <div className="flex flex-col gap-2">
            <div>
              <p className="text-[#BCBBBA] text-[10px] font-bold">[01]</p>

              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[rgba(0, 0, 0, 1)] rounded-md px-3 py-2 outline-none text-[12px] text-[#4D4D4D]"
              />
            </div>

            <div>
              <p className="text-[#BCBBBA] text-[10px] font-bold">[02]</p>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border  border-[rgba(0, 0, 0, 1)] rounded-md px-3 py-2 outline-none text-[12px] text-[#0a0a0a]"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#242537] text-white rounded-lg px-4 py-2 disabled:opacity-50 text-[14px] leading-[-0.14px] mt-[14px]"
              style={{
                backdropFilter: "blur(20px)",
              }}
            >
              {isSubmitting ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
