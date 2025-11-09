// authesci-app/components/modules/utilities/DataTable.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server'; // Import ReactDOMServer

/**
 * @typedef {Object} DataTableColumn
 * @property {string} heading - The column header text.
 * @property {string} data - The key from the data object to display in this column.
 * @property {boolean} [sortable=true] - Whether the column is sortable.
 * @property {boolean} [searchable=true] - Whether the column is searchable.
 * @property {(value: any, row: Object.<string, any>) => React.ReactNode} [renderCell] - Custom render function for the cell.
 */

/**
 * @typedef {Object} DataTableRow
 * @property {string} [id] - Unique ID for the row.
 * @property {boolean} [selected=false] - Whether the row is selected.
 * @property {Object.<string, any>} [data] - The actual data for the row.
 */

/**
 * @typedef {Object} DataTableProps
 * @property {DataTableColumn[]} columns - Array of column definitions.
 * @property {DataTableRow[]} data - Array of row data.
 * @property {string} [tableId="datatable-instance"] - Unique ID for the table element.
 * @property {boolean} [multiSelect=true] - Allow multiple row selection.
 * @property {boolean} [rowNavigation=false] - Enable keyboard row navigation.
 */

/**
 * A React component that wraps the simple-datatables library.
 *
 * @param {DataTableProps} props - The properties for the DataTable component.
 * @returns {JSX.Element} The rendered DataTable component.
 */
const DataTable = ({ columns, data, tableId = "datatable-instance", multiSelect = true, rowNavigation = false }) => {
  const tableRef = useRef(null);
  const dataTableInstance = useRef(null);

  useEffect(() => {
    // Dynamically load simple-datatables if not already loaded
    const loadSimpleDatatables = (): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && typeof window.simpleDatatables !== 'undefined') {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = '/assets/js/lib/simple-datatables.min.js'; // Adjust path as needed
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);

        const link = document.createElement('link');
        link.href = '/assets/css/lib/dataTables.min.css'; // Adjust path as needed
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      });
    };

    loadSimpleDatatables().then(() => {
      initializeDataTable();
    });

    return () => {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
      }
    };
  }, [columns, data, tableId, multiSelect, rowNavigation]);

  const initializeDataTable = () => {
    if (tableRef.current && typeof window.simpleDatatables !== 'undefined') {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
      }

      const options = {
        data: {
          headings: columns.map(col => col.heading),
          data: data.map(row =>
            columns.map(col => {
              if (col.renderCell) {
                return ReactDOMServer.renderToString(col.renderCell(row.data[col.data], row.data));
              }
              return row.data[col.data];
            })
          )
        },
        columns: columns.map((col, index) => ({
          select: index,
          sortable: col.sortable,
          searchable: col.searchable,
        })),
        // Add rowRender for selection if needed, similar to the example
        rowRender: (row, tr, _index) => {
            const rowData = data[_index];
            if (!tr.attributes) {
                tr.attributes = {};
            }
            if (!tr.attributes.class) {
                tr.attributes.class = "";
            }
            if (rowData && rowData.selected) {
                tr.attributes.class += " selected";
            } else {
                tr.attributes.class = tr.attributes.class.replace(" selected", "");
            }
            return tr;
        }
      };



      dataTableInstance.current = new window.simpleDatatables.DataTable(tableRef.current, options);

      // Event listener for row selection
      dataTableInstance.current.on("datatable.selectrow", (rowIndex, event) => {
        event.preventDefault();
        const rowData = data[rowIndex];
        if (rowData) {
          if (rowData.selected) {
            rowData.selected = false;
          } else {
            if (!multiSelect) {
              data.forEach(r => r.selected = false);
            }
            rowData.selected = true;
          }
          // Re-render the table to reflect selection changes
          dataTableInstance.current.update();
        }
      });
    }
  };

  return (
    <table id={tableId} ref={tableRef} className="datatable-table w-full">
      <caption className="sr-only">Data table displaying {columns.map(col => col.heading).join(', ')}</caption>
      {/* Table content will be managed by simple-datatables */}
    </table>
  );
};

export default DataTable;