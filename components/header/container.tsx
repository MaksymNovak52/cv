"use client";
import { useCandidatesContext } from "@/provider";
import { useCounts } from "@/queries/candidates";
import { getCurrentUser } from "@/service/user";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
export function HeaderContainer({
  setIsAddModalOpen,
}: {
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { jobCount, candidateCount } = useCandidatesContext();
  const { data, isLoading } = useCounts();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    is_admin: boolean;
  } | null>(null);
  useEffect(() => {
    (async () => {
      const profile = await getCurrentUser();
      setCurrentUser(profile);
    })();
  }, []);
  return (
    <header className="py-[20px] px-[15px] lg:px-[32px] " style={{}}>
      <div className="max-w-[1416px] flex justify-between mx-auto">
        <section className="flex flex-row gap-2 lg:gap-3 items-center">
          <Image src="/logo.png" alt="logo" width={45} height={40} />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height="40"
            viewBox="0 0 2 40"
            fill="none"
          >
            <path opacity="0.1" d="M1 0L1 40" stroke="black" />
          </svg>
          <div className="flex flex-row gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <circle cx="20" cy="20" r="20" fill="white" />
              <path
                d="M16.613 13.2702C18.077 14.7329 18.8197 15.4758 18.8411 15.499C18.8672 15.5268 18.8817 15.5636 18.8815 15.6018C18.8839 16.0971 18.8830 17.1785 18.8833 18.846C18.8833 18.8551 18.879 18.8643 18.8705 18.8735C18.8656 18.8784 18.8585 18.8808 18.8494 18.8808C17.1811 18.8827 16.0994 18.8827 15.604 18.8808C15.5661 18.8806 15.5296 18.8658 15.5022 18.8396C15.479 18.8182 14.7357 18.0761 13.2723 16.6135C11.8083 15.1508 11.0656 14.4079 11.0442 14.3846C11.018 14.3572 11.0032 14.3208 11.0029 14.2828C11.0005 13.7875 10.9999 12.7058 11.0011 11.0377C11.0011 11.0285 11.0057 11.0194 11.0149 11.0102C11.0198 11.0059 11.0268 11.0035 11.036 11.0028C12.7042 11.001 13.7857 11.0013 14.2804 11.0038C14.3185 11.0035 14.3553 11.018 14.3831 11.0441C14.4064 11.0655 15.1497 11.8076 16.613 13.2702Z"
                fill="#242537"
              />
              <path
                d="M23.3771 13.2637C24.846 11.8035 25.592 11.0627 25.6153 11.0413C25.6429 11.0148 25.6797 11 25.718 11C26.214 10.9994 27.2967 11.0021 28.9661 11.0083C28.9753 11.0089 28.9845 11.0134 28.9936 11.022C28.9979 11.0269 29.0001 11.0339 29.0001 11.0431C28.997 12.7124 28.9936 13.7951 28.99 14.291C28.9899 14.3293 28.9752 14.3661 28.9487 14.3937C28.9273 14.4163 28.1821 15.1577 26.7133 16.618C25.2444 18.0782 24.4986 18.8193 24.476 18.8413C24.4482 18.8674 24.4114 18.8819 24.3733 18.8816C23.8773 18.8823 22.7946 18.8795 21.1252 18.8734C21.116 18.8734 21.1068 18.8688 21.0977 18.8596C21.0928 18.8553 21.0903 18.8483 21.0903 18.8385C21.0934 17.1692 21.0968 16.0866 21.1004 15.5907C21.1007 15.5527 21.1154 15.5163 21.1417 15.4889C21.1637 15.4656 21.9089 14.7239 23.3771 13.2637Z"
                fill="#242537"
              />
              <path
                d="M16.6221 26.708C15.1612 28.178 14.4191 28.9237 14.3959 28.9451C14.3684 28.9713 14.332 28.9861 14.294 28.9863C13.7975 28.99 12.7142 28.9937 11.0441 28.9973C11.0343 28.9973 11.0251 28.9928 11.0166 28.9836C11.0117 28.9793 11.0092 28.9723 11.0092 28.9625C11.0025 27.2925 10.9995 26.2096 11.0001 25.7137C11.0001 25.6754 11.0149 25.6386 11.0414 25.611C11.0628 25.5877 11.8039 24.8411 13.2648 23.3711C14.7258 21.9017 15.4678 21.1564 15.4911 21.135C15.5185 21.1087 15.5549 21.0939 15.5929 21.0937C16.0895 21.0894 17.1728 21.0857 18.8428 21.0827C18.8526 21.0827 18.8618 21.0873 18.8704 21.0964C18.8752 21.1007 18.8777 21.1077 18.8777 21.1175C18.8844 22.7875 18.8872 23.8704 18.8859 24.3663C18.8862 24.4045 18.8717 24.4412 18.8456 24.469C18.8242 24.4923 18.083 25.2386 16.6221 26.708Z"
                fill="#242537"
              />
              <path
                d="M26.7192 23.3633C28.1856 24.8303 28.9299 25.5754 28.9519 25.5986C28.9779 25.6263 28.9924 25.6631 28.9922 25.7013C28.9947 26.1978 28.9947 27.2823 28.9922 28.9547C28.9922 28.9639 28.9901 28.9706 28.9858 28.9749C28.9766 28.984 28.9672 28.9886 28.9574 28.9886C27.2855 28.9898 26.2013 28.9892 25.7047 28.9868C25.6663 28.9867 25.6296 28.9719 25.602 28.9455C25.5787 28.9241 24.8339 28.1796 23.3675 26.7121C21.901 25.2452 21.1571 24.5001 21.1357 24.4768C21.1093 24.4492 21.0945 24.4125 21.0944 24.3741C21.0926 23.8776 21.0929 22.7934 21.0954 21.1217C21.0954 21.1119 21.0975 21.1048 21.1018 21.1006C21.111 21.0914 21.1201 21.0868 21.1293 21.0868C22.8018 21.0856 23.8863 21.0862 24.3829 21.0886C24.4213 21.0887 24.458 21.1035 24.4856 21.1299C24.5083 21.1513 25.2528 21.8958 26.7192 23.3633Z"
                fill="#242537"
              />
            </svg>
            <div className="flex flex-col items-start gap">
              <h3 className="text-[#211C1A] text-[14px] lg:text-base font-bold">
                Nexus Protocol
              </h3>
              <div className="flex flex-row  items-center gap-2 text-[#857F78] text-[10px] font-bold uppercase">
                <p>{data?.total_candidates} new candidates</p>
                <p>/</p>
                <p className="block lg:hidden">{data?.total_jobs} position</p>
                <p className="hidden lg:block">
                  {data?.total_jobs} position open
                </p>
              </div>
            </div>
          </div>
        </section>
        {currentUser?.is_admin && (
          <section className="flex flex-row gap-[6px]">
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
          </section>
        )}
      </div>
    </header>
  );
}
