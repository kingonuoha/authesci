"use client";

import React, { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const MySwal = withReactContent(Swal);

interface Applicant {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  status: string;
  appliedAt: Date;
}

interface ApplicantListModalProps {
  applicants: Applicant[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export const ApplicantListModal: React.FC<ApplicantListModalProps> = ({
  applicants,
  isOpen,
  onOpenChange,
  title = "Applicants",
}) => {
  useEffect(() => {
    if (isOpen) {
      MySwal.fire({
        title: <span className="text-xl font-bold text-neutral-900 dark:text-white">{title} ({applicants.length})</span>,
        html: (
          <div className="max-h-[60vh] overflow-y-auto pr-2 text-left">
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
              {applicants.map((applicant) => (
                <li
                  key={applicant.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-neutral-200 dark:border-neutral-700">
                      <AvatarImage src={applicant.user.image || ""} alt={applicant.user.name || "Applicant"} className="object-cover" />
                      <AvatarFallback className="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        {applicant.user.name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white m-0">
                        {applicant.user.name || "Unknown Applicant"}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 m-0">
                        {applicant.user.email}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-lg border-neutral-200 dark:border-neutral-600 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-colors" onClick={() => MySwal.close()}>
                    <Link href={`/employer/applicants/${applicant.user.id}`}>
                      View
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ),
        showConfirmButton: false,
        showCloseButton: true,
        width: '500px',
        customClass: {
          popup: 'dark:bg-neutral-800 dark:border dark:border-neutral-700 rounded-xl',
          closeButton: 'dark:text-neutral-400 hover:dark:text-neutral-200 focus:outline-none'
        },
        willClose: () => {
          onOpenChange(false);
        },
      });
    }
  }, [isOpen, applicants, onOpenChange]);

  return null;
};
