var local = 'http://localhost:12345/api'
var online = 'http://52.8.236.185:12345/api'
var DateTime = luxon.DateTime;
var used_host = local;
var today = new Date 

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000
});

function notifyUser(type, message) {
  Toast.fire({
    type: type,
    title: message
  })
}
function getCustomerUrl() {
  return used_host + '/customer'
}

function getShadeUrl() {
  return used_host + '/shade'
}