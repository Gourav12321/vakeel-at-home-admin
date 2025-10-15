"use client";

import Title from "@/components/Title/Title";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useParams } from "next/navigation";

const QueryDetailsPage = () => {
  const params = useParams();
  const queryId = params.id;

  return (
    <>
      <BackHeader />
      <Title title={`Query ${queryId} Detail`} />

      <div className="mt-8">
        {/* Main content container */}
        <div className="mx-auto space-y-4">
          {/* Query 1 Information Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    Q{queryId}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  Query {queryId}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur. Purus amet at vel a
                  faucibus. Volutpat eget erat pharetra.
                </p>
              </div>
            </div>
          </div>

          {/* Business 1 Entries */}
          <div className="space-y-4">
            {/* First Business Entry */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      B1
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Business 1
                  </h3>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-orange-200"></div>
                    </div>
                    <span className="text-gray-600">Image Name</span>
                    <span className="text-gray-400 text-sm ml-auto">
                      10.00 AM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Business Entry */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      B1
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Business 1
                  </h3>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-red-200 to-pink-200"></div>
                    </div>
                    <span className="text-gray-600">Video Name</span>
                    <span className="text-gray-400 text-sm ml-auto">
                      10.00 AM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shano's Chat Message */}
          <div className="flex justify-end">
            <div className="max-w-xs">
              <div className="flex items-center justify-end space-x-2 mb-2">
                <span className="text-sm font-bold text-gray-800">Shano</span>
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-medium">S</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-200 rounded-2xl rounded-br-md px-4 py-3">
                <p className="text-gray-800 text-sm">
                  Looks Fine, What's the next Progress?
                </p>
              </div>
              <div className="text-right mt-1">
                <span className="text-gray-400 text-xs">10.00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QueryDetailsPage;
