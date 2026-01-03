import type { Files } from "@/types/InvoiceFile";
import axios, { AxiosError } from "axios";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
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
  e: ChangeEvent<HTMLInputElement>,
  setFiles: Dispatch<SetStateAction<Files[]>>,
  dispatch: AppDispatch
) => {
  if (!e.target.files || e.target.files.length === 0) {
    toast.info("Datei auswählen", { className: "mt-5 md:mt-0" });
    return;
  }

  const selectedFile = e.target.files[0];

  toast.promise(
    appendNewBillController(true, selectedFile, setFiles, dispatch),
    {
      success: "Rechnung manuell hinzugefügt",
      error: "Ein unerwarteter Fehler ist aufgetreten.",
      loading: "Rechnung wird hinzugefügt",
      className: "mt-5 md:mt-0",
    }
  );
};

const appendNewBillController = async (
  retry: boolean = true,
  InvoiceFile: File,
  setFiles: Dispatch<SetStateAction<Files[]>>,
  dispatch: AppDispatch
) => {
  try {
    let accessToken: string | null;

    if (retry) {
      accessToken = await AuthStorage.getAccessToken();
    } else {
      accessToken = await refreshAccessToken();
    }

    const formData = new FormData();
    formData.append("newInvoice", InvoiceFile);

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/list-blobs/invoices`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    dispatch(
      appendBillState({
        key: data.key,
        url: data.url,
        size: data.size,
        lastModified: data.lastModified,
      } as Files)
    );
    setFiles((prev) => [
      ...prev,
      {
        key: data.key,
        url: data.url,
        size: data.size,
        lastModified: data.lastModified,
      },
    ]);
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
        return await appendNewBillController(
          false,
          InvoiceFile,
          setFiles,
          dispatch
        );
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
