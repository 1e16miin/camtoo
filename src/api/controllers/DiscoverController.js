const GeoFenceService = require("../../services/GeoFenceService");
const express = require('express');
const { checkAccessTokens } = require("../middlewares/verifyToken");
const router = express()


router.get('/geo-fence', checkAccessTokens ,async (req,res) => {
  
  try {
    const id = req.id
    const userId = await (await UserService(id)).userId;

    const geoFenceInstance = GeoFenceService(id);
    const result = await geoFenceInstance.getBuildings()
    return res.status(200).send(result)
  } catch (err) {
    console.log(err)
    res.status(400).send({error:"데이터를 찾는 과정에 오류가 발생하였습니다."})
  }
})

router.get("/building/member",checkAccessTokens, async (req, res) => {
  const {profile_id, building_id} = req.query
  try {
    const geoFenceInstance = GeoFenceService(1, profile_id);
    const result = await geoFenceInstance.getMembers(building_id);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ error: "데이터를 찾는 과정에 오류가 발생하였습니다." });
  }
});

router.post("/building/enter", checkAccessTokens,async (req, res) => {
  
  try {
    const id = req.id
    const buildingId = req.body.buildingId
    const userId = await (await UserService(id)).userId;
    const geoFenceInstance = GeoFenceService(userId);
    await geoFenceInstance.entrance(buildingId);
    return res.status(200).send("ok");
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ error: "데이터를 생성하는 과정에 오류가 발생하였습니다." });
  }
})


router.delete("/building/exit", checkAccessTokens ,async (req, res) => {
  
  try {
    const id = req.id
    const buildingId = req.query.buildingId
    const geoFenceInstance = GeoFenceService(id);
    await geoFenceInstance.exit(buildingId);
    return res.status(200).send("ok");
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ error: "데이터를 생성하는 과정에 오류가 발생하였습니다." });
  }
});


router.post("/building/member/message/send", checkAccessTokens, async (req, res) => {
  try {
    const id = req.id
    const { receiver, payload } = req.body
    
  } catch (err) {
    console.log(err)

  }
  


})

module.exports = router