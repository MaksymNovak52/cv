"use client";
import { AllCandidatesList, HeaderContainer } from "@/components";
import { CreateJobCandidateModal } from "@/components/home/candidat-form/container";
import { CandidatesProvider, UserProvider } from "@/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const queryClient = new QueryClient();

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <UserProvider>
      <CandidatesProvider>
        <QueryClientProvider client={queryClient}>
          <HeaderContainer setIsAddModalOpen={setIsAddModalOpen} />
          <AllCandidatesList />

          {isAddModalOpen && (
            <CreateJobCandidateModal
              open={isAddModalOpen}
              setOpen={setIsAddModalOpen}
            />
          )}
        </QueryClientProvider>
      </CandidatesProvider>
    </UserProvider>
  );
}
