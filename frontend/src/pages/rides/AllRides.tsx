import { MapPin, Clock, Route, Timer, Bike, Car } from "lucide-react";
import { useSelector } from 'react-redux'
import type { RootState } from '../../../redux/store'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// const driverIcon = new Icon({
//   iconUrl: '/dot.png',
//   iconSize: [32, 32],
//   iconAnchor: [16, 16],
// });

const AllRides = () => {

  const rides = useSelector((state: RootState) => state.allRidesSlice);
  //   console.log(rides);


  //   const {id} = useParams();
  //   const rideId = Number(id);

  //   if (!rides || rides.length === 0) {
  //   return <>Loading rides…</>; 
  // }

  // const ride = rides.find(r => Number(r.rideID) === rideId);
  // console.log("Ride and id: ", ride, id)

  // if (!ride && id) {
  //    return <>Ride not found</>
  // } else if (!id) {
  //   console.log()
  // } else {
  //   return <SummaryRide wholeRide={rides[rideId - 1].wholeRide} driverIcon={driverIcon}></SummaryRide>
  // };

  function formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters.toFixed(2)} m`;
    } else {
      const km = meters / 1000;
      return `${km.toFixed(2)} km`;
    }
  }

  return (
    <div className='w-full'>
      <ul className='w-full grid grid-cols-1 md:grid-cols-4 gap-4'>
        {rides.map((ride, index) => (
          <li key={index} className='w-full'>
            <Card>
              <CardHeader className="space-y-1">
                {/* Start Address */}
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  {ride.start_address.split(",").slice(2, 4).join(", ")}
                </CardTitle>

                <CardDescription className="flex gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Route className="w-4 h-4" />
                    {formatDistance(ride.distance)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    {ride.duration}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>{ride.end_address.split(",").slice(0, 2).join(", ")}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">Start:</span>
                    {ride.start_time.split(" ").join(" | ")}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">Ende:</span>
                    {ride.end_time.split(" ").join(" | ")}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between text-sm">

                <div className="flex items-center gap-2 font-medium">
                  {ride.ride_type === "botenfahrt" ? (
                    <Bike className="w-4 h-4" />
                  ) : (
                    <Car className="w-4 h-4" />
                  )}
                  {ride.ride_type.charAt(0).toUpperCase() + ride.ride_type.slice(1)}
                </div>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AllRides
