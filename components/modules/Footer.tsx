"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTeamClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.shiftKey) {
      // Allow default behavior (open GitHub)
      return;
    }
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <footer className="d-footer">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="mb-0 text-neutral-600">&copy; {new Date().getFullYear()} Authesci. All Rights Reserved.</p>
          <p className="mb-0">
            Made by{" "}
            <a
              href="https://github.com/kingonuoha/authesci"
              onClick={handleTeamClick}
              className="text-primary-600 dark:text-primary-600 hover:underline cursor-pointer"
            >
              Authesci Team
            </a>
          </p>
        </div>
      </footer>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>System Information</DialogTitle>
            <DialogDescription>
              Current Version
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <h2 className="text-2xl font-bold mb-2">Authesci V1.0.5</h2>
            <p className="text-sm text-neutral-500">Build 2025.12.29</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;
