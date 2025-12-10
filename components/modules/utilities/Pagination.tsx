'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  /** The total number of pages. */
  totalPages: number;
  /** The current active page. */
  currentPage: number;
  /** Callback function to handle page change. */
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, onPageChange }) => {
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPageButtons = 5; // Number of page buttons to display

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
      const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <ul className="pagination flex flex-wrap items-center gap-2 justify-center">
      <li className="page-item">
        <Link
          href="javascript:void(0)"
          onClick={() => onPageChange(1)}
          className="page-link bg-primary-50 dark:bg-primary-600/25 text-secondary-light font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-[48]"
          aria-label="First"
        >
          First
        </Link>
      </li>
      <li className="page-item">
        <Link
          href="javascript:void(0)"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="page-link bg-primary-50 dark:bg-primary-600/25 text-secondary-light font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-[48]"
          aria-label="Previous"
        >
          Previous
        </Link>
      </li>
      <li className="page-item">
        <Link
          href="javascript:void(0)"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="page-link bg-primary-50 dark:bg-primary-600/25 text-secondary-light font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-[48] w-[48px]"
          aria-label="Previous Page"
        >
          <ChevronLeft className="text-xl" aria-hidden="true" />
        </Link>
      </li>
      {pageNumbers.map((page, index) => (
        <li key={index} className="page-item">
          {typeof page === 'number' ? (
            <Link
              href="javascript:void(0)"
              onClick={() => onPageChange(page)}
              className={`page-link text-secondary-light font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-[48] w-[48px] ${
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-50 dark:bg-primary-600/25'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          ) : (
            <span className="page-link bg-primary-50 dark:bg-primary-600/25 text-secondary-light font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-[48] w-[48px]">
              {page}
            </span>
          )}
        </li>
      ))}
      <li className="page-item">
        <Link
          href="javascript:void(0)"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="page-link bg-primary-50 dark:bg-primary-600/25 text-secondary-light font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-[48] w-[48px]"
          aria-label="Next Page"
        >
          <ChevronRight className="text-xl" aria-hidden="true" />
        </Link>
      </li>
      <li className="page-item">
        <Link
          href="javascript:void(0)"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="page-link bg-primary-50 dark:bg-primary-600/25 text-secondary-light font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-[48]"
          aria-label="Next"
        >
          Next
        </Link>
      </li>
      <li className="page-item">
        <Link
          href="javascript:void(0)"
          onClick={() => onPageChange(totalPages)}
          className="page-link bg-primary-50 dark:bg-primary-600/25 text-secondary-light font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-[48]"
          aria-label="Last"
        >
          Last
        </Link>
      </li>
    </ul>
  );
};

export default Pagination;
