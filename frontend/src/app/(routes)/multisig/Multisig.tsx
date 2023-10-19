"use client";
import React, { useState } from "react";
import CustomTabsGroup, { TabPanel } from "staking/components/CustomTabsGroup";

const Multisig = () => {
  const [tab, setTab] = useState(0);
  const handleTabChange = (value: number) => {
    setTab(value);
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <CustomTabsGroup
          handleTabChange={handleTabChange}
          tabs={[
            { title: "Recent", disabled: false },
            { title: "Create new Multisig", disabled: false },
            { title: "All Multisig Accounts", disabled: false },
          ]}
        />
      </div>
      <TabPanel value={tab} index={0}>
        Recent
      </TabPanel>
      <TabPanel value={tab} index={1}>
        Create
      </TabPanel>
      <TabPanel value={tab} index={2}>
        All
      </TabPanel>
    </>
  );
};

export default Multisig;
