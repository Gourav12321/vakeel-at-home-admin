"use client";

import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";

import { apiUrls } from "@/apis";
import { useEffect } from "react";

const Dashboard = () => {
  const { getQuery } = useGetQuery();

  useEffect(() => {
    getQuery({
      url: apiUrls.auth.statistics,
      onSuccess: (res) => {
        console.log(res);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  }, []);

  return (
    <div className="text-slate-950">
      <Title title={"Dashboard"} />
    </div>
  );
};

export default Dashboard;
