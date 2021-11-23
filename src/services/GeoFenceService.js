const { boundary, building, member, friend, user } = require("../models");
const {Op} = require('sequelize')


const GeoFenceService = (universityId) => {
  const getBuildings = async (profileId = 1) => {
    
    let buildingData = (await building.findAll({
      nest: true,
      raw: true,
      where: { university_id: universityId },
      attributes: [["id", "building_id"], "x", "y"]
    }))
    
    const friendIds = (await friend.findAll({ nest: true, raw: true, attributes:["user.id"] ,where:{status:"B"}, include:[{model:user, where:{profile_id:profileId}}]})).map(element=>element.id)

    buildingData = await Promise.all(buildingIdList.map(building => {
      const boundaryData = await boundary.findAll({
        nest: true,
        raw: true,
        attributes: ["x", "y"],
        where: { building_id: building.building_id },
      });
      const isIn = await member.findAll({
        nest: true,
        raw: true,
        attributes: ["id"],
        where: { profile_id: friendIds },
        // include: [{ model: friend, attributes: [], required: true, where: { status: "A" },include:[{model:user, where:{profile_id:profileId}}] }],
      });
      
      building.boundaries = boundaryData
      const marker = { x: building.x, y: building.y };
      building.marker = marker;
      building.isEmpty = isIn ? 1 : 0
      delete building.x
      delete building.y
      return building
    }));
    


    return buildingData
  };
  return {getBuildings}
};

module.exports = GeoFenceService;