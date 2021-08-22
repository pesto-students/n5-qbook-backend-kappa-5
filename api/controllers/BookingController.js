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


module.exports = {
  //checking availability for appointment 
  checkAvailability: async function (req, res) {
    try {
      const uuid = req.query.uuid;
      if (!uuid) {
        return res.badRequest({
          status: false,
          msg: "please provide correct uuid",
          data: {},
        });
      }
      const qrCode = await QRCode.findOne({ uuid: uuid });
      if (!qrCode) {
        return res.badRequest({
          status: false,
          msg: "uuid is expired already",
          data: {},
        });
      }
      const Config = await Setting.findOne({ userId: qrCode.userId });
      const format = "YYYY-MM-DD HH:mm";
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
      if (!finalCheck) {
        return res.badRequest({
          status: false,
          msg: "Please book appointment between " + message,
          data: {},
        });
      }
      if(!Config.is_duty){
        return res.badRequest({
          status: false,
          msg: "Doctor is off duty Now! Please book the Appointment Once the Doctor back",
          data: {},
        });
      }
      const randomValue = Math.floor(Math.random() * 90000) + 10000;
      const RazorPayOrderID = await sails.helpers.createOrder.with({amount:Config.fees,currency:'INR',receipt:'receipt#'+randomValue,notes:'Appointment'});
      return res.ok({
        status: true,
        data: { orderId: RazorPayOrderID.id, fees: parseInt(Config.fees)*100 },
        msg: '"Booking Availabile"',
      });

    } catch (err) {
      console.log(err);
      res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },
  //creating new Booking
  createNewBooking: async function (req, res) {
    try {
      //validate UUID
      const uuid = req.body.uuid;
      let transaction_id = "";
      let tokenNumber = 0;
      let expectedDateTime = '';
      let docsData = {};
      let CustomerRecord  = {};
      if (!uuid) {
        return res.badRequest({status: false,msg:"please provide correct uuid",data:{}});
      }
      const qrCode = await QRCode.findOne({ uuid: uuid });
      if (!qrCode) {
        return res.badRequest({status: false,msg:"uuid is expired already",data:{}});
      }
      const setting = await Setting.findOne({userId:qrCode.userId});
     
      CustomerRecord = await Customer.create({
          name: req.body.name,
          mobileNum: req.body.mobileNum,
          isMobileNumVerified: req.body.isMobileNumVerified,
          token: req.body.token,
        }).fetch();
      

      if (req.body.paymentMode && req.body.paymentMode == "online") {
        let transactionData = {};
        const validateSignature = crypto
          .createHmac("sha256", sails.config.RAZOR_SECRET_KEY)
          .update(req.body.order_id + "|" + req.body.razorpay_payment_id).digest('hex');
        //console.log(validateSignature);  
        if (validateSignature == req.body.razorpay_signature) {
          let transactionDetail = await sails.helpers.createTransaction.with({payment_id:req.body.razorpay_payment_id})
          transactionData.payment_id = transactionDetail.id;
          transactionData.entity = transactionDetail.entity;
          transactionData.amount = transactionDetail.amount;
          transactionData.currency = transactionDetail.currency;
          transactionData.status = transactionDetail.status;
          transactionData.method = transactionDetail.method;
          transactionData.captured = transactionDetail.captured;
          transactionData.description = transactionDetail.description;
          transactionData.card_id = transactionDetail.card_id;
          transactionData.email = transactionDetail.email;
          transactionData.card = transactionDetail.card;
          transactionData.contact = transactionDetail.contact;
          transactionData.fee = transactionDetail.fee;
          transactionData.transactionInfo = transactionDetail;

          let transaction = await Transaction.create(transactionData).fetch();
          transaction_id = transaction.id;
          //console.log('transactionDetail',transactionDetail);
        }else{
          return res.badRequest({status: false,msg:"Something wrong with your payment please try agian",data:{}});
        }
      }

      let BookingDetail = await Booking.create({
        customerId: CustomerRecord.id,
        userId: qrCode.userId,
        bookingDateTime: new Date().toISOString(),
        status: 1,
        fees:setting.fees,
        paymentMode: req.body.paymentMode,
        searchToken: crypto.randomBytes(50).toString("hex"),
        transactionId:transaction_id,
        customerInfo: {
          name: CustomerRecord.name,
          mobile: CustomerRecord.mobileNum,
        },
      }).fetch();

      let totalBooking = await Booking.count({userId:qrCode.userId,status:1});
      tokenNumber = totalBooking;
      const totalMinute = totalBooking * sails.config.consultTime;
      expectedDateTime = moment().add(totalMinute,'minutes').toISOString();
      docsData = await Users.findOne({id:qrCode.userId});

      let QueueCreated = await Queue.create({
        customerId:CustomerRecord.id,
        currentToken:tokenNumber,
        estimatedDateTime:expectedDateTime,
        userId:qrCode.userId,
        bookingId:BookingDetail.id,
        customerInfo:{
          name: CustomerRecord.name,
          mobile: CustomerRecord.mobileNum,
        },
        userInfo:docsData,
      }).fetch();

      //sending push notfication
      if(docsData.token && docsData.token != ""){
      const message = {
        data: BookingDetail,
        notification:{title:"New Booking Recieved",body:"New Booking from "+req.body.name},
        token:docsData.token
      };
      //const notification = await sails.helpers.sendNotification.with(message);
    }
      res.ok({
        status: true,
        msg: "booking created successfully",
        data: {booking:BookingDetail,tokenNumber:tokenNumber,expectedDateTime:expectedDateTime,docsData:docsData},
      });
    } catch (err) {
      console.log(err);
      res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },
  //create Prescription for customer
  createPrescription: async function (req, res) {
    try {
      const searchToken = req.body.searchToken;
      if (!searchToken) {
      }
      let BookingDetail = await Booking.findOne({ searchToken: searchToken });

      //creating pdf from ejs
      const UserData = await Users.findOne({ id: BookingDetail.userId });
      const CustomerData = await Customer.findOne({
        id: BookingDetail.customerId,
      });
      const UserConfig = await Setting.findOne({
        userId: BookingDetail.userId,
      });
      const data = {
        customer: CustomerData,
        User: UserData,
        Setting: UserConfig,
        Prescription: req.body.prescription,
        Diagnosis: req.body.diagnosis,
        Mode: BookingDetail.paymentMode,
      };

      const filePathName = path.resolve(".", "views", "pages", "invoice.ejs");
      const htmlString = fs.readFileSync(filePathName).toString();
      let options = { format: "Letter" };
      const ejsData = ejs.render(htmlString, data);
      //console.log(ejsData);
      let finalresponse = await pdf
        .create(ejsData, options)
        .toFile("./assets/uploads/generatedfile.pdf", (err, response) => {
          if (err) return console.log(err);
          return response;
        });
      let fileLoc = await sails.helpers.uploadFile.with({
        data: "./assets/uploads/generatedfile.pdf",
      });
      fs.unlinkSync("./assets/uploads/generatedfile.pdf");
      let UpdateBooking = await Booking.updateOne({ id: BookingDetail.id }).set(
        {
          diagnosis: req.body.diagnosis,
          userComment: req.body.prescription,
          status: 2,
          consultTime: new Date().toISOString(),
          file: fileLoc.Location,
        }
      );
      await sails.helpers.sendMessage.with({
        messgaeType:'precription',
        file: fileLoc.Location,
        mobile: CustomerData.mobileNum,
      });

      let removeQueue = await Queue.destroyOne({bookingId:BookingDetail.id,customerId:BookingDetail.customerId,userId:BookingDetail.userId});

    

      let DoctorsQueue = await Queue.find({userId:BookingDetail.userId});

      DoctorsQueue && DoctorsQueue.length > 0 && DoctorsQueue.map(async(queue) => {
        let token = queue.currentToken;
        token = token - 1;
        const totalMinute = token * sails.config.consultTime;
        const expectedDateTime = moment().add(totalMinute,'minutes').toISOString();
        await Queue.update({userId:queue.userId,customerId:queue.customerId}).set({currentToken:token,estimatedDateTime:expectedDateTime});
      });

      let nextQueue = await Queue.find({
        userId:BookingDetail.userId
      }).sort([{currentToken: 'ASC'}]).limit(1);


    if(nextQueue && nextQueue.length > 0){

      let NextCustomer = await Customer.findOne({id:nextQueue[0].customerId});
      if(NextCustomer.token && NextCustomer.token != ""){
      const message = {
        data: nextQueue[0],
        notification:{title:"Your number is about to come",body:"Your Queue is Reduced Now, Please ready to go inside"},
        token:NextCustomer.token
      };
      //const notification = await sails.helpers.sendNotification.with(message);
    }
  }

      res.ok({
        status: true,
        msg: "Prescription updated successfully",
        data: UpdateBooking,
      });
    } catch (err) {
      console.log(err);
      res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },
  //Booking list api for doctor
  BookingListing: async function (req, res) {
    try {
      const user = req.user;
      let bookingList = [];
      const status = parseInt(req.query.status);
      if(status == 1){
         bookingList = await Booking.find({ status: status, userId: user.id });
      }else{
         let filter = {userId: user.id,status:{'>':1}};
         if(req.query.todate && req.query.fromdate){
          let bookingtoDate = new Date(req.query.todate).toISOString();
          let bookingfromDate = new Date(req.query.fromdate).toISOString();
          filter['bookingDateTime'] = {'>=':bookingfromDate,'<=':bookingtoDate};
         }
         bookingList = await Booking.find(filter);
      }
      
      res.ok({
        status: true,
        msg: "Booking List successfully",
        data: bookingList,
      });
    } catch (err) {
      console.log(err);
      res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },
  //booking Detail api 
  BookingDetail: async function (req, res) {
    try {
      const user = req.user;
      let filter = {};
      const searchToken = req.query.searchToken;
      let bookingDetail = await Booking.findOne({
        searchToken: searchToken,
        userId: user.id,
      });
      let CustomerDetail = await Customer.findOne({
        id: bookingDetail.customerId,
      });
      
      res.ok({
        status: true,
        msg: "Booking Detail",
        data: { bookingDetail: bookingDetail, customer: CustomerDetail },
      });
    } catch (err) {
      console.log(err);
      res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },
  //booking Confirmation for customer
  bookingConfirmation: async function(req,res){
    try{
      let tokenNumber = 0;
      let expectedDateTime = '';
      let docsData = {};
      const searchToken = req.query.searchToken;
      if(!searchToken){
        res.badRequest({
          status: false,
          msg: "please provide searchToken",
          data: {},
        });
      }
      let bookingDetail = await Booking.findOne({
        searchToken: searchToken,
        status:1
      });
      if(!bookingDetail){
        res.badRequest({
          status: false,
          msg: "please provide correct searchToken",
          data: {},
        });
      }

      let QueueData = await Queue.findOne({bookingId:bookingDetail.id,customerId:bookingDetail.customerId,userId:bookingDetail.userId}); 
      docsData = await Users.findOne({id:bookingDetail.userId});


      res.ok({
        status: true,
        msg: "booking confirmation ",
        data: {booking:bookingDetail,tokenNumber:QueueData.currentToken,expectedDateTime:QueueData.estimatedDateTime,docsData:docsData},
      });



    } catch (err) {
      console.log(err);
      res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },
  //cancel All Booking API
  CancelledAllBooking: async function (req,res){
     try{
       const user = req.user;
       //cancelled All Active Booking
       let BookingList = await Booking.find({userId:user.id,status:1});
       BookingList && BookingList.map(async(book) => {
        
        await sails.helpers.sendMessage.with({
          messgaeType:'cancel',
          file: '',
          mobile: book.customerInfo.mobile,
        });
        
       })
       await Booking.update({userId:user.id,status:1}).set({status:3,userComment:'Booking Cancelled By '+user.firstname});
       await Queue.destroy({userId:user.id}).fetch();

       res.ok({
        status: true,
        msg: "booking cancelled Successfully! ",
        data: {},
      });

     }catch(err){
      console.log(err);
      res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
     }
  }
};
