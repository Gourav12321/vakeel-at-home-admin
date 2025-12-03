"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import Loader from "@/components/Loader/Loader";
import BannerForm from "@/components/BannerForm/BannerForm";

import { Button, Modal, Image, Space, Empty } from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

const Banners = () => {
  const { getQuery, loading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [banners, setBanners] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const fetchBanners = () => {
    getQuery({
      url: apiUrls.banners.getAllBanners,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.banners)
          ? response?.data?.banners
          : [];

        const mappedData = dataList.map((item) => ({
          title: item?.title || "N/A",
          imageLink: item?.imageLink || null,
          createdAt: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          _id: item?._id,
        }));

        setBanners(mappedData);
      },
      onFail: (err) => {
        console.log("Fetch failed:", err);
        toast.error("Failed to fetch banners");
      },
    });
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = () => {
    setSelectedBanner(null);
    setFormVisible(true);
  };

  const handleEditBanner = (banner) => {
    setSelectedBanner(banner);
    setFormVisible(true);
  };

  const handleDeleteClick = (banner) => {
    setBannerToDelete(banner);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!bannerToDelete) return;

    deleteQuery({
      url: `${apiUrls.banners.deleteBanner}/${bannerToDelete._id}`,
      onSuccess: (response) => {
        toast.success("Banner deleted successfully");
        setBanners((prevData) =>
          prevData.filter((item) => item._id !== bannerToDelete._id)
        );
        setDeleteModalVisible(false);
        setBannerToDelete(null);
      },
      onFail: (err) => {
        console.log("Delete failed:", err);
        toast.error("Failed to delete banner");
        setDeleteModalVisible(false);
        setBannerToDelete(null);
      },
    });
  };

  const handleFormClose = () => {
    setFormVisible(false);
    setSelectedBanner(null);
  };

  const handleFormSuccess = () => {
    fetchBanners();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Title title="Banners Management" />
        <Button
          type="primary"
          icon={<Plus size={20} />}
          onClick={handleAddBanner}
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <Empty
            description="No banners found"
            style={{ marginTop: 50, marginBottom: 50 }}
          >
            <Button
              type="primary"
              onClick={handleAddBanner}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Banner
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image Container */}
              <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                {banner.imageLink ? (
                  <Image
                    src={banner.imageLink}
                    alt={banner.title}
                    className="w-full h-full object-contain object-center"
                    preview={{
                      mask: "View",
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                  {banner.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Created: {banner.createdAt}
                </p>

                {/* Actions */}
                <Space className="w-full">
                  <Button
                    type="default"
                    icon={<Edit2 size={16} />}
                    onClick={() => handleEditBanner(banner)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    type="default"
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDeleteClick(banner)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </Space>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Form Modal */}
      <BannerForm
        visible={formVisible}
        banner={selectedBanner}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Banner"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setBannerToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
        }}
        cancelButtonProps={{ disabled: deleteLoading }}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this banner? This action cannot be
            undone.
          </p>
          {bannerToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                {bannerToDelete.imageLink && (
                  <img
                    src={bannerToDelete.imageLink}
                    alt={bannerToDelete.title}
                    className="w-full h-32 object-contain rounded mb-3"
                  />
                )}
              </div>
              <p className="font-medium text-gray-800">Title:</p>
              <p className="text-gray-600">{bannerToDelete.title}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Banners;
