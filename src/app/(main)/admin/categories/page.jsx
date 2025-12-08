"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import Loader from "@/components/Loader/Loader";
import CategoryForm from "@/components/CategoryForm/CategoryForm";

import { Button, Modal, Space, Empty, Table } from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

const Categories = () => {
  const { getQuery, loading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [categories, setCategories] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = () => {
    getQuery({
      url: apiUrls.categories.getAllCategories,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.categories)
          ? response?.data?.categories
          : [];

        const mappedData = dataList.map((item) => ({
          category: item?.category || "N/A",
          icon: item?.icon || null,
          createdAt: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          _id: item?._id,
        }));

        setCategories(mappedData);
      },
      onFail: (err) => {
        console.log("Fetch failed:", err);
        toast.error("Failed to fetch categories");
      },
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormVisible(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setFormVisible(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;

    deleteQuery({
      url: `${apiUrls.categories.deleteCategory}/${categoryToDelete._id}`,
      onSuccess: (response) => {
        toast.success("Category deleted successfully");
        setCategories((prevData) =>
          prevData.filter((item) => item._id !== categoryToDelete._id)
        );
        setDeleteModalVisible(false);
        setCategoryToDelete(null);
      },
      onFail: (err) => {
        console.log("Delete failed:", err);
        toast.error(
          err?.response?.data?.message || "Failed to delete category"
        );
        setDeleteModalVisible(false);
        setCategoryToDelete(null);
      },
    });
  };

  const handleFormClose = () => {
    setFormVisible(false);
    setSelectedCategory(null);
  };

  const handleFormSuccess = () => {
    fetchCategories();
  };

  // Table columns configuration
  const columns = [
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      render: (icon) =>
        icon ? (
          <img
            src={icon}
            alt="category"
            className="w-12 h-12 object-contain rounded"
          />
        ) : (
          <span className="text-gray-400">No icon</span>
        ),
    },
    {
      title: "Category Name",
      dataIndex: "category",
      key: "category",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<Edit2 size={16} />}
            onClick={() => handleEditCategory(record)}
          >
            Edit
          </Button>
          <Button
            type="default"
            size="small"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => handleDeleteClick(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Title title="Categories Management" />
        <Button
          type="primary"
          icon={<Plus size={20} />}
          onClick={handleAddCategory}
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <Empty
            description="No categories found"
            style={{ marginTop: 50, marginBottom: 50 }}
          >
            <Button
              type="primary"
              onClick={handleAddCategory}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Category
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            loading={loading}
          />
        </div>
      )}

      {/* Category Form Modal */}
      <CategoryForm
        visible={formVisible}
        category={selectedCategory}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Category"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCategoryToDelete(null);
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
            Are you sure you want to delete this category? This action cannot be
            undone.
          </p>
          {categoryToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-800 mb-2">Category Name:</p>
              <p className="text-gray-600 mb-3">{categoryToDelete.category}</p>
              <p className="font-medium text-gray-800 mb-2">Created Date:</p>
              <p className="text-gray-600">{categoryToDelete.createdAt}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Categories;
