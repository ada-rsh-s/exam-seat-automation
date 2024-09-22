import { SearchOutlined } from "@ant-design/icons/lib";
import { ConfigProvider, DatePicker, Input, Space } from "antd";
import DataTable, { createTheme } from "react-data-table-component";

createTheme("custom", {
  text: {
    primary: "#268bd2",
  },
  background: {
    default: "#f0f9ff",
  },
  divider: {
    default: "#636566",
  },
});

const tableCustomStyles = {
  headCells: {
    style: {
      fontSize: "16px",
      fontWeight: "bold",
      borderStyle: "double",
      borderColor: "#c7cfd2",
      borderWidth: "2px",
    },
  },
  cells: {
    style: {
      fontSize: "18px",
      borderStyle: "double",
      borderColor: "#c7cfd2",
      borderWidth: "0.2px",
    },
  },
};

const TableContainer = ({
  tableName,
  columns,
  filteredResults,
  searchTerm,
  setSearchTerm,
  academicYear,
  yearChanged,
  disabledDate,
  selectableRows,
  selectableRowSelected,
  handleRowSelected,
  dateTime,
}) => {
  return (
    <div className="table-container">
      <div className="header-container">
        <div className="heading-left">
          <h6 className="tableheading">{tableName}</h6>
        </div>
        {dateTime && <h6 className="date-time">{dateTime}</h6>}

        {academicYear != null && (
          <ConfigProvider
            theme={{
              token: {
                colorText: "#07314a",
                fontWeightStrong: 800,
                colorPrimary: "#07314a",
                colorBgElevated: "#f0f9ff",
              },
            }}
          >
            <Space>
              <DatePicker
                size="large"
                placeholder="Select Academic Year"
                disabledDate={disabledDate}
                defaultValue={academicYear}
                value={academicYear}
                onChange={yearChanged}
                picker="year"
              />
            </Space>
          </ConfigProvider>
        )}
        <div className="search-container">
          <Input
            size="large"
            placeholder="Type to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </div>
      </div>
      <div className="table-wrapper">
        <div className="my-table">
          <DataTable
            columns={columns}
            data={filteredResults}
            defaultSortAsc={true}
            pagination={true}
            paginationPerPage={10}
            theme="custom"
            customStyles={tableCustomStyles}
            selectableRows={selectableRows}
            selectableRowSelected={selectableRowSelected}
            onSelectedRowsChange={handleRowSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default TableContainer;
