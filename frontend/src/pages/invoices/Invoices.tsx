import { type ListBlobResultBlob } from "@vercel/blob";
import { AuthStorage } from "@/utils/secureStorage";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBills } from "../../../redux/slices/invoices";
import type { AppDispatch, RootState } from "redux/store";

const Invoices = () => {
  const dispatch: AppDispatch = useDispatch();
  const bills = useSelector((state: RootState) => state.setBills.bills);
  const [blobs, setBlobs] = useState<ListBlobResultBlob[]>([]);

  const fetchBills = useCallback(async () => {
    if (!bills || bills.length === 0) {
      const accessToken = await AuthStorage.getAccessToken();
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/list-blobs/invoices`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      dispatch(setBills(data.actualFiles));
      setBlobs(data.actualFiles);
    } else {
      setBlobs(bills);
    }

    console.log(bills);
  }, [dispatch, bills]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return (
    <section>
      <h2 className="ml-2 text-lg text-center md:text-start font-light">
        Invoices
      </h2>
      <div>
        {blobs.map((blob) => (
          <a key={blob.pathname} href={blob.downloadUrl}>
            Download File
          </a>
        ))}
      </div>
    </section>
  );
};

export default Invoices;
