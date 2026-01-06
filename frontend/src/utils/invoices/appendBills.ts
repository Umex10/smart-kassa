import type { Files } from "@/types/InvoiceFile";
import axios, { AxiosError } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { appendBillState } from "../../../redux/slices/invoices";
import { refreshAccessToken } from "../jwttokens";
import { AuthStorage } from "../secureStorage";
import type { AppDispatch } from "../../../redux/store";

/**
 * Function used to append a Bill via a onChange Event ()
 * @param e onChange Event Parameter used in onChange Events in a input type of file to handle file inputs
 * @param setFiles
 * @param dispatch
 * @returns
 */
export const appendNewBill = (
  dispatch: AppDispatch,
  setFiles?: Dispatch<SetStateAction<Files[]>>
) => {
  toast.promise(appendNewBillController(true, dispatch, setFiles), {
    success: "Rechnung manuell hinzugefügt",
    error: "Ein unerwarteter Fehler ist aufgetreten.",
    loading: "Rechnung wird hinzugefügt",
    className: "mt-5 md:mt-0",
  });
};

const appendNewBillController = async (
  retry: boolean = true,
  dispatch: AppDispatch,
  setFiles?: Dispatch<SetStateAction<Files[]>>
) => {
  try {
    let accessToken: string | null;
    const billingId = 1; // update in the future!!!, inject via parameter!

    if (retry) {
      accessToken = await AuthStorage.getAccessToken();
    } else {
      accessToken = await refreshAccessToken();
    }

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/list-blobs/invoices`,
      { billingId: billingId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    dispatch(appendBillState(data as Files));

    if (setFiles) {
      setFiles((prev) => [...prev, data as Files]);
    }

    retry = true;
  } catch (error) {
    if (error instanceof AxiosError) {
      const tokenError =
        error.status === 403 ||
        error.status === 401 ||
        error.response?.data?.path === "auth middleware";

      if (tokenError && retry) {
        // First retry with refreshed token
        retry = false;
        return await appendNewBillController(false, dispatch, setFiles);
      } else if (tokenError && !retry) {
        // Second attempt failed - session expired
        console.error(error);
        throw new Error("Sitzung abgelaufen. Bitte melden Sie sich erneut an.");
      } else {
        console.error(error);
        throw new Error(
          "Ressourcen konnten nicht geladen werden, überprüfen Sie Ihre Internetverbindung"
        );
      }
    } else {
      console.error(error);
      throw new Error("Ein unerwarteter Fehler ist aufgetreten.");
    }
  }
};
