import React from 'react';

interface TableShimmerProps {
  columns: number;
  rows?: number;
}

const TableShimmer: React.FC<TableShimmerProps> = ({ columns, rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse border-b border-border last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableShimmer;
