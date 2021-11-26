//위도 37 기준 경도 1도 약 88.74km, 위도 약 111km
const isInRange = (coord1, coord2) => {
  const { latitude: x1, longitude: y1 } = coord1;
  const { latitude: x2, longitude: y2 } = coord2;

  const dx = (x2 - x1) * 111 * 1000;
  const dy = (y2 - y1) * 88.74 * 1000;

  const distance = Math.sqrt(dx * dx + dy * dy);
  let result = true
  if (distance > 400) {
    result = false
  }
  return result;
};

module.exports = isInRange;
