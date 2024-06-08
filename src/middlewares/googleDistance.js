function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const radLat1 = toRadians(lat1);
  const radLon1 = toRadians(lon1);
  const radLat2 = toRadians(lat2);
  const radLon2 = toRadians(lon2);

  const R = 6371;

  const deltaLat = radLat2 - radLat1;
  const deltaLon = radLon2 - radLon1;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

export default calculateDistance;
