//Device 
var device_data = []
var default_device = {
  imei_no : "",
  sim_no : "",
  active:false,
  allocated: false,
  assigned: false,
  day: 0,
  month: 0,
  year: 0,
  _id: ""
}
var deviceTableId = "#deviceTable"
var deviceModelId = "#device-modal"
var deviceModalTitle = "#device-modal-title"
var deviceSimNo = "#device_sim_no"
var deviceImeiNo = "#device_imei_no"
var deviceId = "#device_id"
var deviceDataColumns = 
[
  { title: "IMEI No", data: null, render: 'imei_no' },
  { title: "Sim No", data: null, render: 'sim_no' },
  { title: "Date_Recorded", data: null, render: function (data, type, row, meta) {
      return data.day + '/' + data.month + '/' + data.year 
    } 
  },
  { title: "Status", data: null, render: function (data, type, row, meta) {
      return data.active ? '<span style="color:green">Active</span>' : '<span style="color:red">Not Active</span>'
    } 
  },
  { title: "Status", data: null, render: function (data, type, row, meta) {
      return data.allocated ? '<span style="color:green">Alocated</span>' : '<span style="color:red">Not Alocated</span>'
    } 
  },
  { title: "Status", data: null, render: function (data, type, row, meta) {
      return data.assigned ? '<span style="color:green">Assigned</span>' : '<span style="color:red">Not Assigned</span>'
    } 
  },
  { title: "Edit", data: '_id', render: function (data, type, row, meta) {
      return type === 'display'? '<button class="btn btn-warning btn-block" onclick="editDevice(\''+data+'\')">Edit</button>':data
    } 
  }
]
function setDeviceFormValues(row) {
  console.log('Set Process Form');
  console.log(row);
  $(deviceId).val(row._id);
  $(deviceImeiNo).val(row.imei_no);
  $(deviceSimNo).val(row.sim_no);
}

function getDeviceFormValues() {
  return {
    imei_no:$(deviceImeiNo).val(),
    sim_no:$(deviceSimNo).val(),
    _id: $(deviceId).val()
  }
}

function getDeviceUrl() {
  return used_host + '/device'
}

function getDeviceData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getDeviceUrl()+'/all',
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
          console.error('Serverside Error While Geting Devices');
          console.error(json.message)
        }
        else {
          device_data = json.details
          initDeviceTable()
        }
    },
    error: function (data) {
        console.log("Error While Getting Devices");
        console.log(data);
    }
  });
}

function postDeviceData(data) {
  if(!data._id) delete data._id
  $.ajax({
    cache: false,
    type: 'POST',
    url: getDeviceUrl(),
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
          notifyUser('danger', 'Server Error Saving Device')
          console.log('Serverside Error');
          console.log(json.message)
        }
        else {
          setDeviceFormValues(default_device)
          notifyUser('success', json.message)
          getAllDevices()
        }
    },
    error: function (data) {
      notifyUser('danger', 'Error Saving Device')
        console.log("Error Saving Device");
        console.log(data);
    }
  });
}

function initDeviceTable() {
  console.log('Device Data');
  console.log(device_data)
  $(deviceTableId).DataTable({
    "destroy": true,
    "lengthMenu": [[5, 10], [5, 10]],
    "autoWidth": true,
    "data": device_data,
    "stateSave": true,
    "columns": deviceDataColumns
  })
}

function getAllDevices() {
  getDeviceData()
}

function addDevice(data) {
  console.log('Add Device');
  console.log(data);
  if(data) {
    if(data.imei_no || data.sim_no) {
      var row = $.grep(device_data, function (n,i) {
        if(data._id) {
          if(n.imei_no && n.sim_no) {
            return n.imei_no.toLowerCase() == data.imei_no.toLowerCase() && n.sim_no.toLowerCase() == data.sim_no.toLowerCase() && n._id != data._id
          }
        } else return n.imei_no.toLowerCase() == data.imei_no.toLowerCase() && n.sim_no.toLowerCase() == data.sim_no.toLowerCase()
      })
      if(row.length > 0) {
        notifyUser('warning', 'Device With IMEI_No: '+data.imei_no+ 'Or Device With Phone_No: '+data.sim_no + 'Already Exists!')
      } else {
        console.log('Saving Data')
        console.log(data)
        postDeviceData(data)
      }
    } else {
      notifyUser('error', 'Please Enter Data In All Fields ')
    }
  } else {
    setDeviceFormValues(default_device)
    $(deviceModalTitle).text('Add Device')
    $(deviceModelId).modal('show')
  }

}

function editDevice(data) {
  console.log('Edit Device');
  console.log(data);
  
  var row = $.grep(device_data, function (n,i) {
    return n._id == data
  })
  console.log('After Search');
  console.log(row);
  
  if(row.length > 0) {
    setDeviceFormValues(row[0])
    $(deviceModalTitle).text('Edit Device')
    $(deviceModelId).modal('show')
  } else {
    console.log('Device Row Not Found')
  }
}

$('#add_device_button').click(function (params) {
  var data = getDeviceFormValues()
  if(!data._id){
    data.day = today.getDate();
    data.month = today.getMonth() + 1;
    data.year= today.getFullYear();
    data.active = false;
    data.allocated = false;
    data.assigned = false
  }
  console.log('Got Device Form Values');
  console.log(data);
    
  addDevice(data)
})
