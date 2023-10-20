"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import govService from "../../services/govService";

const initialState = {
  loading: 0,
  active: {
    proposals: {},
    status: "idle",
    errMsg: "",
  },
  deposit: {
    proposals: {},
    status: "idle",
    errMsg: "",
  },
  depositParams: {},
  tally: {
    status: "idle",
    errMsg: "",
    proposalTally: {},
  },
  votes: {
    status: "idle",
    errMsg: "",
    proposals: {},
  },
  tx: {
    status: "",
  },
  proposalInfo: {
    status: "idle",
    error: "",
    proposalInfo: {},
  },
};

export const getProposal = createAsyncThunk(
  "gov/proposal-info",
  async (data, { rejectWithValue }) => {
    try {
      const response = await govService.proposal(data.baseURL, data.proposalId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getProposalsInDeposit = createAsyncThunk(
  "gov/deposit-proposals",
  async (data) => {
    const response = await govService.proposals(
      data.baseURL,
      data?.key,
      data?.limit,
      1
    );
    return {
      chainID: data.chainID,
      data: response.data,
    };
  }
);

export const getProposalsInVoting = createAsyncThunk(
  "gov/active-proposals",
  async (data, { dispatch }) => {
    const response = await govService.proposals(
      data.baseURL,
      data.key,
      data.limit,
      2
    );
    if (response?.data?.proposals?.length > 0) {
      const proposals = response?.data?.proposals;
      for (let i = 0; i < proposals.length; i++) {
        dispatch(
          getProposalTally({
            baseURL: data.baseURL,
            proposalId: proposals[i].proposal_id,
            chainID: data.chainID,
          })
        );

        dispatch(
          getVotes({
            baseURL: data.baseURL,
            proposalId: proposals[i].proposal_id,
            voter: data.voter,
            chainID: data.chainID,
          })
        );
      }
    }
    return {
      chainID: data.chainID,
      data: response.data,
    };
  }
);

export const getProposalTally = createAsyncThunk(
  "gov/proposal-tally",
  async (data) => {
    const response = await govService.tally(data.baseURL, data.proposalId);
    response.data.tally.proposal_id = data.proposalId;
    return {
      chainID: data.chainID,
      data: response.data,
    };
  }
);

export const getVotes = createAsyncThunk("gov/voter-votes", async (data) => {
  const response = await govService.votes(
    data.baseURL,
    data.proposalId,
    data.voter,
    data.key,
    data.limit
  );
  response.data.vote.proposal_id = data.proposalId;
  return {
    chainID: data.chainID,
    data: response.data,
  };
});

export const getDepositParams = createAsyncThunk(
  "gov/deposit-params",
  async (data, { rejectWithValue }) => {
    try {
      const response = await govService.depositParams(data.baseURL);
      return {
        chainID: data.chainID,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const proposalsSlice = createSlice({
  name: "gov",
  initialState,
  reducers: {
    resetLoading: (state, action) => {
      const { chainsCount } = action.payload;
      state.loading += chainsCount;
    },
    resetTx: (state) => {
      state.tx = {
        status: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProposalsInVoting.pending, (state, action) => {
        const chainID = action.meta?.arg?.chainID;
        const chainData = state.active[chainID] || {};
        chainData.status = "pending";
        chainData.errMsg = "";
        state.active[chainID] = chainData;
        state.loading++;
      })
      .addCase(getProposalsInVoting.fulfilled, (state, action) => {
        console.log("here....");
        console.log(action.payload);
        const chainID = action.payload?.chainID || "";
        if (chainID.length > 0) {
          let result = {
            status: "idle",
            errMsg: "",
            proposals: action.payload?.data?.proposals,
            pagination: action.payload?.pagination,
          };
          state.active[chainID] = result;
          console.log(state.active?.["cosmoshub-4"]);
          state.loading--;
        }
      })
      .addCase(getProposalsInVoting.rejected, (state, action) => {
        const chainID = action.meta?.arg?.chainID;
        const chainData = state.active[chainID] || {};
        chainData.status = "rejected";
        chainData.errMsg = action.error.message;
        state.active[chainID] = chainData;
        state.loading--;
      });

    builder
      .addCase(getProposalsInDeposit.pending, (state, action) => {
        const chainID = action.meta?.arg?.chainID;
        const chainData = state.deposit[chainID] || {};
        chainData.status = "pending";
        chainData.errMsg = "";
        state.deposit[chainID] = chainData;
        state.loading++;
      })
      .addCase(getProposalsInDeposit.fulfilled, (state, action) => {
        const chainID = action.payload?.chainID || "";
        if (chainID.length > 0) {
          let result = {
            status: "idle",
            errMsg: "",
            proposals: action.payload?.data?.proposals,
            pagination: action.payload?.pagination,
          };
          state.deposit[chainID] = result;
        }
        state.loading--;
      })
      .addCase(getProposalsInDeposit.rejected, (state, action) => {
        const chainID = action.meta?.arg?.chainID;
        const chainData = state.deposit[chainID] || {};
        chainData.status = "rejected";
        chainData.errMsg = action.error.message;
        state.deposit[chainID] = chainData;
        state.loading--;
      });

    // tally
    builder
      .addCase(getProposalTally.pending, () => {})
      .addCase(getProposalTally.fulfilled, (state, action) => {
        const chainID = action.payload.chainID;
        let result = {
          status: "idle",
          errMsg: "",
          proposalTally: state.tally[chainID]?.proposalTally || {},
        };

        result.proposalTally[action.payload?.data?.tally?.proposal_id] =
          action.payload?.data.tally;
        state.tally[chainID] = result;
      })
      .addCase(getProposalTally.rejected, () => {});

    // votes
    builder
      .addCase(getVotes.pending, () => {})
      .addCase(getVotes.fulfilled, (state, action) => {
        const chainID = action.payload.chainID;
        let result = {
          status: "idle",
          errMsg: "",
          proposals: [],
        };

        result.proposals[action.payload?.data?.vote?.proposal_id] =
          action.payload.data;

        state.votes[chainID] = result;
      })
      .addCase(getVotes.rejected, (state, action) => {});

    // proposal-info
    builder
      .addCase(getProposal.pending, (state) => {
        state.proposalInfo.status = "pending";
      })
      .addCase(getProposal.fulfilled, (state, action) => {
        state.proposalInfo.status = "idle";
        const chainID = action.meta.arg?.chainID || "";
        if (chainID.length > 0) {
          const old = state.active[chainID];
          if (old?.proposals?.length > 0) {
            old.proposals = [action.payload.proposal];
            state.active[chainID] = old;
          } else {
            state.active[chainID] = {
              status: "idle",
              errMsg: "",
              proposals: [action.payload?.proposal],
              pagination: {},
            };
          }
        }
      })
      .addCase(getProposal.rejected, (state, payload) => {
        state.proposalInfo.status = "rejected";
        state.proposalInfo.error =
          payload?.payload?.message || payload.error.message;
      });

    //deposit-params
    builder
      .addCase(getDepositParams.pending, () => {})
      .addCase(getDepositParams.fulfilled, (state, action) => {
        state.depositParams.status = "idle";
        const chainID = action.payload?.chainID || "";
        if (chainID.length > 0) {
          state.depositParams[chainID] = {
            status: "idle",
            errMsg: "",
            depositParams: action.payload?.data?.deposit_params,
          };
        }
      })
      .addCase(getDepositParams.rejected, () => {});
  },
});

export const { resetTx, resetLoading } = proposalsSlice.actions;
export default proposalsSlice.reducer;
