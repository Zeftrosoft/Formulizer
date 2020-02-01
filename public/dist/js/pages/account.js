//Account 
var account_data = []
var default_account = {
  name: "",
  street: "", 
  city : "",
  state: "",
  zip: "",
  day: 0,
  month: 0,
  year: 0,
  active: true
 
}
var accountTableId = "#accountTable"
var accountModelId = "#account-modal"
var accountModalTitle = "#account-modal-title"
var accountAccountName = "#account_name"
var accountStreet = "#account_street"
var accountCity = "#account_city" 
var accountState = "#account_state"
var accountZip = "#account_zip"
var accountId = "#account_id"
var accountDataColumns = 
[
  { title: "Account Name", data: null, render: 'name' },
  { title: "Street", data: null, render: 'street' },
  { title: "City", data: null, render: 'city' },
  { title: "State", data: null, render: 'state' },
  { title: "Zip", data: null, render: 'zip' },
  { title: "Created On", data: null, render: function (data, type, row, meta) {
      return data.day + '/' + data.month + '/' + data.year 
    } 
  },
  { title: "Status", data: null, render: function (data, type, row, meta) {
      return data.active ? '<span style="color:green">Active</span>' : '<span style="color:red">Not Active</span>'
    } 
  },
  { title: "View", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<a class="btn btn-success btn-block" href="/account/'+data+'">View</a>':data
    },
  },
  { title: "Edit", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<button class="btn btn-warning btn-block" onclick="editAccount(\''+data+'\')">Edit</button>':data
    },
  }
]
function setAccountFormValues(row) {
  console.log('Set Account Form');
  console.log(row);
  $(accountId).val(row._id);
  $(accountAccountName).val(row.name);
  $(accountStreet).val(row.street);
  $(accountCity).val(row.city);
  $(accountState).val(row.state);
  $(accountZip).val(row.zip);
}

function getAccountFormValues() {
  return {
    name:$(accountAccountName).val(),
    street:$(accountStreet).val(),
    city:$(accountCity).val(),
    state:$(accountState).val(),
    zip:$(accountZip).val(),
    _id: $(accountId).val()
  
  }
}

function getAccountUrl() {
  return used_host + '/account'
}

function getAccountData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getAccountUrl()+'/all',
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
          console.error('Serverside Error While Geting Accounts');
          console.error(json.message)
        }
        else {
          account_data = json.details
          initAccountTable()
        }
    },
    error: function (data) {
        console.log("Error While Getting Accounts");
        console.log(data);
    }
  });
}

function postAccountData(data) {
  if(!data._id) delete data._id
  $.ajax({
    cache: false,
    type: 'POST',
    url: getAccountUrl(),
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
          notifyUser('error', 'Server Error Saving Account')
          console.log('Serverside Error');
          console.log(json.message)
        }
        else {
          setAccountFormValues(default_account)
          notifyUser('success', json.message)
          getAllAccounts()
        }
    },
    error: function (data) {
      notifyUser('error', 'Error Saving Account')
        console.log("Error Saving Account");
        console.log(data);
    }
  });
}

function initAccountTable() {
  console.log('Account Data');
  console.log(account_data)
  $(accountTableId).DataTable({
    "destroy": true,
    "lengthMenu": [[5, 10], [5, 10]],
    "autoWidth": true,
    "data": account_data,
    "stateSave": true,
    "columns": accountDataColumns
  })
}

function getAllAccounts() {
  getAccountData()
}

function addAccount(data) {
  console.log('Add Account');
  console.log(data);
  if(data) {
    if(data.name && data.street && data.city && data.state && data.zip ) {
      var row = $.grep(account_data, function (n,i) {
        if(data._id) {
          if( n.name ) {
            return n.name.toLowerCase() == data.name.toLowerCase() && n._id != data._id
          }
        } else return n.name.toLowerCase() == data.name.toLowerCase() 
      })
      if(row.length > 0) {
        notifyUser('warning', 'Account Name: '+data.name+' Already Exists!')
      } else {
        console.log('Saving Data')
        console.log(data)
        postAccountData(data)
      }
    } else {
      notifyUser('error', 'Please Enter Data In All Fields ')
    }
  } else {
    setAccountFormValues(default_account)
    $(accountModalTitle).text('Add Account')
    $(accountModelId).modal('show')
  }

}

function editAccount(data) {
  console.log('Edit Account');
  console.log(data);
  
  var row = $.grep(account_data, function (n,i) {
    return n._id == data
  })
  console.log('After Search');
  console.log(row);
  
  if(row.length > 0) {
    setAccountFormValues(row[0])
    $(accountModalTitle).text('Edit Account')
    $(accountModelId).modal('show')
  } else {
    console.log('Account Row Not Found')
  }
}

$('#add_account_button').click(function (params) {
  var data = getAccountFormValues()
  if(!data._id){
    data.day = today.getDate();
    data.month = today.getMonth() + 1;
    data.year= today.getFullYear();
    data.active = false;
  }
  console.log('Got Account Form Values');
  console.log(data);
    
  addAccount(data)
})
