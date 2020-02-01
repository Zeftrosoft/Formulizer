//Customer 
var customer_data = []
var default_customer = {
  name: "",
  phoneNo: "",
  note: ""
 }

var customerTableId = "#customerTable"
var customerModelId = "#customer-modal"
var customerModalTitle = "#customer-modal-title"
var customerName = "#customer_name"
var customerPhoneNo = "#customer_phoneNo"
var customerNote = "#customer_note" 
var customerId = "#customer_id"
var customerDataColumns = 
[
  { title: "Name", data: null, render: 'name' },
  { title: "Phone No.", data: null, render: 'phoneNo' },
  
  { title: "View", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<a class="btn btn-success btn-block" href="/customer/'+data+'">View</a>':data
    },
  },
  { title: "Edit", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<button class="btn btn-warning btn-block" onclick="editCustomer(\''+data+'\')">Edit</button>':data
    },
  }
]
function setCustomerFormValues(row) {
  console.log('Set Customer Form');
  console.log(row);
  $(customerId).val(row._id);
  $(customerName).val(row.name);
  $(customerPhoneNo).val(row.phoneNo);
  $(customerNote).val(row.note);
}

function getCustomerFormValues() {
  return {
    customerId:$(customerId).val(),
    name:$(customerName).val(),
    phoneNo:$(customerPhoneNo).val(),
    note:$(customerNote).val(),
    _id: $(customerId).val()
  }
}



function getCustomerData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getCustomerUrl()+'/all',
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
          console.error('Serverside Error While Geting Customers');
          console.error(json.message)
        }
        else {
          customer_data = json.details
          initCustomerTable()
        }
    },
    error: function (data) {
        console.log("Error While Getting Customers");
        console.log(data);
    }
  });
}

function postCustomerData(data) {
  if(!data._id) delete data._id
  $.ajax({
    cache: false,
    type: 'POST',
    url: getCustomerUrl(),
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
          notifyUser('error', 'Server Error Saving Customer')
          console.log('Serverside Error');
          console.log(json.message)
        }
        else {
          setCustomerFormValues(default_customer)
          notifyUser('success', json.message)
          getAllCustomers()
        }
    },
    error: function (data) {
      notifyUser('error', 'Error Saving Customer')
        console.log("Error Saving Customer");
        console.log(data);
    }
  });
}

function initCustomerTable() {
  console.log('Customer Data');
  console.log(customer_data)
  $(customerTableId).DataTable({
    "destroy": true,
    "lengthMenu": [[5, 10], [5, 10]],
    "autoWidth": true,
    "data": customer_data,
    "stateSave": true,
    "columns": customerDataColumns
  })
}

function getAllCustomers() {
  getCustomerData()
}

function addCustomer(data) {
  console.log('Add Customer');
  console.log(data);
  if(data) {
    if(data.name && data.phoneNo ) {
      var row = $.grep(customer_data, function (n,i) {
        if(data._id) {
          if( n.name ) {
            return n.name.toLowerCase() == data.name.toLowerCase() && n.phoneNo.toLowerCase() == data.phoneNo.toLowerCase() && n._id != data._id
          }
        } else return n.name.toLowerCase() == data.name.toLowerCase()  && n.phoneNo.toLowerCase() == data.phoneNo.toLowerCase()
      })
      if(row.length > 0) {
        notifyUser('warning', 'Customer With Name: '+data.name+  ' Already Exists!')
      } else {
        console.log('Saving Data')
        console.log(data)
        postCustomerData(data)
      }
    } else {
      notifyUser('error', 'Please Enter Data In All Fields ')
    }
  } else {
    setCustomerFormValues(default_customer)
    $(customerModalTitle).text('Add Customer')
    $(customerModelId).modal('show')
  }

}

function editCustomer(data) {
  console.log('Edit Customer');
  console.log(data);
  
  var row = $.grep(customer_data, function (n,i) {
    return n._id == data
  })
  console.log('After Search');
  console.log(row);
  
  if(row.length > 0) {
    setCustomerFormValues(row[0])
    $(customerModalTitle).text('Edit Customer')
    $(customerModelId).modal('show')
  } else {
    console.log('Customer Row Not Found')
  }
}

$('#add_customer_button').click(function (params) {
  var data = getCustomerFormValues()
  console.log('Got Customer Form Values');
  console.log(data);
  addCustomer(data)
})
