//Reps 
var reps_data = []
var default_reps = {
  name: "",
  email: "", 
  phone_no : "",
  day: 0,
  month: 0,
  year: 0,
 
}
var campaignId = "#campaignId"
var repsTableId = "#repsTable"
var repsModelId = "#reps-modal"
var repsModalTitle = "#reps-modal-title"
var repsName = "#reps_name"
var repsEmail = "#reps_email"
var repsPhoneNo = "#reps_phone_no" 
var repsId = "#reps_id"
var repsCsvModalTitle = "#repscsv-modal-title"
var repsCsvModelId = "#repscsv-modal"
var repsDataColumns = 
[
  { title: "Name", data: null, render: 'name' },
  { title: "Email", data: null, render: 'email' },
  { title: "PhoneNo", data: null, render: 'phone_no' },
  { title: "Created On", data: null, render: function (data, type, row, meta) {
      return data.day + '/' + data.month + '/' + data.year 
    } 
  },
  { title: "Edit", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<button class="btn btn-warning btn-block" onclick="editReps(\''+data+'\')">Edit</button>':data
  },
}
]
function setRepsFormValues(row) {
  console.log('Set Reps Form');
  console.log(row);
  $(repsId).val(row._id);
  $(repsName).val(row.name);
  $(repsEmail).val(row.email);
  $(repsPhoneNo).val(row.phone_no);
 
}

function getRepsFormValues() {
  return {
    campaignId: $(campaignId).val(),
    name:$(repsName).val(),
    email:$(repsEmail).val(),
    phone_no:$(repsPhoneNo).val(),
    _id: $(repsId).val()
  
  }
}

function getRepsUrl() {
  return used_host + '/reps'
}

function getRepsData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getRepsUrl()+'/campaignId/'+$(campaignId).val(),
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
          console.error('Serverside Error While Geting Repss');
          console.error(json.message)
        }
        else {
          reps_data = json.details
          initRepsTable()
        }
    },
    error: function (data) {
        console.log("Error While Getting Repss");
        console.log(data);
    }
  });
}

function postRepsData(data) {
  if(!data._id) delete data._id
  $.ajax({
    cache: false,
    type: 'POST',
    url: getRepsUrl(),
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
          notifyUser('error', 'Server Error Saving Reps')
          console.log('Serverside Error');
          console.log(json.message)
        }
        else {
          setRepsFormValues(default_reps)
          notifyUser('success', json.message)
          getAllRepss()
        }
    },
    error: function (data) {
      notifyUser('error', 'Error Saving Reps')
        console.log("Error Saving Reps");
        console.log(data);
    }
  });
}

function initRepsTable() {
  console.log('Reps Data');
  console.log(reps_data)
  $(repsTableId).DataTable({
    "destroy": true,
    "lengthMenu": [[5, 10], [5, 10]],
    "autoWidth": false,
    "data": reps_data,
    "stateSave": true,
    "columns": repsDataColumns
  })
}

function getAllRepss() {
  getRepsData()
}

function addRepsCsv() {
  console.log('Add Recepients For Notification');
  $(repsCsvModalTitle).text('Add Recepients For Notification')
  $(repsCsvModelId).modal('show')

}

function addReps(data) {
  console.log('Add Recepients For Notification');
  console.log(data);
  if(data) {
    if(data.name && data.email && data.phone_no ) {
      var row = $.grep(reps_data, function (n,i) {
        if(data._id) {
          if( n.name && n.email && n.phone_no ) {
            return n.name.toLowerCase() == data.name.toLowerCase() && n.email.toLowerCase() == data.email.toLowerCase() && n.phone_no.toLowerCase() == data.phone_no.toLowerCase()  && n._id != data._id
          }
        } else return n.name.toLowerCase() == data.name.toLowerCase() && n.email.toLowerCase() == data.email.toLowerCase() && n.phone_no.toLowerCase() == data.phone_no.toLowerCase() 
      })
      if(row.length > 0) {
        notifyUser('warning', 'Recepients With Name: '+data.name+  ', Email: '+data.email + ' And PhoneNo: '+data.phone_no + ' Already sExists!')
      } else {
        console.log('Saving Data')
        console.log(data)
        postRepsData(data)
      }
    } else {
      notifyUser('error', 'Please Enter Data In All Fields')
    }
  } else {
    setRepsFormValues(default_reps)
    $(repsModalTitle).text('Add Recepients For Notification')
    $(repsModelId).modal('show')
  }

}


function editReps(data) {
  console.log('Edit Recepients For Notification');
  console.log(data);
  
  var row = $.grep(reps_data, function (n,i) {
    return n._id == data
  })
  console.log('After Search');
  console.log(row);
  
  if(row.length > 0) {
    setRepsFormValues(row[0])
    $(repsModalTitle).text('Edit Recepients For Notification')
    $(repsModelId).modal('show')
  } else {
    console.log('Recepiemts Row Not Found')
  }
}

$('#add_reps_button').click(function (params) {
  var data = getRepsFormValues()
  if(!data._id){
    data.day = today.getDate();
    data.month = today.getMonth() + 1;
    data.year= today.getFullYear();

  }
  console.log('Got Reps Form Values');
  console.log(data);
    
  addReps(data)
})
