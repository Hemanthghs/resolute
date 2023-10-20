"use client";
import { Button } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProposalsInVoting } from "../../../store/features/govSlice";

const GovTest = () => {
  const proposals = useSelector((state) => state.gov.active.proposals);

  const dispatch = useDispatch();

  return (
    <div>
      <Button
        onClick={() => {
          dispatch(
            getProposalsInVoting({
              baseURL: "https://api.resolute.vitwit.com/cosmos_api",
              voter: "cosmos1y0hvu8ts6m8hzwp57t9rhdgvnpc7yltglu9nrk",
              key: null,
              limit: null,
              chainID: "cosmoshub-4",
            })
          );
        }}
      >
        Click Me
      </Button>
      <br />
      {JSON.stringify(proposals)}
    </div>
  );
};

export default GovTest;
