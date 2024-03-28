import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const bgRef = useRef<HTMLDivElement>(null);

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

  const containerRef = useRef<HTMLDivElement>(null);

  const calculateTransform = useCallback(
    (page: number) => {
      let offset = 0;

      if (!containerRef.current) {
        return "";
      }

      for (let i = 0; i < visiblePages.findIndex((i) => i === page); i++) {
        offset +=
          (containerRef.current?.children[i + 1] as HTMLDivElement)
            .offsetWidth ?? 0;
      }

      return `translateX(${offset}px)`;
    },
    [containerRef, visiblePages]
  );

  const getPageWidthByNumber = useCallback(
    (page: number) => {
      if (!containerRef.current) {
        return 0;
      }

      return (
        containerRef.current.children[
          visiblePages.findIndex((i) => i === page) + 1
        ] as HTMLDivElement
      ).offsetWidth;
    },
    [containerRef, visiblePages]
  );

  const handlePageClick = (value: number) => {
    handlePageChange(currentPage + value);
  };

  const handleMouseEnter = (page: number) => {
    if (bgRef.current) {
      bgRef.current.style.transform = calculateTransform(page);
    }
  };

  const handleMouseLeave = () => {
    if (bgRef.current) {
      bgRef.current.style.transform = calculateTransform(currentPage);
    }
  };

  useEffect(() => {
    if (bgRef.current) {
      bgRef.current.style.transform = calculateTransform(currentPage);
      bgRef.current.style.width = `${getPageWidthByNumber(currentPage)}px`;
    }
  }, [bgRef, calculateTransform, getPageWidthByNumber, currentPage]);

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
      <div className="relative flex" ref={containerRef}>
        <div
          ref={bgRef}
          className="absolute left-0 top-0 h-full bg-primary bg-opacity-80 rounded-lg transition-all duration-500"
          style={{
            transitionTimingFunction: "cubic-bezier(.53,.28,0,1.2)",
          }}
        />
        {visiblePages.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={cn(s.btn, "z-10")}
            onMouseEnter={() => handleMouseEnter(pageNumber)}
            onMouseLeave={handleMouseLeave}
          >
            {pageNumber}
          </button>
        ))}
      </div>
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
