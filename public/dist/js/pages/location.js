//Location 
var location_data = []
var default_location = {
  type:"",
  name: "",
  street: "", 
  city : "",
  state: "",
  zip: "",
  geofence:"",
  final_dest:"",
  day: 0,
  month: 0,
  year: 0,
  active: false
 
}
var locationTableId = "#locationTable"
var locationModelId = "#location-modal"
var locationModalTitle = "#location-modal-title"
var locationCsvModalTitle = "#locationcsv-modal-title"
var locationCsvModelId = "#locationcsv-modal"
var locationType = "#location_type_selection_box"
var locationName = "#location_name"
var locationStreet = "#location_street"
var locationCity = "#location_city" 
var locationState = "#location_state"
var locationZip = "#location_zip"
var locationGeofence = "#geofence_box"
var locationFinalDest = "#final_dest_box"
var locationId = "#location_id"
var campaignId = "#campaignId"
var locationDataColumns = 
[
  { title: "Name", data: null, render: 'name' },
  { title: "Street", data: null, render: 'street' },
  { title: "City", data: null, render: 'city' },
  { title: "State", data: null, render: 'state' },
  { title: "Zip", data: null, render: 'zip' },
  { title: "Type", data: null, render: 'type' },
  { title: "Geofence", data: null, render: 'geofence' },
  { title: "Final Dest", data: null, render: 'final_dest' },
  { title: "Created On", data: null, render: function (data, type, row, meta) {
      return data.day + '/' + data.month + '/' + data.year 
    } 
  },
  { title: "Status", data: null, render: function (data, type, row, meta) {
      return data.active ? '<span style="color:green">Active</span>' : '<span style="color:red">Not Active</span>'
    } 
  },
  { title: "Edit", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<button class="btn btn-warning btn-block" onclick="editLocation(\''+data+'\')">Edit</button>':data
  },
}
]
function setLocationFormValues(row) {
  console.log('Set Location Form');
  console.log(row);
  $(locationId).val(row._id);
  $(locationType).val(row.type);
  $(locationName).val(row.name);
  $(locationStreet).val(row.street);
  $(locationCity).val(row.city);
  $(locationState).val(row.state);
  $(locationZip).val(row.zip);
  $(locationGeofence).prop('checked', row.geofence);
  $(locationFinalDest).prop('checked',row.final_dest);
}

function getLocationFormValues() {
  return {
    campaignId: $(campaignId).val(),
    name:$(locationName).val(),
    type:$(locationType).val(),
    street:$(locationStreet).val(),
    city:$(locationCity).val(),
    state:$(locationState).val(),
    zip:$(locationZip).val(),
    geofence:$(locationGeofence).is(':checked'),
    final_dest:$(locationFinalDest).is(':checked'),
    _id: $(locationId).val()
  }
}

function getLocationUrl() {
  return used_host + '/location'
}

function getLocationData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getLocationUrl()+'/campaignId/'+$(campaignId).val(),
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
          console.error('Serverside Error While Geting Locations');
          console.error(json.message)
        }
        else {
          location_data = json.details
          initLocationTable()
        }
    },
    error: function (data) {
        console.log("Error While Getting Locations");
        console.log(data);
    }
  });
}

function postLocationData(data) {
  if(!data._id) delete data._id
  $.ajax({
    cache: false,
    type: 'POST',
    url: getLocationUrl(),
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
          notifyUser('error', 'Server Error Saving Location')
          console.log('Serverside Error');
          console.log(json.message)
        }
        else {
          setLocationFormValues(default_location)
          notifyUser('success', json.message)
          getAllLocations()
        }
    },
    error: function (data) {
      notifyUser('error', 'Error Saving Location')
        console.log("Error Saving Location");
        console.log(data);
    }
  });
}

function initLocationTable() {
  console.log('Location Data');
  console.log(location_data)
  $(locationTableId).DataTable({
    "destroy": true,
    "lengthMenu": [[5, 10], [5, 10]],
    "autoWidth": false,
    "data": location_data,
    "stateSave": true,
    "columns": locationDataColumns
  })
}

function getAllLocations() {
  getLocationData()
}

function addLocationCsv() {
  console.log('Add Bulk Locations');
  $(locationCsvModalTitle).text('Add Bulk Locations')
  $(locationCsvModelId).modal('show')
}
function addLocation(data) {
  console.log('Add Location');
  console.log(data);
  if(data) {
    if(data.type && data.name && data.street && data.city && data.state && data.zip  ) {
      var row = $.grep(location_data, function (n,i) {
        if(data._id) {
          if( n.type && n.name && n.street && n.city && n.state && n.zip  ) {
            return n.name.toLowerCase() == data.name.toLowerCase() && n.street.toLowerCase() == data.street.toLowerCase() && n.city.toLowerCase() == data.city.toLowerCase() && n.state.toLowerCase() == data.state.toLowerCase() && n.zip == data.zip  && n._id != data._id
          }
        } else return n.name.toLowerCase() == data.name.toLowerCase() && n.street.toLowerCase() == data.street.toLowerCase() && n.city.toLowerCase() == data.city.toLowerCase() && n.state.toLowerCase() == data.state.toLowerCase() && n.zip == data.zip
      })
      if(row.length > 0) {
        notifyUser('warning', 'Location With  Type: '+data.type+ 'Location With  Name: '+data.name+  'Or Location With street: '+data.street + 'Or Location With City: '+data.city + 'Or Location With state: '+data.state + 'Or Location With Zip: '+data.zip + 'Or Location With Geofence: '+data.geofence + 'Or Location With Final_Dest: '+data.final_dest +'Already Exists!')
      } else {
        console.log('Saving Data')
        console.log(data)
        postLocationData(data)
      }
    } else {
      notifyUser('error', 'Please Enter Data In All Fields ')
    }
  } else {
    setLocationFormValues(default_location)
    $(locationModalTitle).text('Add Location')
    $(locationModelId).modal('show')
  }

}

function editLocation(data) {
  console.log('Edit Location');
  console.log(data);
  
  var row = $.grep(location_data, function (n,i) {
    return n._id == data
  })
  console.log('After Search');
  console.log(row);
  
  if(row.length > 0) {
    setLocationFormValues(row[0])
    $(locationModalTitle).text('Edit Location')
    $(locationModelId).modal('show')
  } else {
    console.log('Location Row Not Found')
  }
}

$('#add_location_button').click(function (params) {
  var data = getLocationFormValues()
  if(!data._id){
    data.day = today.getDate();
    data.month = today.getMonth() + 1;
    data.year= today.getFullYear();
    data.active = false;
  }
  console.log('Got Location Form Values');
  console.log(data);
    
  addLocation(data)
})
