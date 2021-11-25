const { entry } = require("../models")

const BuildingService = () => {
  const getEntries = async (buildingId) => {
    const entries = await entry.findAll({nest:true, rewhere:{building_id:buildingId}})
  }
}