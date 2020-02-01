
var encoder_data = []
var encoderDate = "#encoder_date"
var encoderTablId = "#encoder_table"
var searchButton = '#search_button'

var encodedDataColumn = 
[
  { title: "Device Id", data: null, render: 'imei_no' },
  { title: "Street", data: null, render: function (data, type, row, meta) {
      return data.street_no + ', ' + data.street 
    }  
  },
  { title: "City", data: null, render: 'city' },
  { title: "State", data: null, render: 'state' },
  { title: "Zip", data: null, render: 'zip' },
  { title: "Date", data: null, render: function (data, type, row, meta) {
    var formated_date = DateTime.fromObject({year: data.year,month: data.month,day: data.day, zone:'UTC'}).setZone('UTC-5')
      return formated_date.day + '/' + formated_date.month + '/' + formated_date.year 
    } 
  }
]

function getEncoderUrl() {
  return used_host + "/location/geoencoder"
}

function postEncoderData(data) {
  $.ajax({
    cache: false,
    type: 'POST',
    url: getEncoderUrl(),
    dataType: 'json',
    data: data,
    xhrFields: {
        // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
        // This can be used to set the 'withCredentials' property.
        // Set the value to 'true' if you'd like to pass cookies to the server.
        // If this is enabled, your server must respond with the header
        // 'Access-Control-Allow-Credentials: true'.
        withCredentials: false
    },
    success: function (json) {
        if (!json.status) {
          notifyUser('error', 'Server Error Getting Location Report')
          console.log('Serverside Error');
          console.log(json.message)
        }
        else {
          encoder_data = json.details
          initEncoderTable()
        }
    },
    error: function (data) {
      notifyUser('error', 'Error Getting Location Report')
        console.log("Error Getting Location Report");
        console.log(data);
    }
  });
}

function initEncoderTable() {
  console.log('Encoder Data');
  console.log(encoder_data)
  $(encoderTablId).DataTable({
    "destroy": true,
    "lengthMenu": [[5, 10], [5, 10]],
    "autoWidth": false,
    "data": encoder_data,
    "subscriptionSave": true,
    "columns": encodedDataColumn
  })
}

$(searchButton).click(function searchClicked() {
  var selected_date = $(encoderDate).val()
  if(selected_date) {
    var imei_nos = []
    $.each(asset_allocation_data, function (indx, imei_data) {
      imei_nos.push(imei_data.imei_no)
    })
    console.log(imei_nos);
    
    postEncoderData({selectedDate: selected_date, imei_nos: imei_nos})
  } else {
    notifyUser('error', 'Select A Valid Date!')
  }
  
})

$(document).ready(function() {
  var today = new Date()
  $(encoderDate).val(today.getFullYear()+'-'+((today.getMonth()+1)<10?'0':'')+'-'+(today.getDate()<10?'0':''))
});
