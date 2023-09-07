import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SendMsg } from "../../txns/bank";
import bankService from "./service";
import { setError, setTxHash } from "../common/commonSlice";
import { signAndBroadcast } from "../../utils/signing";
import { parseBalance } from "../../utils/denom";
import { IBCTransferMsg, SignMsg, VerifyMsg } from "../../txns/gov/deposit";
import { StdSignature } from "@cosmjs/amino";

const initialState = {
  balances: {},
  balance: {
    balance: {},
    status: "idle",
    errMsg: "",
  },
  tx: {
    status: "idle",
  },
  multiSendTxRes: {},
};

export const getBalances = createAsyncThunk("bank/balances", async (data) => {
  const response = await bankService.balances(
    data.baseURL,
    data.address,
    data.pagination
  );
  return {
    chainID: data.chainID,
    data: response.data,
  };
});

export const getBalance = createAsyncThunk("bank/balance", async (data) => {
  const response = await bankService.balance(
    data.baseURL,
    data.address,
    data.denom
  );
  return response.data;
});

export const multiTxns = createAsyncThunk(
  "bank/multi-txs",
  async (data, { rejectWithValue, fulfillWithValue, dispatch }) => {
    try {
      const result = await signAndBroadcast(
        data.chainId,
        data.aminoConfig,
        data.prefix,
        data.msgs,
        860000,
        data.memo,
        `${data.feeAmount}${data.denom}`,
        data.rest,
        data.feegranter?.length > 0 ? data.feegranter : undefined
      );
      if (result?.code === 0) {
        dispatch(
          setTxHash({
            hash: result?.transactionHash,
          })
        );
        return fulfillWithValue({ txHash: result?.transactionHash });
      } else {
        dispatch(
          setError({
            type: "error",
            message: result?.rawLog,
          })
        );
        return rejectWithValue(result?.rawLog);
      }
    } catch (error) {
      dispatch(
        setError({
          type: "error",
          message: error.message,
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const txBankSend = createAsyncThunk(
  "bank/tx-bank-send",
  async (data, { rejectWithValue, fulfillWithValue, dispatch }) => {
    try {
      const msg = SendMsg(data.from, data.to, data.amount, data.denom);
      const result = await signAndBroadcast(
        data.chainId,
        data.aminoConfig,
        data.prefix,
        [msg],
        860000,
        "",
        `${data.feeAmount}${data.denom}`,
        data.rest,
        data.feegranter?.length > 0 ? data.feegranter : undefined
      );
      if (result?.code === 0) {
        dispatch(
          setTxHash({
            hash: result?.transactionHash,
          })
        );
        return fulfillWithValue({ txHash: result?.transactionHash });
      } else {
        dispatch(
          setError({
            type: "error",
            message: result?.rawLog,
          })
        );
        return rejectWithValue(result?.rawLog);
      }
    } catch (error) {
      dispatch(
        setError({
          type: "error",
          message: error.message,
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const txIBCSend = createAsyncThunk(
  "bank/tx-bank-send",
  async (data, { rejectWithValue, fulfillWithValue, dispatch }) => {
    try {
      const msg = IBCTransferMsg("transfer", "channel-2", 99, "ujuno", "juno1m7yyhncmthm7xsz4zvg06854mqjdxaplpx3cnv","pasg1emkh9v2kk03j4ccs0pnzk78e7ejq6wlz8mnn9u");
      const result = await signAndBroadcast(
        "junotest",
        {
          "authz": false,
          "feegrant": false,
          "group": false
        },
        "juno",
        [msg],
        860000,
        "",
        `${3000000}${"ujuno"}`,
        "http://192.168.1.26:2317",
        undefined
      );
      if (result?.code === 0) {
        dispatch(
          setTxHash({
            hash: result?.transactionHash,
          })
        );
        return fulfillWithValue({ txHash: result?.transactionHash });
      } else {
        dispatch(
          setError({
            type: "error",
            message: result?.rawLog,
          })
        );
        return rejectWithValue(result?.rawLog);
      }
    } catch (error) {
      dispatch(
        setError({
          type: "error",
          message: error.message,
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const signTest = createAsyncThunk(
  "bank/tx-sign-test",
  async (data, { rejectWithValue, fulfillWithValue, dispatch }) => {
    const res = await window.keplr.signArbitrary("cosmoshub-4", "cosmos1y0hvu8ts6m8hzwp57t9rhdgvnpc7yltglu9nrk", JSON.stringify(SignMsg()))
    return res;
  }
);

export const signVerify = createAsyncThunk(
  "bank/tx-sign-verify",
  async (data, { rejectWithValue, fulfillWithValue, dispatch }) => {
    console.log("called....")
    const res = await window.keplr.verifyArbitrary("cosmoshub-4", "cosmos1y0hvu8ts6m8hzwp57t9rhdgvnpc7yltglu9nrk", JSON.stringify(SignMsg()), VerifyMsg())
    console.log("here....")
    console.log(res)
    return res;
  }
);
//
export const bankSlice = createSlice({
  name: "bank",
  initialState,
  reducers: {
    claimRewardInBank: (state, action) => {
      const { chainID, totalRewards, minimalDenom } = action.payload;
      for (let i = 0; i < state?.balances?.[chainID]?.list?.length; i++) {
        if (state.balances[chainID]?.list?.[i]?.denom === minimalDenom) {
          state.balances[chainID].list[i].amount =
            +state.balances[chainID].list[i].amount + totalRewards;
        }
      }
    },
    resetMultiSendTxRes: (state) => {
      state.multiSendTxRes = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBalances.pending, (state) => {})
      .addCase(getBalances.fulfilled, (state, action) => {
        const chainID = action.payload?.chainID || "";
        if (chainID.length > 0) {
          let result = {
            list: action.payload?.data?.balances,
            status: "idle",
            errMsg: "",
          };
          state.balances[chainID] = result;
        }
      })
      .addCase(getBalances.rejected, (state, action) => {
        const chainID = action.meta.arg.chainID;
        state.balances[chainID] = {
          status: "idle",
          errMsg: action?.error?.message || "",
          list: [],
        };
      });

    builder
      .addCase(getBalance.pending, (state) => {
        state.balance.status = "pending";
        state.balance.errMsg = "";
      })
      .addCase(getBalance.fulfilled, (state, action) => {
        state.balance.status = "idle";
        state.balance.balance = action.payload.balance;
        state.balance.errMsg = "";
      })
      .addCase(getBalance.rejected, (state, action) => {
        state.balance.status = "rejected";
        state.balance.errMsg = action.error.message;
        state.balance.balance = {};
      })
      .addCase(txBankSend.pending, (state) => {
        state.tx.status = "pending";
      })
      .addCase(txBankSend.fulfilled, (state, _) => {
        state.tx.status = "idle";
      })
      .addCase(txBankSend.rejected, (state, _) => {
        state.tx.status = "rejected";
      })
      .addCase(multiTxns.pending, (state) => {
        state.tx.status = "pending";
        state.multiSendTxRes.status = "pending";
      })
      .addCase(multiTxns.fulfilled, (state, _) => {
        state.tx.status = "idle";
        state.multiSendTxRes.status = "idle";
      })
      .addCase(multiTxns.rejected, (state, _) => {
        state.tx.status = "rejected";
        state.multiSendTxRes.status = "rejected";
      })
      .addCase(signTest.pending, (state) => {
        state.tx.status = "pending";
        state.multiSendTxRes.status = "pending";
      })
      .addCase(signTest.fulfilled, (state, action) => {
        console.log("res...")
        console.log(action.payload)
        state.tx.status = "idle";
        state.multiSendTxRes.status = "idle";
      })
      .addCase(signTest.rejected, (state, _) => {
        state.tx.status = "rejected";
        state.multiSendTxRes.status = "rejected";
      })
      .addCase(signVerify.pending, (state) => {
        state.tx.status = "pending";
        state.multiSendTxRes.status = "pending";
      })
      .addCase(signVerify.fulfilled, (state, action) => {
        console.log("res...verify....")
        console.log(action.payload)
        state.tx.status = "idle";
        state.multiSendTxRes.status = "idle";
      })
      .addCase(signVerify.rejected, (state, action) => {
        console.log("rejected....")
        console.log(action)
        state.tx.status = "rejected";
        state.multiSendTxRes.status = "rejected";
      });
  },
});

export const { claimRewardInBank, resetMultiSendTxRes } = bankSlice.actions;
export default bankSlice.reducer;
