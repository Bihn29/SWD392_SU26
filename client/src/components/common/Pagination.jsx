/**
 * Reusable pagination component.
 * Props: currentPage, totalPages, totalItems, limit, onPageChange
 */
const Pagination = ({ currentPage, totalPages, totalItems, limit, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Build page numbers to show (window of 5 around current)
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let end = Math.min(totalPages, start + maxPages - 1);
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="pagination">
      <span className="pagination-info">
        Hiển thị {startItem}–{endItem} trong số {totalItems} kết quả
      </span>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          id="pagination-first-btn"
          title="Trang đầu"
        >
          «
        </button>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          id="pagination-prev-btn"
          title="Trang trước"
        >
          ‹
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
            id={`pagination-page-${page}-btn`}
          >
            {page}
          </button>
        ))}

        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          id="pagination-next-btn"
          title="Trang sau"
        >
          ›
        </button>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          id="pagination-last-btn"
          title="Trang cuối"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
