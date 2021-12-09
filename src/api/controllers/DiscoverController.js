const GeoFenceService = require("../../services/GeoFenceService");
const express = require('express');
const { checkAccessTokens } = require("../middlewares/verifyToken");
const UserService = require("../../services/UserService");
const router = express()





router.get('/building', checkAccessTokens ,async (req,res) => {
  
  try {
    const id = req.id
    const buildingId = req.query.buildingId
    const userId = (await UserService(id)).userId;
    const geoFenceInstance = GeoFenceService(userId);
    const result = await geoFenceInstance.getBuildingData(buildingId);
    return res.status(200).send(result)
  } catch (err) {
    console.log(err)
    res.status(400).send({message:"데이터를 찾는 과정에 오류가 발생하였습니다."})
  }
})

router.get("/road", checkAccessTokens, async (req, res) => {
  try {
    const id = req.id;
    const userId = (await UserService(id)).userId;
    const geoFenceInstance = GeoFenceService(userId);
    const result = await geoFenceInstance.getBuildingData(null);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "데이터를 찾는 과정에 오류가 발생하였습니다." });
  }
});

router.get("/university",checkAccessTokens, async (req, res) => {
  
  try {
    const id = req.id;
    const universityId = req.query.universityId;
    const userId = (await UserService(id)).userId;
    const geoFenceInstance = GeoFenceService(userId);
    const result = await geoFenceInstance.getUniversityData(universityId);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "데이터를 찾는 과정에 오류가 발생하였습니다." });
  }
});

router.post("/building/enter", checkAccessTokens,async (req, res) => {
  
  try {
    const id = req.id
    const buildingId = req.body.buildingId
    console.log(buildingId)
    const userId = (await UserService(id)).userId;
    const geoFenceInstance = GeoFenceService(userId);
    const result = await geoFenceInstance.entrance(buildingId);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "데이터를 생성하는 과정에 오류가 발생하였습니다." });
  }
})


router.delete("/building/exit", checkAccessTokens ,async (req, res) => {
  
  try {
    const id = req.id
    const buildingId = req.body.buildingId;
    console.log(buildingId);
    const userId = (await UserService(id)).userId;
    const geoFenceInstance = GeoFenceService(userId);
    const result = await geoFenceInstance.exit(buildingId);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "데이터를 생성하는 과정에 오류가 발생하였습니다." });
  }
});


router.get("/", checkAccessTokens, async (req, res) => {
  const universityId = req.query.universityId
  

})

module.exports = router