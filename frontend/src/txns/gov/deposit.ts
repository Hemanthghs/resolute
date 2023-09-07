import { MsgDeposit } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { Msg, Msg2 } from "../types";
import { StdSignature } from "@cosmjs/amino";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";

const msgDeposit = "/cosmos.gov.v1beta1.MsgDeposit";

export function GovDepositMsg(
  proposalId: number,
  depositer: string,
  amount: number,
  denom: string
): Msg {
  return {
    typeUrl: msgDeposit,
    value: MsgDeposit.fromPartial({
      depositor: depositer,
      proposalId: proposalId,
      amount: [
        {
          denom: denom,
          amount: String(amount),
        },
      ],
    }),
  };
}

// const msgIBCSend = "/cosmos.bank.v1beta1.MsgSend";
const msgIBCSend = "/ibc.applications.transfer.v1.MsgTransfer";

export function IBCTransferMsg(
  sourcePort: string,
  sourceChannel: string,
  amount: number,
  denom: string,
  sender: string,
  receiver: string
): Msg {
  return {
    typeUrl: msgIBCSend,
    value: MsgTransfer.fromPartial({
      sourcePort: sourcePort,
      sourceChannel: sourceChannel,
      token: {
        denom: denom,
        amount: String(amount),
      },
      sender: sender,
      receiver: receiver,
      timeoutHeight: {
        revisionHeight: 123123,
        revisionNumber: 1,
      },
    }),
  };
}

const msgSign = "sign/MsgSignData";

export function SignMsg(): Msg2 {
  return {
    type: msgSign,
    value: {
      signer: "cosmos1y0hvu8ts6m8hzwp57t9rhdgvnpc7yltglu9nrk",
      data: "test data - test data",
    },
  };
}

export function VerifyMsg(): StdSignature {
  return {
    pub_key: {
      type: "tendermint/PubKeySecp256k1",
      value: "A548OhedNfWrFXPfe5u0pNYPauAybrRmnStyfZCTLmry",
    },
    signature:
      "N3shRZMY8++IFuGlODo0F1Y4KxgdnXohsO5SIRfqJsRktzgu0Rx3a6k1TMQyW7v0pm2WNQEIdjXNgAewvhd1QA==",
  };
}
