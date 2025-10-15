"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import Loader from "@/components/Loader/Loader";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Button, Switch } from "antd";

const Lawyers = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { putQuery, loading: toggleLoading } = usePutQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.lawyers.getAllLawyers}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        console.log("API Response:", response);
        const dataList = Array.isArray(response?.data?.lawyers)
          ? response?.data?.lawyers
          : [];
        console.log("Data List:", dataList);
        setTotalDocuments(response.data.pagination.totalLawyers);

        const mappedData = dataList.map((item) => ({
          fullName: item?.fullName || "N/A",
          mobileNumber: item?.mobileNumber || "N/A",
          email: item?.email || "N/A",
          experience: item?.experience || 0,
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          updatedAt: item?.updatedAt,
          isProfileUpdated: item?.isProfileUpdated === true,
          _id: item?._id,
        }));

        console.log("Mapped Data:", mappedData);
        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

  const handleToggleStatus = (lawyerId, currentStatus) => {
    putQuery({
      url: `${apiUrls.lawyers.toggleStatus}/${lawyerId}`,
      putData: {},
      onSuccess: (response) => {
        toast.success("Status updated successfully");
        // Update the local state
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === lawyerId
              ? { ...item, isProfileUpdated: !currentStatus }
              : item
          )
        );
      },
      onFail: (err) => {
        console.log("Toggle failed:", err);
        toast.error("Failed to update status");
      },
    });
  };

  const columns = [
    {
      Header: "Full Name",
      accessor: "fullName",
      width: 180,
    },
    {
      Header: "Mobile Number",
      accessor: "mobileNumber",
      width: 140,
    },
    {
      Header: "Email ID",
      accessor: "email",
      width: 180,
    },
    {
      Header: "Experience",
      accessor: "experience",
      width: 100,
      Cell: ({ value }) => <span className="font-medium">{value} years</span>,
    },
    {
      Header: "Profile Status",
      accessor: "isProfileUpdated",
      width: 120,
      Cell: ({ value, row }) => (
        <Switch
          checked={value}
          loading={toggleLoading}
          onChange={() => handleToggleStatus(row._id, value)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      Header: "Created",
      accessor: "date",
      width: 100,
    },
  ];

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handlePageChange = (newPage) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", newPage);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleLimitChange = (newLimit) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("limit", newLimit);
    newSearchParams.set("page", 1);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  // const filterColumns = ["serviceType"];
  // const filterColumns = ["serviceType", "name"];

  return (
    <>
      <Title title={"Lawyers List"} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          <EnhancedTable
            columns={columns}
            data={tableData}
            // filterColumns={filterColumns}
            showDate={true}
            showActions={true}
            onView={(row) =>
              `/admin/lawyers-list/${row._id}/?page=${page}&limit=${limit}`
            }
            entryText={`Total Requests: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        </div>
      )}
    </>
  );
};

export default Lawyers;
