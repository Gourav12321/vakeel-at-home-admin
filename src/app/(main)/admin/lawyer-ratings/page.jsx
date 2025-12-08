"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import Loader from "@/components/Loader/Loader";

import {
  Card,
  Rate,
  Tag,
  Pagination,
  Empty,
  Avatar,
  Divider,
  Row,
  Col,
  Spin,
} from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, User, Phone, DollarSign, Clock } from "lucide-react";

const LawyerRatings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();

  const [tableData, setTableData] = useState([]);
  const [totalLawyers, setTotalLawyers] = useState(0);
  const [expandedLawyerId, setExpandedLawyerId] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState({});

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.lawyerRatings?.getUserRatingsByLawyers}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data) ? response?.data : [];
        setTotalLawyers(response?.pagination?.total_lawyers || 0);
        setTableData(dataList);
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch lawyer ratings");
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    params.set("limit", limit);
    router.push(`?${params.toString()}`);
  };

  const toggleExpanded = (lawyerId) => {
    setExpandedLawyerId(expandedLawyerId === lawyerId ? null : lawyerId);
  };

  const renderRatingCard = (lawyer) => {
    const isExpanded = expandedLawyerId === lawyer.lawyer_id;

    return (
      <Card
        key={lawyer.lawyer_id}
        className="mb-4 hover:shadow-lg transition-shadow duration-300"
        bordered={true}
      >
        {/* Header Section */}
        <div
          onClick={() => toggleExpanded(lawyer.lawyer_id)}
          className="cursor-pointer"
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={4} className="flex justify-center">
              <Avatar
                size={80}
                src={lawyer.lawyer_photo}
                icon={<User size={40} />}
              />
            </Col>
            <Col xs={24} sm={20}>
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {lawyer.lawyer_name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Star
                      size={20}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-lg font-semibold">
                      {lawyer.average_rating.toFixed(1)}
                    </span>
                    <Tag color="blue">
                      {lawyer.total_ratings}{" "}
                      {lawyer.total_ratings === 1 ? "Rating" : "Ratings"}
                    </Tag>
                  </div>
                  <Rate value={Math.round(lawyer.average_rating)} disabled />
                </Col>
                <Col xs={24} sm={12} className="text-right">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">
                      {lawyer.total_ratings}
                    </span>{" "}
                    total ratings
                  </p>
                  <p className="text-sm text-gray-600">
                    Average:{" "}
                    <span className="font-semibold">
                      {lawyer.average_rating.toFixed(2)}
                    </span>{" "}
                    / 5
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {/* Expanded Ratings Section */}
        {isExpanded && (
          <>
            <Divider />
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-4">
                User Ratings & Reviews
              </h4>
              {lawyer.ratings && lawyer.ratings.length > 0 ? (
                <div className="space-y-4">
                  {lawyer.ratings.map((rating, index) => (
                    <Card
                      key={index}
                      size="small"
                      className="bg-gray-50"
                      bordered={true}
                    >
                      <Row gutter={[16, 12]}>
                        <Col xs={24} sm={20}>
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar size={32} icon={<User size={16} />} />
                            <div>
                              <p className="font-semibold text-gray-800">
                                {rating.user_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {moment(rating.rated_at).format(
                                  "DD-MM-YYYY HH:mm"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="mb-2">
                            <Rate value={rating.rating} disabled />
                            <span className="ml-2 font-semibold">
                              {rating.rating}/5
                            </span>
                          </div>
                          {rating.review_text && (
                            <p className="text-gray-700 text-sm italic">
                              "{rating.review_text}"
                            </p>
                          )}
                        </Col>
                        <Col xs={24} sm={4}>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-1">
                              <DollarSign
                                size={14}
                                className="text-green-600"
                              />
                              <span className="text-gray-600">
                                ₹
                                {parseFloat(rating.total_booking_amt).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} className="text-blue-600" />
                              <span className="text-gray-600">
                                {parseFloat(
                                  rating.call_chat_duration_in_minutes
                                ).toFixed(2)}{" "}
                                min
                              </span>
                            </div>
                            <Tag
                              color={
                                rating.booking_status === "3"
                                  ? "green"
                                  : rating.booking_status === "2"
                                  ? "orange"
                                  : "red"
                              }
                            >
                              Status: {rating.booking_status}
                            </Tag>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty description="No ratings yet" />
              )}
            </div>
          </>
        )}
      </Card>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <Title
        title="Lawyer Ratings"
        subtitle="View ratings given by users during bookings"
      />

      {tableData && tableData.length > 0 ? (
        <>
          <div className="space-y-4">
            {tableData.map((lawyer) => renderRatingCard(lawyer))}
          </div>

          <div className="flex justify-end mt-6">
            <Pagination
              current={page}
              pageSize={limit}
              total={totalLawyers}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Card className="text-center py-12">
          <Empty description="No lawyer ratings found" />
        </Card>
      )}
    </div>
  );
};

export default LawyerRatings;
