const { Building } = require("../models");

const GeoFenceService = (universityId) => {
  const getBuildings = async () => {
    const buildingIdData = await Building.findAll({
      nest: true,
      raw: true,
      where: { university_id: universityId },
      include: [{
        model: Boundary
      }],
    });
  };
};

module.exports = GeoFenceService;