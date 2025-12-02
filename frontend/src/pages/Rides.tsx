import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from "leaflet";
import "leaflet-routing-machine";
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import "leaflet/dist/leaflet.css"
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import '../routing.css';
import { Icon } from 'leaflet';
import { useEffect, useRef, useState, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * The Rides page, where a driver can start/end a Ride
 * @returns Rides Page
 * @author Casper Zielinski
 * @author Umejr Dzinovic
 */
const locationIcon = new Icon({
  iconUrl: '/karte3.png',
  iconSize: [50, 50],
  iconAnchor: [25, 25], //This will actually center the icon on to the location. its like translate -50%
});

const driverIcon = new Icon({
  iconUrl: '/dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});


type RoutingMachineProps = {
  start: [number, number];
  end: [number, number];
};

// This will create the route itself between start and end address
export const RoutingMachine = ({ start, end }: RoutingMachineProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      // ensures that the driver cannot change the route
      routeWhileDragging: false,
      // this will not show any alternative routes
      showAlternatives: false,
      // driver cannot add new wayoints to the route
      addWaypoints: false,
      lineOptions: {
        styles: [{ weight: 5 }]
      },
      // This will ensure that leaflet doesn't add additional markers
      createMarker: () => null
    }).addTo(map);

    // Clean
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]);

  return null;

};

const wholeRide: [number, number][] = []

// memo from react ensures that this element is only rendered new, if and only if the lat and lng have actually updated itself
export const RecenterMap = memo(
  ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();

    const lastLocation = useRef<[number, number] | null>(null);

    useEffect(() => {
      if (!lastLocation.current) {
        lastLocation.current = [lat, lng];
        map.flyTo([lat, lng], map.getZoom(), { duration: 1 });
        return;
      }

      const [prevLat, prevLng] = lastLocation.current;
      const distance = map.distance([prevLat, prevLng], [lat, lng]);

      const lastIndex = wholeRide.length - 1;
      if (lastIndex <= 0) {
        wholeRide.push([lat, lng]);
      }

      if (distance > 50) {
        // only fly if moved more than 30m
        // smooth transition to the *new* current locaton
        map.flyTo([lat, lng], map.getZoom(), { duration: 1 });
        lastLocation.current = [lat, lng];
        wholeRide.push([lat, lng]);
      }
    }, [map, lat, lng]);
    return null;
  }
);


// Calls the link and converts the adress into lat and lng coordinates
async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await response.json();
    if (data.length === 0) return null;
    console.log(parseFloat(data[0].lat), parseFloat(data[0].lon))
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`; // returns 00:00:00 format
};

const Rides = () => {

  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);

  // Input
  const [destination, setDestination] = useState("");

  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);

  // We would actually use driverLocation, but since we dont want to update Route every second,
  // a second start Coords variable only for the route is needed
  const [routingStartCoords, setRoutingStartCoords] = useState<[number, number] | null>(null);

  const [isRideActive, setIsRideActive] = useState(false);
  const [timer, setTimer] = useState(0);

  // This variable is needed for the setRoutingStartCoords method, because without the ref
  // we would have to update the route every second, which causes some other bugs
  const driverLocationRef = useRef<[number, number] | null>(null);

  useEffect(() => {

    driverLocationRef.current = driverLocation;

  }, [driverLocation]);

  function showNewRoute() {

    const currentDriverLocation = driverLocationRef.current;

    if (currentDriverLocation) {
      // Setzt den Startpunkt auf die aktuelle Position
      setRoutingStartCoords(currentDriverLocation);
    }

  }

  useEffect(() => {
    if (!isRideActive) {
      return;
    }

    const interval = setInterval(() => {
      showNewRoute();
      console.log("Routing Line new")
    }, 10000)

    return () => clearInterval(interval);
  }, [isRideActive]);


  // This will center the karte on the current location (driver)

  // timer
  useEffect(() => {
    let interval: number | undefined;

    if (isRideActive) {
      interval = setInterval(() => {
        setTimer(last => last + 1);
      }, 1000)
    }

    return () => clearInterval(interval);
  }, [isRideActive])

  // Update driver
  useEffect(() => {
    // To get the current location
    navigator.geolocation.getCurrentPosition(
      (lc) => {
        console.log("Location loaded:", lc.coords.latitude, lc.coords.longitude);
        setDriverLocation([lc.coords.latitude, lc.coords.longitude]);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            toast("Error while loading the current location of the driver:", {
              position: "top-center",
              closeButton: true,
            });
            break;
          case err.POSITION_UNAVAILABLE:
            toast("GPS not available. Ensure that the device has a built in GPS!", {
              position: "top-center",
              closeButton: true,
            });
            break;
          case err.TIMEOUT:
            toast("GPS request was timed out because the request has taken too long.", {
              position: "top-center",
              closeButton: true,
            });
            break;
          default:
            toast("Unknown GPS failure", {
              position: "top-center",
              closeButton: true,
            });
        }
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
    );

    // To udate the location
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        console.log("Live Update:", pos.coords.latitude, pos.coords.longitude);
        setDriverLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            toast("GPS denied during live tracking!", {
              position: "top-center",
              closeButton: true,
            });
            break;
          case err.POSITION_UNAVAILABLE:
            toast("GPS not available during live tracking!", {
              position: "top-center",
              closeButton: true,
            });
            break;
          case err.TIMEOUT:
            toast("GPS live update timed out.", {
              position: "top-center",
              closeButton: true,
            });
            break;
          default:
            toast("Unknown GPS error during live tracking.", {
              position: "top-center",
              closeButton: true,
            });
        }
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
    );

    // clean live tracker
    return () => navigator.geolocation.clearWatch(watchId);
  }, [])

  useEffect(() => {
    let lat = driverLocation?.[0] ?? 48.21;
    let lng = driverLocation?.[1] ?? 16.36;

    let interval: number | undefined;
    if (isRideActive) {
      interval = setInterval(() => {
        lat += 0.0001;
        lng += 0.0001;
        setDriverLocation([lat, lng]);
      }, 1000);
    }


    return () => clearInterval(interval);
  }, [isRideActive, driverLocation]);

  if (!driverLocation) {
    return <p className="text-center mt-4">Warte auf GPS-Daten…</p>;
  }

  const checkRide = () => {
    if (isRideActive && timer <= 60) {
      toast("The ride cannot be saved, because the ride lasted only under 1 minute.", {
        position: "top-center",
        closeButton: true,
      });
    };
  };


  return (
    <div className="w-full flex flex-col gap-2 z-20">

      <h2 className="ml-2 text-lg text-center md:text-start font-light">
        Fahrten
      </h2>

      <p className='w-full text-5xl font-bold text-center'>
        {formatTime(timer)}
      </p>

      <MapContainer
        center={driverLocation ?? [48.210033, 16.363449]}
        zoom={13}

        style={{ height: "500px", width: "100%" }}
      >
        {/* TileLayer actually shows the individual layers of the whole map */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* This will ensure that the markers get clustered into one "container" marker */}
        <MarkerClusterGroup>
          {driverLocation && (
            <>
              {/* Driver current location */}
              <Marker position={driverLocation} icon={driverIcon}></Marker>
              <RecenterMap lat={driverLocation[0]} lng={driverLocation[1]} />
            </>
          )}

          {/* Marker for destination address */}
          {destinationCoords && (
            <Marker position={destinationCoords} icon={locationIcon}></Marker>
          )}
        </MarkerClusterGroup>

        {/* Destination-Routing */}
        {routingStartCoords && destinationCoords && (
          <RoutingMachine start={routingStartCoords} end={destinationCoords} />
        )}

      </MapContainer>
      <Input
        type="text"
        placeholder="Mariahilfer Straße 120, Wien"
        value={destination}
        onChange={e => setDestination(e.target.value)}
        className='w-full p-3 mb-4 text-gray-800 border-2 border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150'
        disabled={isRideActive}
      />

      <Button
        onClick={async () => {
          if (!destination) {
             toast("Bitte geben sie eine Adresse ein!", {
              position: "top-center",
              closeButton: true,
            });
            return;
          } 
          const coords = await geocodeAddress(destination);
          if (coords) {
            setDestinationCoords(coords);
            showNewRoute();
          } else {
             toast("Bitte gebe eine echte Adresse ein!", {
              position: "top-center",
              closeButton: true,
            });
          }
          
          
        }}
        disabled={isRideActive}
        
        className={`w-full py-6 mb-6 font-semibold text-white bg-violet-600 rounded-lg shadow-md hover:bg-violet-700 transition duration-150 ease-in-out`}
      >
        Route berechnen
      </Button>

      <div className='w-full grid grid-cols-2 gap-4'>
        <Button

          className={`py-6 font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition duration-150 ease-in-out`}
          onClick={() => {
            setIsRideActive(true);
            console.log("Ride has started!");
          }}
          disabled={isRideActive}>
          Start Fahrt
        </Button>

        <Button

          className={`py-6 font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 transition duration-150 ease-in-out`}
          onClick={() => {
            setIsRideActive(false);
            setDestinationCoords(null);
            setDestination("");
            setTimer(0);
            checkRide();
            wholeRide.forEach(element => console.log(element))
            wholeRide.length = 0;
            console.log("Ride has ended!")
          }}
          disabled={!isRideActive}>
          End Fahrt
        </Button>
      </div>
    </div>
  )

}


export default Rides
