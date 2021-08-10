/**
 * BookingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require("moment");
let crypto = require("crypto");
const fs = require("fs");
let path = require("path");
const ejs = require("ejs");
const pdf = require("html-pdf");
const Customer = require("../models/Customer");

module.exports = {
  checkAvailability: async function (req, res) {
    const uuid = req.query.uuid;
    if(!uuid){
    return res.badRequest({status:false,msg:'please provide correct uuid',data:{}});
    }
    const qrCode = await QRCode.findOne({uuid:uuid});
    if(!qrCode){
    return res.badRequest({status:false,msg:'uuid is expired already',data:{}});
    }
    const Config = await Setting.findOne({ userId: qrCode.userId });
    const format = "YYYY-MM-DD HH:mm:ss";
    const currentDate = moment().format("YYYY-MM-DD");
    const currentTime = moment().format(format);
    let checktime = false;
    let finalCheck = false;
    let message = "";
    Config.slots &&
      Config.slots.map((slot) => {
        let getStart = currentDate + " " + slot.start;
        let getEnd = currentDate + " " + slot.end;
        message +=
          "Start Time:-" + slot.start + " End Time:-" + slot.end + " \n";
        checktime = moment(currentTime).isBetween(getStart, getEnd);
        if (checktime) {
          finalCheck = true;
        }
    });
    if(!finalCheck){
        return res.badRequest({status:false,msg:'Please book appointment between '+message,data:{}});
    }

    const randomValue = Math.floor(Math.random() * 90000) + 10000;

    return res.ok({status:true,data:{orderId:RazorPayOrderID.id,fees:Config.fees},msg:'"Booking Availabile"'});

    return res.ok({
      data: { orderId: RazorPayOrderID.id },
      message: '"Booking Availabile"',
    });
  },
  createNewBooking: async function (req, res) {
    //validate UUID
    const uuid = req.body.uuid;
    if (!uuid) {
      return res.badRequest("please provide correct uuid");
    }
    const qrCode = await QRCode.findOne({ uuid: uuid });
    if (!qrCode) {
      return res.badRequest("uuid is expired already");
    }
    let CustomerRecord = await Customer.findOne({
      mobileNum: req.body.mobileNum,
    });
    if (!CustomerRecord) {
      CustomerRecord = await Customer.create({
        name: req.body.name,
        mobileNum: req.body.mobileNum,
        isMobileNumVerified: req.body.isMobileNumVerified,
        token: req.body.token,
      }).fetch();
    }

    if (req.body.paymentMode && req.body.paymentMode == "online") {
      const validateSignature = crypto
        .createHmac("hmac_sha256", sails.config.RAZOR_SECRET_KEY)
        .update(req.body.order_id + "|" + req.body.razorpay_payment_id);
      if (validateSignature == req.body.razorpay_signature) {
      }
    }

    let BookingDetail = await Booking.create({
      customerId: CustomerRecord.id,
      userId: qrCode.userId,
      bookingDateTime: new Date().toISOString(),
      status: 1,
      searchToken: crypto.randomBytes(50).toString("hex"),
    }).fetch();
 
    res.ok({status:true,msg:'booking created successfully',data:BookingDetail});


        
    },
    createPrescription: async function(req,res){
        const searchToken = req.body.searchToken;
        if(!searchToken){

        }
        let BookingDetail = await Booking.findOne({searchToken:searchToken});
        
        //creating pdf from ejs
        const UserData = await Users.findOne({id:BookingDetail.userId});
        const CustomerData = await Customer.findOne({id:BookingDetail.customerId});
        const UserConfig = await Setting.findOne({userId:BookingDetail.userId});
        const data = {
            customer:CustomerData,
            User:UserData,
            Setting:UserConfig,
            Content:req.body.prescription
        }

        const filePathName = path.resolve('.','views','pages','invoice.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();
        let  options = { format: 'Letter', };
        const ejsData = ejs.render(htmlString, data);
        let finalresponse = await pdf.create(ejsData,options).toFile('./assets/uploads/generatedfile.pdf',(err, response) => {
            if (err) return console.log(err);
            return response;
        });
         let fileLoc = await sails.helpers.uploadFile.with({
             data:'./assets/uploads/generatedfile.pdf'
         });
         fs.unlinkSync('./assets/uploads/generatedfile.pdf');
         let UpdateBooking = await Booking.updateOne({id:BookingDetail.id}).set({userComment:req.body.prescription,status:2,consultTime:moment().format('YYYY-MM-DD HH:mm:ss'),file:fileLoc.Location});
         await sails.helpers.sendMessage.with({
             file:fileLoc.Location,
             mobile:CustomerData.mobileNum
         });
        res.ok({status:true,msg:'Prescription updated successfully',data:UpdateBooking});
    }, 
  BookingListing: async function (req, res) {
    const user = req.user;
    let filter = {};
    const status = parseInt(req.query.status);
    let bookingList = await Booking.find({ status: status, userId: user.id });
    res.ok({ status:true,msg:'Booking List successfully',data: bookingList });
  },
  BookingDetail: async function (req, res) {
    const user = req.user;
    let filter = {};
    const searchToken = req.query.searchToken;
    let bookingDetail = await Booking.findOne({ searchToken: searchToken, userId: user.id });
    let CustomerDetail = await Customer.findOne({id:bookingDetail.customerId});
    //console.log(bookingDetail);
    res.ok({ status:true,msg:'Booking Detail successfully',data: {bookingDetail:bookingDetail,customer:CustomerDetail}});
  },
};
