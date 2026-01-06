import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBills } from "../../../redux/slices/invoices";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../components/ui/empty";
import {
  ArrowUpRightIcon,
  FolderOpen,
  FileText,
  Download,
  ExternalLink,
  Calendar,
  Info,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { isMobile, useIsMobile } from "../../hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AuthStorage } from "../../utils/secureStorage";
import axios, { AxiosError } from "axios";
import { refreshAccessToken } from "../../utils/jwttokens";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import { fetchDownload } from "@/utils/invoices/fetchDownload";
import type { Files } from "@/types/InvoiceFile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Worker } from "@react-pdf-viewer/core";
import { Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { QRCodeSVG } from "qrcode.react";
import { setLink } from "../../../redux/slices/footerLinksSlice";

const Invoices = () => {
  const dispatch: AppDispatch = useDispatch();
  const bills = useSelector((state: RootState) => state.setBills.bills);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<Files[]>([]);
  const navigator = useNavigate();
  const retryRef = useRef(true);
  const mobileView = useIsMobile();

  const fetchBills = useCallback(async () => {
    if (!bills || bills.length === 0) {
      try {
        let accessToken: string | null;
        if (retryRef.current) {
          accessToken = await AuthStorage.getAccessToken();
        } else {
          accessToken = await refreshAccessToken();
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/list-blobs/invoices`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        dispatch(setBills(data.files));
        setFiles(data.files);
        setLoading(false);
        retryRef.current = true; // Reset retry flag on success
      } catch (error) {
        setLoading(false);
        if (error instanceof AxiosError) {
          const isAuthError =
            error.status === 403 ||
            error.status === 401 ||
            error.response?.data?.path === "auth middleware";

          if (isAuthError && retryRef.current) {
            // First retry with refreshed token
            retryRef.current = false;
            return await fetchBills();
          } else if (isAuthError && !retryRef.current) {
            // Second attempt failed - session expired
            toast.error("Sitzung abgelaufen. Bitte melden Sie sich erneut an.");
          } else {
            toast.error(
              "Rechnungen konnten nicht geladen werden. Bitte versuchen Sie es erneut."
            );
          }
        } else {
          toast.error("Ein unerwarteter Fehler ist aufgetreten.");
        }
      }
    } else {
      setFiles(bills);
      setLoading(false);
    }
  }, [dispatch, bills]);

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col w-full min-h-screen">
      <div className="flex flex-col gap-1 pb-4">
        <h2 className="page-title">Rechnungen</h2>
        <p className="subheader">
          Sehen und laden Sie alle Ihre generierten Rechnungen herunter
        </p>
      </div>

      <div className="flex flex-col min-h-[70vh] mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files &&
            files.length !== 0 &&
            !loading &&
            files.map((file, index) => (
              <Card
                key={index}
                className="relative rounded-xl border border-border/40 bg-sidebar dark:bg-sidebar shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row justify-between items-start pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950">
                      <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <CardTitle className="card-title-standard">
                        Rechnung
                      </CardTitle>
                    </div>
                    <Dialog>
                      <DialogTrigger>
                        <Info className="absolute top-4 right-4" />
                      </DialogTrigger>
                      <DialogContent
                        className={`p-0  ${
                          mobileView ? "X-hidden h-[70vh]" : "h-[90vh]"
                        }`}
                      >
                        <DialogHeader className="pt-2">
                          <DialogTitle className="text-left pl-2 section-header break-words">
                            {`Rechnung vom ` +
                              formatDate(file.lastModified?.toString()) ||
                              "Rechnung"}
                          </DialogTitle>
                        </DialogHeader>
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                          <DialogDescription
                            className={`${
                              mobileView ? "h-[65vh]" : "h-[85vh]"
                            } overflow-scroll`}
                          >
                            <Viewer
                              fileUrl={file.url}
                              defaultScale={SpecialZoomLevel.PageFit}
                            />
                          </DialogDescription>
                        </Worker>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger>
                        <QrCode className="absolute top-12 right-4" />
                      </DialogTrigger>
                      <DialogContent className="p-3 flex flex-col items-center">
                        <DialogTitle className="section-header">
                          Scanne um Online zu sehen
                        </DialogTitle>
                        <QRCodeSVG size={260} value={file.url} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(file.lastModified?.toString()) ||
                        "Datum konnte nicht geladen werden"}
                    </span>
                  </div>
                  <CardDescription className="card-description-small truncate">
                    <p title={file.key?.split("/").pop()}>
                      {file.key?.split("/").pop()}
                    </p>
                    <p>{`Datentyp: ${file.key
                      ?.split(".")
                      .pop()
                      ?.toUpperCase()}`}</p>
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-2">
                  <Button asChild className="w-full" variant="link">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Online ansehen
                    </a>
                  </Button>
                  <Button
                    asChild
                    className="w-full cursor-pointer"
                    variant="outline"
                  >
                    <a
                      onClick={() =>
                        fetchDownload(
                          file.url,
                          file.key?.split("/").pop() || "Invoice"
                        )
                      }
                      download
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Herunterladen
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>

        {(!files || files.length === 0) && !loading && (
          <Empty className="justify-self-center">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen />
              </EmptyMedia>
              <EmptyTitle>Noch keine Rechnungen</EmptyTitle>
              <EmptyDescription>
                Sie haben noch keine Rechnungen.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="col-span-2 sm:col-span-1 shadow-xl bg-gray-300 dark:bg-black"
                  onClick={() => {
                    if (isMobile) {
                      navigator("/ride");
                    } else {
                      navigator("/statistics");
                    }

                    dispatch(setLink(0));
                  }}
                >
                  {isMobile ? "Fahrt starten" : "Statistiken prüfen"}
                </Button>
                <Button
                  className="col-span-2 sm:col-span-1"
                  variant="outline"
                  onClick={() => {
                    navigator("/");
                    dispatch(setLink(1));
                  }}
                >
                  Zurück zur Startseite
                </Button>
              </div>
            </EmptyContent>
            <Button
              variant="link"
              asChild
              className="text-muted-foreground"
              size="sm"
            >
              <a href="#">
                Mehr erfahren <ArrowUpRightIcon />
              </a>
            </Button>
          </Empty>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.of(1, 2, 3, 4, 5, 6).map((_, index) => (
              <Card
                key={index}
                title="Loading Card"
                className="rounded-xl border border-border/40 bg-gray-300/60 dark:bg-black/30 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row justify-between items-start pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950">
                      <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <CardTitle className="card-title-standard">
                        Rechnung
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="bg-gray-600 animate-pulse text-transparent rounded w-32 h-5" />
                  </div>

                  <CardDescription className="mt-3 text-xs">
                    <span className="bg-gray-600 animate-pulse text-transparent rounded w-32 h-5" />
                  </CardDescription>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-4">
                  <Button asChild className="w-full">
                    <span className="bg-gray-600 animate-pulse"></span>
                  </Button>
                  <Button disabled asChild className="w-full">
                    <span className="bg-gray-600 animate-pulse"></span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Invoices;
