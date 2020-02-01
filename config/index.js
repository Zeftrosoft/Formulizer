module.exports = {

}
module.exports.mail = {
  service: 'gmail',
  //host: "a2plcpnl0623.prod.iad2.secureserver.net",
  //secureConnection: true,
  //port: 465,
      auth: {
          user: '',
          pass: ''
      },
     from: 'someMail@gmail.com',
     to: [
         'someMail1@gmail.com',
         'someMail2@gmail.com'
     ]
}

module.exports.tables = {
  USER : "users",
}