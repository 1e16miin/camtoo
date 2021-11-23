const { boundary, building, member, friend, user } = require("../models");
const {Op} = require('sequelize')


const GeoFenceService = (universityId = 1, profileId = 1) => {
  const getBuildings = async () => {
    let buildingData = await building.findAll({
      nest: true,
      raw: true,
      where: { university_id: universityId },
      attributes: [["id", "building_id"], "x", "y"],
    });

    const friendIds = (
      await friend.findAll({
        nest: true,
        raw: true,
        attributes: ["user.id"],
        where: { status: "B" },
        include: [{ model: user, where: { profile_id: profileId } }],
      })
    ).map((element) => element.id);

    buildingData = await Promise.all(
      buildingIdList.map(async (building) => {
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
          where: { profile_id: friendIds, building_id: building.building_id },
          // include: [{ model: friend, attributes: [], required: true, where: { status: "A" },include:[{model:user, where:{profile_id:profileId}}] }],
        });

        building.boundaries = boundaryData;
        const marker = { x: building.x, y: building.y };
        building.marker = marker;
        building.isEmpty = isIn ? 1 : 0;
        delete building.x;
        delete building.y;
        return building;
      })
    );

    return buildingData;
  };

  const getMembers = async((buildingId) => {
    const members = (await member.findAll({
      nest: true,
      raw: true,
      attributes: ["profile_id"],
      where: { building_id: building.building_id}
    })).map(element => element.profile_id)
    const friendIds = (
      await friend.findAll({
        nest: true,
        raw: true,
        attributes: ["user.id"],
        where: { status: "B" },
        include: [{ model: user, where: { profile_id: profileId } }],
      })
    ).map((element) => element.id);

    const result = (await Promise.all(members.map(profileId => {
      let result = {profile_id: profileId, isFriend:0}
      const userData = await user.findOne({
        nest: true,
        raw: true,
        attributes:["open_type"],
        where: { profile_id: profileId },
      });
      if (friendIds.includes(profileId)) {
        result.isFriend = 1
      } else if (userData.open_type !== "A") {
        return null
      }
      return result
    }))).filter(Boolean)
    return result
  });

  return { getBuildings, getMembers };
};

module.exports = GeoFenceService;