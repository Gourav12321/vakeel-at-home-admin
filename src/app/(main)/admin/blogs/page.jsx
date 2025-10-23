"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";
import Loader from "@/components/Loader/Loader";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { Select } from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const Blogs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { patchQuery, loading: toggleLoading } = usePatchQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [togglingId, setTogglingId] = useState(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.blogs?.getAllBlogs}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.blogs)
          ? response?.data?.blogs
          : [];
        setTotalDocuments(response.data.pagination.totalBlogs);

        const mappedData = dataList.map((item) => ({
          title: item?.title || "N/A",
          authorName: item?.author?.fullName || "N/A",
          email: item?.author?.email || "N/A",
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          updatedAt: item?.updatedAt,
          isVerified: item?.isVerified,
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

  const handleToggleVerification = (blogId, currentStatus) => {
    setTogglingId(blogId);
    patchQuery({
      url: `${apiUrls.blogs.verifyBlog.replace("/id", `/${blogId}`)}`,
      onSuccess: (response) => {
        toast.success("Blog verification status updated successfully");
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === blogId ? { ...item, isVerified: !currentStatus } : item
          )
        );
        setTogglingId(null);
      },
      onFail: (err) => {
        console.log("Toggle failed:", err);
        toast.error("Failed to update verification status");
        setTogglingId(null);
      },
    });
  };

  const columns = [
    {
      Header: "Title",
      accessor: "title",
      width: 200,
    },
    {
      Header: "Author Name",
      accessor: "authorName",
      width: 150,
    },
    {
      Header: "Email",
      accessor: "email",
      width: 180,
    },
    {
      Header: "Verification Status",
      accessor: "isVerified",
      width: 180,
      Cell: (value, record) => {
        return (
          <Select
            value={value ? "verified" : "not_verified"}
            onChange={(newValue) => {
              handleToggleVerification(record._id, value);
            }}
            loading={togglingId === record._id}
            disabled={togglingId === record._id}
            style={{ width: "100%", minWidth: "160px" }}
            size="small"
            className="verification-status-select"
          >
            <Select.Option value="not_verified">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Not Verified</span>
              </div>
            </Select.Option>
            <Select.Option value="verified">
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

  return (
    <>
      <Title title={"Blogs List"} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          <EnhancedTable
            columns={columns}
            data={tableData}
            showDate={true}
            showActions={true}
            onView={(row) =>
              `/admin/blogs/${row._id}/?page=${page}&limit=${limit}`
            }
            entryText={`Total Blogs: ${totalDocuments}`}
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

export default Blogs;
