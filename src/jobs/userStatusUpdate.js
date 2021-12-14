const schedule = require("node-schedule");

const moment = require("moment");
const { sequelize, user,timeTable } = require("../models");
require("moment-timezone");
moment().tz("Asia/Seoul");

let rule = new schedule.RecurrenceRule()
rule.minute = new schedule.Range(0,59,30)

const userStatusUpdate = () => schedule.scheduleJob(rule, async () => {
  const day = moment().day()
  const hour = moment().hour()
  const time = moment().minute() + hour * 60
  
  let transaction = await sequelize.transaction();
   try {
     const allUsers = await user.findAll({
       nest: true,
       raw: true,
       attributes: ["user_id", "time_table.class_type", "status"],
       include: [
         {
           model: timeTable,
           where: {
             start_time: { [Op.lte]: time },
             end_time: { [Op.gte]: time },
             day_of_week: day - 1,
           },
           attributes: [],
           required: false,
         },
       ],
     });

     await Promise.all(
       allUsers.map(async (userData) => {
         let status = 2;
         if (userData.class_type) status = userData.class_type;
         await user.update(
           { status: status },
           { where: { user_id: userData.user_id }, transaction }
         );
       })
     );

   } catch (err) {
     console.log(err);
     throw err;
   }
    
})


module.exports = { userStatusUpdate }

