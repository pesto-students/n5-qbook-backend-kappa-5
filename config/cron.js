module.exports.cron = {
    cancelAllAppointment: {
      schedule: '55 23 * * *',
      onTick: async function() {
        console.log('Cancelling All Appointment which is not entertained!');
        let bookingList = await Booking.update({status:1}).set({status:3}).fetch();
      },
      start: true, 
    }
  };