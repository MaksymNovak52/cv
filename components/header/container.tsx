"use client";
import { useUser } from "@/provider";
import { useCountsByOrganization, useOrganization } from "@/queries/candidates";
import Cookies from "js-cookie";
import { LogOutIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeaderContainer({
  setIsAddModalOpen,
}: {
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { isAdmin, organization, logoUrl } = useUser();
  const orgFromCookie = Cookies.get("organizationId");
  const { data } = useCountsByOrganization(orgFromCookie as string);
  const { data: org, refetch } = useOrganization(orgFromCookie as string);

  const handleChangeOrganization = () => {
    Cookies.remove("organizationId");
    router.push("/select-organization");
  };

  const handleLogout = () => {
    Cookies.remove("sb-access-token");
    Cookies.remove("organizationId");
    router.push("/sign-in");
  };

  return (
    <header className="py-[20px] px-[15px] lg:px-[32px] " style={{}}>
      <div className="max-w-[1416px] flex justify-between mx-auto">
        {!data || !organization ? (
          <>
            <section className="flex flex-row gap-2 lg:gap-3 items-center">
              <div className="min-w-[40px] min-h-[45px] flex items-center justify-center">
                <div className="animate-pulse w-[80px] h-[30px] bg-neutral-200 dark:bg-neutral-300 rounded-md" />
              </div>

              <div className="animate-pulse w-[2px] h-[40px] bg-neutral-200 dark:bg-neutral-300" />

              <div className="flex flex-col gap-2">
                <div className="animate-pulse w-[140px] h-[16px] bg-neutral-200 dark:bg-neutral-300 rounded-md" />
                <div className="flex flex-row gap-2">
                  <div className="animate-pulse w-[80px] h-[12px] bg-neutral-200 dark:bg-neutral-300 rounded-md" />
                  <div className="animate-pulse w-[40px] h-[12px] bg-neutral-200 dark:bg-neutral-300 rounded-md" />
                  <div className="animate-pulse w-[60px] h-[12px] bg-neutral-200 dark:bg-neutral-300 rounded-md" />
                </div>
              </div>
            </section>

            <section className=" flex-row gap-[6px] hidden lg:flex">
              <div className="animate-pulse w-[146px] h-[40px] bg-neutral-200 dark:bg-neutral-300 rounded-md" />
              <div className="animate-pulse w-[40px] h-[40px] bg-neutral-200 dark:bg-neutral-300 rounded-md" />
            </section>
          </>
        ) : (
          <>
            {" "}
            <section className="flex flex-row gap-2 lg:gap-3 items-center">
              <div className=" flex items-center justify-center">
                <img
                  src={"./logo.png"}
                  alt="logo"
                  className="w-[40px] lg:w-[45px] max-w-[45px] max-h-[45px]   object-contain"
                />
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="2"
                height="40"
                viewBox="0 0 2 40"
                fill="none"
              >
                <path opacity="0.1" d="M1 0L1 40" stroke="black" />
              </svg>
              <div className="flex flex-row gap-4">
                {org?.logo_url && (
                  <div className="  lg:min-w-[40px] lg:min-h-[45px]  flex items-center justify-center">
                    <img
                      src={org?.logo_url || ""}
                      alt="logo"
                      className="max-w-[40px] lg:max-w-[120px] max-h-[45px] w-auto h-auto object-contain"
                    />
                  </div>
                )}
                <div className="flex flex-col items-start gap">
                  <div className="flex flex-row gap-2">
                    <h3 className="text-[#211C1A] text-[14px] lg:text-base font-bold">
                      {organization}
                    </h3>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          handleChangeOrganization();
                        }}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                  <div className="flex flex-row  items-center gap-2 text-[#857F78] text-[10px] font-bold uppercase">
                    <p>{data?.total_candidates} new candidates</p>
                    <p>/</p>
                    <p className="block lg:hidden">
                      {data?.total_jobs} position
                    </p>
                    <p className="hidden lg:block">
                      {data?.total_jobs} position open
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="flex flex-row gap-[6px] mt-2 lg:mt-0">
              {isAdmin && (
                <>
                  <span
                    className=" hidden lg:flex w-[146px] cursor-pointer h-[40px] rounded-[4px]  blur-[ 20px] text-[14px] font-semibold leading-[-0.14px] text-[#211C1A]  items-center justify-center"
                    style={{
                      background: "rgba(0, 0, 0, 0.04)",
                    }}
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    [ <Plus size={18} color="#000000" /> ] Add Candidate
                  </span>

                  <span
                    className=" flex lg:hidden cursor-pointer h-[32px] sm:h-[40px] sm:px-[20px] px-[12px] py-[10px] rounded-[4px]  blur-[ 20px] text-[14px] font-semibold leading-[-0.14px] text-[#211C1A]  items-center justify-center"
                    style={{
                      background: "rgba(0, 0, 0, 0.04)",
                    }}
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    [ <Plus size={18} color="#000000" /> ]
                  </span>
                </>
              )}

              <span
                className=" flex px-4 cursor-pointer h-[32px] lg:h-[40px] rounded-[4px]  blur-[ 20px] text-[14px] font-semibold leading-[-0.14px] text-[#211C1A]  items-center justify-center"
                style={{
                  background: "rgba(0, 0, 0, 0.04)",
                }}
                onClick={() => handleLogout()}
              >
                <LogOutIcon />
              </span>
            </section>
          </>
        )}
      </div>
    </header>
  );
}
