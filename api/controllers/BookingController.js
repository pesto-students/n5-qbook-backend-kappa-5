/**
 * BookingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');
var crypto = require('crypto');

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

    const randomValue =  Math.floor(Math.random() * 90000) + 10000;

    const RazorPayOrderID = await sails.helpers.createOrder.with({amount:Config.fees,currency:'INR',receipt:'receipt#'+randomValue,notes:'Appointment'});

    return res.ok({data:{orderId:RazorPayOrderID.id},message:'"Booking Availabile"'});

    },
    createNewBooking: async function(req,res){
     //validate UUID
     const uuid = req.body.uuid;
     if(!uuid){
    return res.badRequest('please provide correct uuid');
     }
    const qrCode = await QRCode.findOne({uuid:uuid});
    if(!qrCode){
    return res.badRequest('uuid is expired already');
    }
    let CustomerRecord = await Customer.findOne({mobileNum:req.body.mobileNum}); 
    if(!CustomerRecord){
        CustomerRecord = await Customer.create({
            'name':req.body.name,
            'mobileNum':req.body.mobileNum,
            'isMobileNumVerified':req.body.isMobileNumVerified,
            'token':req.body.token
        }).fetch();
    }
    
    if(req.body.paymentMode && req.body.paymentMode == 'online'){
        const validateSignature = crypto.createHmac('hmac_sha256',sails.config.RAZOR_SECRET_KEY).update(req.body.order_id + "|" + req.body.razorpay_payment_id);
        if(validateSignature == req.body.razorpay_signature){
         
        }
    }

    let BookingDetail = await Booking.create({
        'customerId':CustomerRecord.id,
        'userId':qrCode.userId,
        'bookingDateTime':moment().format('YYYY-MM-DD HH:mm:ss'),
        'status':1,
        'searchToken':crypto.randomBytes(50).toString('hex'),
    }).fetch();
 
    res.ok('booking created successfully');


        
    },
    createPrescription: async function(req,res){
        const searchToken = req.body.searchToken;
        if(!searchToken){

        }

        let BookingDetail = await Booking.findOne({searchToken:searchToken});
        let UpdateBooking = await Booking.updateOne({id:BookingDetail.id}).set({userComment:req.body.prescription,status:2,consultTime:moment().format('YYYY-MM-DD HH:mm:ss')});
        res.ok(UpdateBooking);


    } 


};

