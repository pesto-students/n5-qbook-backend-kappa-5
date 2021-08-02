/**
 * BookingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');


module.exports = {
  
checkAvailability:  async function(req,res){
    
    const uuid = req.query.uuid;
    if(!uuid){
    return res.badRequest('please provide correct uuid');
    }
    const qrCode = await QRCode.findOne({uuid:uuid});
    if(!qrCode){
    return res.badRequest('uuid is expired already');
    }
    const Config = await Setting.findOne({userId:qrCode.userId});
    const format = 'YYYY-MM-DD HH:mm:ss';
    const currentDate = moment().format('YYYY-MM-DD');
    const currentTime = moment().format(format);
    let checktime = false;
    let finalCheck = false;  
    let message = '';   
    Config.slots && Config.slots.map(slot => {
        let getStart = currentDate+' '+slot.start;
        let getEnd = currentDate+' '+slot.end;
        message += 'Start Time:-'+slot.start+' End Time:-'+slot.end+' \n';
        checktime = moment(currentTime).isBetween(getStart,getEnd);
        if(checktime){
            finalCheck = true;
        }
    });
    if(!finalCheck){
        return res.badRequest('Please book appointment between '+message);
    }

    return res.ok("Booking Availabile");

    }

};

