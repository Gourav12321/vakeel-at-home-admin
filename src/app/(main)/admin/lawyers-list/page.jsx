"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import Loader from "@/components/Loader/Loader";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { Select } from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const Lawyers = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { putQuery, loading: toggleLoading } = usePutQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.lawyers.getAllLawyers}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.lawyers)
          ? response?.data?.lawyers
          : [];
        setTotalDocuments(response.data.pagination.totalLawyers);

        const mappedData = dataList.map((item) => ({
          fullName: item?.fullName || "N/A",
          mobileNumber: item?.mobileNumber || "N/A",
          email: item?.email || "N/A",
          experience: item?.experience || 0,
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          updatedAt: item?.updatedAt,
          isProfileUpdated: item?.isProfileUpdated,
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

  const handleToggleStatus = (lawyerId, currentStatus) => {
    setTogglingId(lawyerId);
    putQuery({
      url: `${apiUrls.auth.toggleStatus}/${lawyerId}`,
      onSuccess: (response) => {
        toast.success("Status updated successfully");
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === lawyerId
              ? { ...item, isProfileUpdated: !currentStatus }
              : item
          )
        );
        setTogglingId(null);
      },
      onFail: (err) => {
        console.log("Toggle failed:", err);
        toast.error("Failed to update status");
        setTogglingId(null);
      },
    });
  };

  const handleDelete = ({ lawyerId }) => {
    if (window.confirm(`Are you sure you want to delete this lawyer?`)) {
      setDeletingId(lawyerId);
      deleteQuery({
        url: `${apiUrls.auth.deleteUser}/${lawyerId}`,
        onSuccess: (response) => {
          toast.success("Lawyer deleted successfully");
          setTableData((prevData) =>
            prevData.filter((item) => item._id !== lawyerId)
          );
          setTotalDocuments((prev) => prev - 1);
          setDeletingId(null);
        },
        onFail: (err) => {
          console.log("Delete failed:", err);
          toast.error("Failed to delete lawyer");
          setDeletingId(null);
        },
      });
    }
  };

  const handleEdit = (row) => {
    router.push(
      `/admin/lawyers-list/${row._id}/edit?page=${page}&limit=${limit}`
    );
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
    },
    {
      Header: "Update Profile",
      accessor: "isProfileUpdated",
      width: 160,
      Cell: (value, record) => {
        return (
          <Select
            value={value ? "updated" : "not_updated"}
            onChange={(newValue) => {
              handleToggleStatus(record._id, value);
            }}
            loading={togglingId === record._id}
            disabled={togglingId === record._id}
            style={{ width: "100%", minWidth: "140px" }}
            size="small"
            className="profile-status-select"
          >
            <Select.Option value="not_updated">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Not Verified</span>
              </div>
            </Select.Option>
            <Select.Option value="updated">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Verified</span>
              </div>
            </Select.Option>
          </Select>
        );
      },
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
            onEdit={handleEdit}
            onDelete={(row) => handleDelete({ lawyerId: row._id })}
            deletingId={deletingId}
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
