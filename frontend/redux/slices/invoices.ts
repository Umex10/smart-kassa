import type { Files } from "@/types/InvoiceFile";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bills: [],
} as { bills: Files[] };

const invoices = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setBills: (state, action) => {
      state.bills = action.payload;
    },
    appendBillState: (state, action) => {
      state.bills.push(action.payload);
    },
  },
});

export const { setBills, appendBillState } = invoices.actions;

export default invoices.reducer;
