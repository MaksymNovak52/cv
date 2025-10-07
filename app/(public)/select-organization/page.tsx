"use client";
import {
  CloseButton,
  FormField,
  Input,
} from "@/components/home/candidat-form/form-items";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/provider";
import { useOrganizations } from "@/queries/candidates";
import Cookies from "js-cookie";
import { File, Trash2, ViewIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrganizationSelectionBlock() {
  const { data: organizations = [], refetch, isLoading } = useOrganizations();

  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [emails, setEmails] = useState("");
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [handleViewUsers, setHandleViewUsers] = useState(false);
  const [userErrors, setUserErrors] = useState<
    { email: string; error: string }[]
  >([]);

  const { setOrganization, isAdmin, organization } = useUser();

  const [createdUsers, setCreatedUsers] = useState<
    { email: string; password: string }[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [modalOrgId, setModalOrgId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setLogoFile(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const removeFile = () => {
    setLogoFile(null);
    setPreview(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  function sanitizeFilePath(name: string) {
    return (name || "organization")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
  }
  const handleDeleteUser = async (userId: string, email: string) => {
    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Error:", error);
        return;
      }

      setCreatedUsers((prev) => prev.filter((u) => u.email !== email));
      refetch();
    } catch (err) {
      console.error("💥 Error during user deletion:", err);
    }
  };
  const getUserIdByEmail = async (email: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("organization_users")
        .select("user_id")
        .eq("email", email)
        .single();

      if (error) {
        console.error("❌ Error fetching user id:", error);
        return null;
      }

      return data?.user_id || null;
    } catch (err) {
      console.error("💥 Error in getUserIdByEmail:", err);
      return null;
    }
  };
  const handleSave = async () => {
    try {
      setUserErrors([]);
      let logoUrl: string | undefined;
      let orgId = editingId;

      if (editingId) {
        const { data: orgData, error: fetchError } = await supabase
          .from("organizations")
          .select("logo_url")
          .eq("id", editingId)
          .single();

        if (fetchError) {
          console.error("❌ Could not fetch org before update:", fetchError);
        }

        if (orgData?.logo_url) {
          logoUrl = orgData.logo_url;
        }
      }

      if (logoFile) {
        const safeName = sanitizeFilePath(name);
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${safeName}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("logo")
          .upload(filePath, logoFile, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          return;
        }

        const { data } = supabase.storage.from("logo").getPublicUrl(filePath);
        logoUrl = `${data.publicUrl}?v=${Date.now()}`;
        setPreview(logoUrl);
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from("organizations")
          .update({
            name: name || null,
            ...(logoUrl ? { logo_url: logoUrl } : {}),
          })
          .eq("id", editingId);

        if (updateError) {
          console.error("Update error:", updateError);
          return;
        }
      } else {
        const { data: newOrg, error: createError } = await supabase
          .from("organizations")
          .insert({ name, logo_url: logoUrl })
          .select()
          .single();

        if (createError) {
          console.error("Org create error:", createError);
          return;
        }

        orgId = newOrg.id;
      }

      const allowedEmails = emails
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0);

      const usersWithPasswords: { email: string; password: string }[] = [];
      const errors: { email: string; error: string }[] = [];
      for (const email of allowedEmails) {
        const res = await fetch("/api/admin/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, organizationId: orgId }),
        });

        if (res.ok) {
          const user = await res.json();
          if (user?.password) {
            usersWithPasswords.push({
              email: user.email,
              password: user.password,
            });
          }
        } else {
          const err = await res.json();
          errors.push({ email, error: err?.error || "Failed to create user" });
        }
      }

      if (errors.length > 0) {
        setUserErrors(errors);
        return;
      }

      if (usersWithPasswords.length > 0) {
        setCreatedUsers(usersWithPasswords);
        setModalOrgId(orgId!);
        setShowModal(true);
        Cookies.set("organizationId", orgId!);
        setOrganization(name);
      } else {
        router.push("/dashboard");
      }

      Cookies.set("organizationId", orgId!);
      setOrganization(name);
      setName("");
      setLogoFile(null);
      setPreview(null);
      setEmails("");
      setEditingId(null);
      setIsCreating(false);
    } catch (err) {
      console.error("💥 handleSave error:", err);
    }
  };
  const handleDeleteOrganization = async (orgId: string) => {
    try {
      if (!orgId) {
        console.error("❌ handleDeleteOrganization: orgId is missing");
        return;
      }

      const { data: orgUsers, error: fetchUsersError } = await supabase
        .from("organization_users")
        .select("user_id, email")
        .eq("organization_id", orgId);

      if (fetchUsersError) {
        console.error(
          "❌ Failed to fetch users for the organization:",
          fetchUsersError
        );
        return;
      }

      if (orgUsers && orgUsers.length > 0) {
        for (const user of orgUsers) {
          await handleDeleteUser(user.user_id, user.email);
        }

        console.log(`✅ All users removed from organization: ${orgId}`);
      } else {
        console.log("ℹ️ No users found for this organization.");
      }

      const { data: deleted, error: deleteError } = await supabase
        .from("organizations")
        .delete()
        .eq("id", orgId)
        .select();

      if (deleteError) {
        console.error("❌ Delete error:", deleteError);
        return;
      }

      if (!deleted || deleted.length === 0) {
        console.warn("⚠️ Organization not deleted. Probably RLS blocked it.");
        return;
      }

      refetch();
    } catch (err) {
      console.error("💥 handleDeleteOrganization unexpected error:", err);
    }
  };

  const handleSelectOrganization = async (org: any) => {
    Cookies.set("organizationId", org.id);
    router.push(`/dashboard`);
    const { data: orgData, error: fetchError } = await supabase
      .from("organizations")
      .select("logo_url")
      .eq("id", org.id)
      .single();

    if (fetchError || !orgData) {
      console.error("❌ Could not fetch organization data:", fetchError);
      return;
    }

    setOrganization(org.name);
  };
  const handleChangeOrganization = async ({
    org,
    e,
  }: {
    org: { id: string; name: string };
    e: React.MouseEvent<HTMLButtonElement>;
  }) => {
    try {
      e.stopPropagation();

      setName("");
      setLogoFile(null);
      setPreview(null);
      setEmails("");
      setEditingId(org.id);
      setIsCreating(false);
      setUserErrors([]);
      setCreatedUsers([]);
      setShowModal(false);

      const { data, error } = await supabase
        .from("organization_users")
        .select("email, password")
        .eq("organization_id", org.id);
      console.log("admklasmdkaskldmlkasdmask", data, org.id);

      if (error) {
        console.error("❌ Failed to fetch existing users:", error);
        return;
      }

      if (data && data.length > 0) {
        const existingUsers = data.map((u: any) => ({
          email: u.email || "unknown",
          password: u.password || "existing",
        }));

        setCreatedUsers(existingUsers);
      } else {
        console.log("ℹ️ No users linked to this organization yet.");
      }

      setName(org.name);
    } catch (err) {
      console.error("💥 handleChangeOrganization unexpected error:", err);
    }
  };

  return (
    <>
      {handleViewUsers && (
        <div className="fixed backdrop-blur top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-center">
              Users Linked to Organization
            </h3>
            <CloseButton onClose={() => setHandleViewUsers(false)} />
            {createdUsers.length > 0 ? (
              <ul className="space-y-2">
                {createdUsers.map((u, i) => (
                  <div className="">
                    <li
                      key={i}
                      className="border-b border-gray-100 pb-2 text-sm flex flex-col"
                    >
                      <span className="text-gray-700">
                        Email: <span className="text-gray-500">{u.email}</span>
                      </span>
                      {u.password ? (
                        <span className="text-gray-700">
                          Password:{" "}
                          <span className="text-gray-500">{u.password}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">existing</span>
                      )}
                      <button
                        onClick={async () => {
                          const userId = await getUserIdByEmail(u.email);
                          if (userId) {
                            {
                              await handleDeleteUser(userId, u.email);
                            }
                          } else {
                          }
                        }}
                        className="mt-2 flex items-center text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} className="mr-2" /> Delete User
                      </button>
                    </li>
                  </div>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic text-center">
                No users found for this organization.
              </p>
            )}

            <button
              onClick={() => setHandleViewUsers(false)}
              className="mt-5 w-full bg-[#242537] text-white py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4 w-[400px] fixed top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col justify-center items-center">
        <h5 className="text-[34px] lg:text-[40px] text-center pt-10 font-eb-garamond">
          {isCreating
            ? "Create Organization"
            : editingId
            ? "Edit Organization"
            : "Select Organization"}
        </h5>
        {isLoading && (
          <div className="w-full h-[130px]  flex items-center justify-center">
            <div className="h-6 w-6 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
          </div>
        )}

        {showModal && (
          <div className="  flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
              <h3 className="text-lg font-bold mb-4">New Users Added</h3>
              <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                {createdUsers.map((u, i) => (
                  <li
                    key={i}
                    className="flex flex-col items-start justify-start  border-[#CCCCCC] text-[#4D4D4D]/90  border p-2 rounded"
                  >
                    <span className="">
                      email: {u.email || "test@gmail.com"}
                    </span>
                    <span className="text-sm text-gray-600">
                      pwd: {u.password}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setShowModal(false);
                  router.push("/dashboard");
                }}
                className="mt-4 w-full bg-[#242537] text-white py-2 rounded-md"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {!isCreating && !editingId ? (
          <div
            className={`flex flex-col gap-2 items-center             ${
              showModal && "hidden"
            }`}
          >
            {organizations.length === 0 && !isLoading && (
              <div className="text-xs text-gray-500 italic">
                No organizations yet.
              </div>
            )}

            <div className=" flex flex-col justify-between gap-2 items-center     overflow-y-scroll    max-h-[300px] min-h-auto">
              {organizations.map((org: any) => {
                const selected = organization == org.name;
                return (
                  <div
                    key={org.id}
                    onClick={() => handleSelectOrganization(org)}
                    className="w-[330px] min-h-[42px] cursor-pointer h-[42px] border rounded-md flex items-center justify-between px-[14px] bg-[#FAFAFA] border-[#F0F0F0]"
                  >
                    <label className="flex flex-row gap-2 items-center cursor-pointer">
                      <input
                        type="radio"
                        name="job"
                        value={org.id}
                        checked={selected}
                        className="hidden"
                      />
                      <span
                        className={`h-[10px] w-[10px] rounded-full border ${
                          selected
                            ? "bg-emerald-500 border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
                            : "border-[#CFCFCF]"
                        }`}
                      />
                      <span className="font-bold text-[14px] truncate">
                        {org.name}
                      </span>
                    </label>
                    {org.logo_url && (
                      <img
                        src={org.logo_url}
                        alt="logo"
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    )}
                    {isAdmin && (
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            handleChangeOrganization({ org, e });
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            handleDeleteOrganization(org.id);
                            e.stopPropagation();
                          }}
                        >
                          <Trash2
                            size={16}
                            className="hover:text-red-400 transition-colors"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsCreating(true)}
                className="w-[330px] h-[42px] mt-[5px] border border-dashed rounded-md"
              >
                + Create new
              </button>
            )}
          </div>
        ) : (
          <div
            className={`flex flex-col gap-3 items-center justify-center lg:w-[330px] ${
              showModal && "hidden"
            }`}
          >
            <FormField
              label="Organization Name"
              isRequired
              isEmpty={!name.trim()}
              showValidation
            >
              <div className="flex flex-col gap-2 justify-center  items-center">
                <div className="w-[330px] mx-auto flex  flex-col justify-start  items-center  ">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Organization Name"
                    className="w-[340px] bg-[#FAFAFA] "
                  />
                </div>
                <div className="w-[330px] mx-auto flex  flex-col justify-start  items-center  ">
                  <Input
                    value={emails}
                    onChange={(e) => {
                      setUserErrors([]);
                      setEmails(e.target.value);
                    }}
                    placeholder="Unique emails "
                    className="w-[340px] bg-[#FAFAFA]"
                    hasError={userErrors.length > 0}
                    label="Enter emails"
                  />
                </div>
                <div
                  className="flex flex-row    gap-2 items-end justify-end  w-[300px] cursor-pointer"
                  onClick={() => setHandleViewUsers((prev) => !prev)}
                >
                  <button className="text-[12px]  mx-0 px-0">
                    See includes user
                  </button>
                  <ViewIcon className="mb-0" size={16} />
                </div>

                {userErrors.length > 0 && (
                  <div className="w-[330px] bg-red-50 border border-red-300 text-red-700 p-2 rounded text-sm">
                    <ul className="list-disc pl-4">
                      {userErrors.map((e, i) => (
                        <li key={i}>
                          {e.error.includes("duplicate")
                            ? "You need to add unique emails"
                            : e.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </FormField>

            <FormField label="Logo" isRequired={false} isEmpty={false}>
              <div
                className={`w-[330px] ${
                  !logoFile && "bg-gray-50 py-9 border-gray-300"
                } rounded-2xl border gap-0 flex flex-col border-dashed`}
              >
                {!logoFile ? (
                  <div className=" w-[80%] lg:w-full mx-auto">
                    <div className="grid gap-1 ">
                      <svg
                        className="mx-auto"
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="File">
                          <path
                            id="icon"
                            d="M31.6497 10.6056L32.2476 10.0741L31.6497 10.6056ZM28.6559 7.23757L28.058 7.76907L28.058 7.76907L28.6559 7.23757ZM26.5356 5.29253L26.2079 6.02233L26.2079 6.02233L26.5356 5.29253ZM33.1161 12.5827L32.3683 12.867V12.867L33.1161 12.5827ZM31.8692 33.5355L32.4349 34.1012L31.8692 33.5355ZM24.231 11.4836L25.0157 11.3276L24.231 11.4836ZM26.85 14.1026L26.694 14.8872L26.85 14.1026ZM11.667 20.8667C11.2252 20.8667 10.867 21.2248 10.867 21.6667C10.867 22.1085 11.2252 22.4667 11.667 22.4667V20.8667ZM25.0003 22.4667C25.4422 22.4667 25.8003 22.1085 25.8003 21.6667C25.8003 21.2248 25.4422 20.8667 25.0003 20.8667V22.4667ZM11.667 25.8667C11.2252 25.8667 10.867 26.2248 10.867 26.6667C10.867 27.1085 11.2252 27.4667 11.667 27.4667V25.8667ZM20.0003 27.4667C20.4422 27.4667 20.8003 27.1085 20.8003 26.6667C20.8003 26.2248 20.4422 25.8667 20.0003 25.8667V27.4667ZM23.3337 34.2H16.667V35.8H23.3337V34.2ZM7.46699 25V15H5.86699V25H7.46699ZM32.5337 15.0347V25H34.1337V15.0347H32.5337ZM16.667 5.8H23.6732V4.2H16.667V5.8ZM23.6732 5.8C25.2185 5.8 25.7493 5.81639 26.2079 6.02233L26.8633 4.56274C26.0191 4.18361 25.0759 4.2 23.6732 4.2V5.8ZM29.2539 6.70608C28.322 5.65771 27.7076 4.94187 26.8633 4.56274L26.2079 6.02233C26.6665 6.22826 27.0314 6.6141 28.058 7.76907L29.2539 6.70608ZM34.1337 15.0347C34.1337 13.8411 34.1458 13.0399 33.8638 12.2984L32.3683 12.867C32.5216 13.2702 32.5337 13.7221 32.5337 15.0347H34.1337ZM31.0518 11.1371C31.9238 12.1181 32.215 12.4639 32.3683 12.867L33.8638 12.2984C33.5819 11.5569 33.0406 10.9662 32.2476 10.0741L31.0518 11.1371ZM16.667 34.2C14.2874 34.2 12.5831 34.1983 11.2872 34.0241C10.0144 33.8529 9.25596 33.5287 8.69714 32.9698L7.56577 34.1012C8.47142 35.0069 9.62375 35.4148 11.074 35.6098C12.5013 35.8017 14.3326 35.8 16.667 35.8V34.2ZM5.86699 25C5.86699 27.3344 5.86529 29.1657 6.05718 30.593C6.25217 32.0432 6.66012 33.1956 7.56577 34.1012L8.69714 32.9698C8.13833 32.411 7.81405 31.6526 7.64292 30.3798C7.46869 29.0839 7.46699 27.3796 7.46699 25H5.86699ZM23.3337 35.8C25.6681 35.8 27.4993 35.8017 28.9266 35.6098C30.3769 35.4148 31.5292 35.0069 32.4349 34.1012L31.3035 32.9698C30.7447 33.5287 29.9863 33.8529 28.7134 34.0241C27.4175 34.1983 25.7133 34.2 23.3337 34.2V35.8ZM32.5337 25C32.5337 27.3796 32.532 29.0839 32.3577 30.3798C32.1866 31.6526 31.8623 32.411 31.3035 32.9698L32.4349 34.1012C33.3405 33.1956 33.7485 32.0432 33.9435 30.593C34.1354 29.1657 34.1337 27.3344 34.1337 25H32.5337ZM7.46699 15C7.46699 12.6204 7.46869 10.9161 7.64292 9.62024C7.81405 8.34738 8.13833 7.58897 8.69714 7.03015L7.56577 5.89878C6.66012 6.80443 6.25217 7.95676 6.05718 9.40704C5.86529 10.8343 5.86699 12.6656 5.86699 15H7.46699ZM16.667 4.2C14.3326 4.2 12.5013 4.1983 11.074 4.39019C9.62375 4.58518 8.47142 4.99313 7.56577 5.89878L8.69714 7.03015C9.25596 6.47133 10.0144 6.14706 11.2872 5.97592C12.5831 5.8017 14.2874 5.8 16.667 5.8V4.2ZM23.367 5V10H24.967V5H23.367ZM28.3337 14.9667H33.3337V13.3667H28.3337V14.9667ZM23.367 10C23.367 10.7361 23.3631 11.221 23.4464 11.6397L25.0157 11.3276C24.9709 11.1023 24.967 10.8128 24.967 10H23.367ZM28.3337 13.3667C27.5209 13.3667 27.2313 13.3628 27.0061 13.318L26.694 14.8872C27.1127 14.9705 27.5976 14.9667 28.3337 14.9667V13.3667ZM23.4464 11.6397C23.7726 13.2794 25.0543 14.5611 26.694 14.8872L27.0061 13.318C26.0011 13.1181 25.2156 12.3325 25.0157 11.3276L23.4464 11.6397ZM11.667 22.4667H25.0003V20.8667H11.667V22.4667ZM11.667 27.4667H20.0003V25.8667H11.667V27.4667ZM32.2476 10.0741L29.2539 6.70608L28.058 7.76907L31.0518 11.1371L32.2476 10.0741Z"
                            fill="#242537"
                          />
                        </g>
                      </svg>

                      <h2 className="text-center text-gray-400 text-xs leading-4">
                        PNG, JPG or PDF, smaller than 15MB
                      </h2>
                    </div>
                    <div className="grid gap-2">
                      <h4 className="text-center text-gray-900 text-sm font-medium leading-snug">
                        Drag and Drop your file here or
                      </h4>
                      <div className="flex items-center justify-center">
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleFileChange}
                          />
                          <div className="flex w-28 h-9 px-2 flex-col bg-[#242537] rounded-full shadow text-white text-xs font-semibold leading-4 items-center justify-center cursor-pointer focus:outline-none">
                            Choose File
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full p-2 bg-white rounded-lg border border-gray-300 flex items-center gap-4">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <File className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {logoFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(logoFile.size)}
                      </p>
                    </div>

                    <button
                      onClick={removeFile}
                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </FormField>

            <div className="flex gap-3 w-[90%] lg:w-[330px] justify-between">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setName("");
                  setLogoFile(null);
                  setPreview(null);
                }}
                className="text-sm font-bold"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-4 py-2 bg-[#242537] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
