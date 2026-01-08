import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Clock,
  Route,
  CreditCard,
  Banknote,
  Receipt,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

/**
 * Invoice page where drivers can review ride details and select payment method
 * before creating the final invoice/billing record
 */
const Invoice = () => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hardcoded values for now - will be replaced with actual ride data
  const rideData = {
    ride_id: 12345,
    start_address: "Mariahilfer Straße 120, 1070 Wien",
    end_address: "Stephansplatz 1, 1010 Wien",
    start_time: "2024-01-08 14:30:00",
    end_time: "2024-01-08 15:15:00",
    duration: "00:45:00",
    distance: 5.2, // km
    ride_type: "Taxifahrt",
    driver_name: "Max Mustermann",
  };

  // Calculate estimated amounts (placeholder logic)
  const baseRate = 3.8; // Base fare
  const perKm = 1.5; // Rate per km
  const estimatedNet = (baseRate + rideData.distance * perKm).toFixed(2);
  const taxRate = 20; // 20% VAT
  const estimatedTax = ((parseFloat(estimatedNet) * taxRate) / 100).toFixed(2);
  const estimatedGross = (
    parseFloat(estimatedNet) + parseFloat(estimatedTax)
  ).toFixed(2);

  const handleSubmit = () => {
    if (!selectedPayment) {
      toast.error("Bitte wählen Sie eine Zahlungsmethode aus", {
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Rechnung wurde erstellt", {
        position: "top-center",
      });
      setIsSubmitting(false);
      // Navigate to invoices list or ride detail
      navigate(`/all-rides/${rideData.ride_id}`);
    }, 1500);
  };

  return (
    <section className="flex flex-col w-full min-h-screen">
      <div className="flex flex-col gap-1 pb-4">
        <h2 className="page-title">Rechnung erstellen</h2>
        <p className="subheader">
          Überprüfen Sie die Fahrtdetails und wählen Sie die Zahlungsmethode
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Ride Summary Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-violet-600" />
              Fahrtdetails
            </CardTitle>
            <CardDescription>
              Fahrt #{rideData.ride_id} - {rideData.ride_type}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Route Information */}
            <div className="space-y-3 relative">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Start</Label>
                  <p className="text-sm font-medium">
                    {rideData.start_address}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(rideData.start_time)}
                  </p>
                </div>
              </div>

              <div className="absolute left-[0.875rem] top-5 border-l-4 border-dashed border-black dark:border-white h-11"></div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Ziel</Label>
                  <p className="text-sm font-medium">{rideData.end_address}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(rideData.end_time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Route className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Distanz
                  </Label>
                  <p className="text-lg font-bold">{rideData.distance} km</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Dauer</Label>
                  <p className="text-lg font-bold">{rideData.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Typ</Label>
                  <p className="text-lg font-bold">{rideData.ride_type}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment & Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Zahlung & Summe</CardTitle>
            <CardDescription>Zahlungsmethode auswählen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Zahlungsmethode</Label>

              <button
                onClick={() => setSelectedPayment("card")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedPayment === "card"
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950"
                    : "border-border hover:border-violet-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedPayment === "card"
                        ? "bg-violet-500"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <CreditCard
                      className={`w-5 h-5 ${
                        selectedPayment === "card"
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Karte</p>
                    <p className="text-xs text-muted-foreground">
                      Kredit- oder Debitkarte
                    </p>
                  </div>
                  {selectedPayment === "card" && (
                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setSelectedPayment("cash")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedPayment === "cash"
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-border hover:border-green-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedPayment === "cash"
                        ? "bg-green-500"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Banknote
                      className={`w-5 h-5 ${
                        selectedPayment === "cash"
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Bargeld</p>
                    <p className="text-xs text-muted-foreground">Barzahlung</p>
                  </div>
                  {selectedPayment === "cash" && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Amount Summary */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nettobetrag</span>
                <span className="font-medium">€{estimatedNet}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  MwSt. ({taxRate}%)
                </span>
                <span className="font-medium">€{estimatedTax}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Gesamtbetrag</span>
                <span className="text-violet-600">€{estimatedGross}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPayment || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                "Wird erstellt..."
              ) : (
                <>
                  Rechnung erstellen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};

export default Invoice;
