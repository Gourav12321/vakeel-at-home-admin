"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import Loader from "@/components/Loader/Loader";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Button } from "antd";

const QueryManagement = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.getAllCompanies}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data) ? response.data : [];
        setTotalDocuments(response.totalDocuments);

        const mappedData = dataList.map((item) => ({
          companyName: item?.companyName,
          companyType: item?.companyType || "N/A",
          companyPaidUpCapital: item?.companyPaidUpCapital || "N/A",
          companyEmailId: item?.companyEmailId || "N/A",
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

  const columns = [
    {
      Header: "Company Name",
      accessor: "companyName",
      width: 200,
    },
    {
      Header: "Company Type",
      accessor: "companyType",
      width: 150,
    },
    {
      Header: "Paid Up Capital",
      accessor: "companyPaidUpCapital",
      width: 200,
    },
    {
      Header: "Office Email Id",
      accessor: "companyEmailId",
      width: 200,
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
      <Title title={"Query Management"} />

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
              `/vendor/rfq-requests/rfq-details/${row._id}/?page=${page}&limit=${limit}`
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

export default QueryManagement;
