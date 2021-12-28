/**
 * USE CASE:
 * Displays relevant information reguarding deliveries.
 *
 * If delivery is over 5km and under 30sec the list will have
 * a `red` background, otherwise `green`.
 */
import { useEffect, useState } from "react";
import "./App.css";

/**
 * If elapsed time is greater than 30 seconds
 *
 * @param {{}} deliver
 * @returns {boolean}
 */
const isElapsedTimeRedZoned = (deliver) => {
  const isOverThirtySeconds =
    Number(
      millisToMinutesAndSeconds(
        getElapsedTime(new Date(deliver?.created_at))
      ).split(":")[0]
    ) > 0 ||
    Number(
      millisToMinutesAndSeconds(
        getElapsedTime(new Date(deliver?.created_at))
      ).split(":")[1]
    ) > 30;

  const isOverFiveKm =
    Math.round(
      Math.ceil(
        getDistanceFromLatLonInKm(
          Number(deliver.merchant?.location[0]),
          Number(deliver.merchant?.location[1]),
          Number(deliver.customer?.location[0]),
          Number(deliver.customer?.location[1])
        )
      )
    ) > 5;

  return isOverThirtySeconds && isOverFiveKm;
};

/**
 *
 * @param {number} millis
 * @returns
 */
const millisToMinutesAndSeconds = (millis) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
};
/**
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number}
 */
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return parseInt(d, 10).toFixed(2);
};
/**
 *
 * @param {number} deg
 * @returns {number}
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
/**
 *
 * @param {Date} time
 * @returns {Date}
 */
const getElapsedTime = (time) => {
  return new Date() - new Date(time);
};
/**
 *
 * @returns {JSX}
 */
function App() {
  const [deliveries, setDeliveries] = useState([]);
  /**
   *
   *
   */
  const getDeliveryData = async () => {
    try {
      const data = await fetch(
        "https://frontend-project-dot-cyan-dev.uc.r.appspot.com/deliveries",
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        }
      );

      const deliveries = await data.json();
      /**
       * Newest to oldest
       */
      const sortedDeliveries = deliveries.data.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setDeliveries(sortedDeliveries);
    } catch (error) {
      console.error("ERROR");
    }
  };
  /**
   *
   *
   */
  useEffect(() => {
    const fetchDeliveryId = setInterval(getDeliveryData, 2000);

    return () => {
      clearInterval(fetchDeliveryId);
    };
  }, []);

  return (
    <div className="App">
      <ul>
        {deliveries.map((deliver) => (
          <li
            key={deliver.customer.id}
            style={
              isElapsedTimeRedZoned(deliver)
                ? { backgroundColor: "red" }
                : { backgroundColor: "green" }
            }
          >
            <p>{deliver.customer.name}</p>
            <p>{deliver.merchant.name}</p>
            <p>{`DISTANCE: ${getDistanceFromLatLonInKm(
              Number(deliver.merchant?.location[0]),
              Number(deliver.merchant?.location[1]),
              Number(deliver.customer?.location[0]),
              Number(deliver.customer?.location[1])
            )}km`}</p>

            <p>{deliver.created_at}</p>
            <p>{`ELAPSED TIME: ${millisToMinutesAndSeconds(
              getElapsedTime(new Date(deliver?.created_at))
            )}`}</p>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
