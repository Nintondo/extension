import React, { FC, useMemo } from "react";
import s from "./styles.module.scss";
import cn from "classnames";

interface Props {
  pageCount: number;
  visiblePageButtonsCount?: number;
  currentPage?: number;
  leftBtnPlaceholder?: string | React.ReactNode;
  rightBtnPlaceholder?: string | React.ReactNode;
  onPageChange?: (pageNumber: number) => void;
  className?: string;
}

const Pagination: FC<Props> = ({
  pageCount,
  onPageChange,
  className,
  rightBtnPlaceholder,
  leftBtnPlaceholder,
  visiblePageButtonsCount = 5,
  currentPage = 1,
}) => {
  const visiblePages = useMemo(() => {
    const halfCount = Math.floor(visiblePageButtonsCount / 2);
    let startPage = currentPage <= halfCount ? 1 : currentPage - halfCount;
    const endPage = Math.min(
      startPage + visiblePageButtonsCount - 1,
      pageCount
    );
    if (endPage === pageCount) {
      startPage = Math.max(pageCount - visiblePageButtonsCount + 1, 1);
    }
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }, [currentPage, pageCount, visiblePageButtonsCount]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > pageCount) {
      return;
    }

    if (onPageChange) {
      onPageChange(pageNumber);
    }
  };

  const handlePageClick = (value: number) => {
    handlePageChange(currentPage + value);
  };

  return (
    <div className={className}>
      {leftBtnPlaceholder && (
        <button
          className={s.arrow}
          onClick={() => handlePageClick(-1)}
          disabled={currentPage === 1}
        >
          {leftBtnPlaceholder}
        </button>
      )}
      {visiblePages.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => handlePageChange(pageNumber)}
          className={cn(s.btn, {
            [s.active]: currentPage === pageNumber,
          })}
        >
          {pageNumber}
        </button>
      ))}
      {rightBtnPlaceholder && (
        <button
          className={s.arrow}
          onClick={() => handlePageClick(1)}
          disabled={currentPage === pageCount}
        >
          {rightBtnPlaceholder}
        </button>
      )}
    </div>
  );
};

export default Pagination;
