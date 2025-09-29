"use client";
import { AllCandidatesList, HeaderContainer } from "@/components";
import { CreateJobCandidateModal } from "@/components/home/candidat-form/container";
import { CandidatesProvider } from "@/provider";
import { useState } from "react";

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <CandidatesProvider>
      <HeaderContainer setIsAddModalOpen={setIsAddModalOpen} />
      <AllCandidatesList />

      {isAddModalOpen && (
        <CreateJobCandidateModal
          open={isAddModalOpen}
          setOpen={setIsAddModalOpen}
        />
      )}
    </CandidatesProvider>
  );
}
