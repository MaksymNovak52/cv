"use client";

import { FormField, Input } from "@/components/home/candidat-form/form-items";
import { useUser } from "@/provider";
import {
  useCreateOrganization,
  useDeleteOrganization,
  useOrganizations,
  useUpdateOrganization,
} from "@/queries/candidates";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrganizationSelectionBlock() {
  const { data: organizations = [] } = useOrganizations();
  const createOrg = useCreateOrganization();
  const updateOrg = useUpdateOrganization();
  const deleteOrg = useDeleteOrganization();

  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const { setOrganization, isAdmin } = useUser();

  const handleSave = () => {
    if (editingId) {
      updateOrg.mutate({ id: editingId, name });
      setEditingId(null);
    } else {
      createOrg.mutate(name);
    }
    setName("");
    setIsCreating(false);
  };
  const handleSelectOrganization = (org: any) => {
    document.cookie = `organizationId=${org.id}; path=/;`;
    router.push(`/dashboard`);

    setOrganization(org.name);
  };
  return (
    <div className="space-y-4  w-[400px] fixed top-[30%] left-[50%] translate-x-[-50%] translate-y-[-50%]  ">
      <h5 className="text-[34px] lg:text-[40px] text-center pt-10 font-eb-garamond">
        {isCreating
          ? "Create Organization"
          : editingId
          ? "Edit Organization "
          : "Select Organization"}
      </h5>

      {!isCreating && !editingId ? (
        <div className="flex flex-col gap-2 items-center">
          {organizations.length === 0 && (
            <div className="text-xs text-gray-500 italic">
              No organizations yet.
            </div>
          )}
          {organizations.map((org: any) => (
            <div
              key={org.id}
              onClick={() => handleSelectOrganization(org)}
              className="w-[90%] lg:w-[330px] cursor-pointer h-[42px] border rounded-md flex items-center justify-between px-[14px] bg-[#FAFAFA] border-[#F0F0F0]"
            >
              <span className="font-bold text-[14px] truncate">{org.name}</span>
              {isAdmin && (
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      setEditingId(org.id);
                      setName(org.name);
                      e.stopPropagation();
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      deleteOrg.mutate(org.id);
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
          ))}

          {isAdmin && (
            <button
              onClick={() => setIsCreating(true)}
              className="w-[90%] lg:w-[330px] h-[42px] mt-[5px] border border-dashed rounded-md"
            >
              + Create new
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 items-center lg:w-[330px]">
          <FormField
            label="Organization Name"
            isRequired
            isEmpty={!name.trim()}
            showValidation
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization Name"
              className="w-[90%] lg:w-[330px] bg-[#FAFAFA]"
            />
          </FormField>

          <div className="flex gap-3 w-[90%] lg:w-[330px]   justify-between">
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setName("");
              }}
              className="text-sm font-bold"
            >
              ← Back
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 bg-[#242537] text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
