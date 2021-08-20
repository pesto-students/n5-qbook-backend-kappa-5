module.exports.cron = {
    cancelAllAppointment: {
      schedule: '55 23 * * *',
      onTick: async function() {
        console.log('I am triggering when time is come');
        let bookingList = await Booking.update({status:1}).set({status:3}).fetch();
      },
      start: true, 
    }
  };