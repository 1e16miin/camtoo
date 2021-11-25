const { entry } = require("../models")
const UserService = require("./UserService")

const BuildingService = () => {
  const getEntries = async (buildingId) => {
    const entries = await entry.findAll({ nest: true, attributes: ["user_id"], where: { building_id: buildingId } })
    let result = []
    if (entries) {
      const userInstance = await UserService()
      const {getUserData} = userInstance
      result = await Promise.all(entries.map(async (userId) => {
        const result = await getUserData(userId)
        return result
      }));
    }
    return result
  }
  return {getEntries}
}

module.exports = BuildingService;