var asset_allocation_data = []
var unallocated_unassigned_devices = []
var default_asset_allocation = {
  imei_no: '',
  assigned: false,
  allocated: false,
  campaignId: $(campaignId).val(),
  image: '',
  assetId: ''
}
var tableId = "#allocation_table"
var assetTableId = "#assetTableId"
var assignSelectionBox = "#assign_asset_selection"
var assignButton = "#assign_button"
var refreshDevicesButton = "#device_selection_refresh"
var campaignId = "#campaignId"
var campaignActive = "#campaignActive"
var totalDevices = "#totalDevices"
var assetDataColumns = 
[
  { title: "Device Id", data: null, render: 'imei_no' },
  { title: "Asset Id", data: null, render: 'assetId' },
  { title: "Assigned", data: null, render: function (data, type, row, meta) {
    return `
      <div class="icheck-primary d-inline">
        <input id="assigned_box_${row.imei_no}" type="checkbox" onClick="assigned_checked(${row.imei_no})" checked>
        <label for="assigned_box_${row.imei_no}"></label>
      </div>
    `
  } 
  },
  { title: "Deployed", data: null, render: function (data, type, row, meta) {
    return `
      <div class="icheck-primary d-inline">
        <input id="allocated_box_${row.imei_no}" type="checkbox" onClick="allocated_checked(${row.imei_no})" ${row.allocated?'checked':''}>
        <label for="allocated_box_${row.imei_no}"></label>
      </div>
    `
  } 
  },
  { title: "Upload", data: null, render: function (data, type, row, meta) {
    return '<button class="btn btn-success">Upload</button>'
    } 
  }
]
function getAssetAllocationUrl() {
  return used_host + '/asset_allocation'
}
function postAllocateUnalocateUrl() {
  return used_host + '/asset_allocate_unallocate'
}
function postDeviceAssignmentUrl() {
  return used_host + '/asset_assign_unassign'
}
function getUnAllocatedUnassignedUrl() {
  return used_host + '/device/all/unallocated_unassigned'
}

function getAssetAllocationData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getAssetAllocationUrl() + '/campaignId/' + $(campaignId).val(),
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
        console.error('Serverside Error While Geting AssetAllocations');
        console.error(json.message)
      }
      else {
        asset_allocation_data = json.details
        console.log('Got Allocation Data');
        console.log(asset_allocation_data);
        // initAssetAllocationTable()
        initAssetAllocationDataTable()
      }
    },
    error: function (data) {
      console.log("Error While Getting AssetAllocations");
      console.log(data);
    }
  });
}

function getUallocatedUnassignedDevices(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getUnAllocatedUnassignedUrl(),
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
        console.error('Serverside Error While Geting AssetAllocations');
        console.error(json.message)
      }
      else {
        unallocated_unassigned_devices = []
        $.each(json.details, function (ind, d) {
          unallocated_unassigned_devices.push({ id: d._id, text: d.imei_no })
        })
        console.log('Got unassigned unallocated Devices');
        console.log(unallocated_unassigned_devices);
        if($(assignSelectionBox).select2()) {
          $(assignSelectionBox).select2().empty()
        }
          $(assignSelectionBox).select2({
            width: 'resolve',
            data: unallocated_unassigned_devices
          })
        
      }
    },
    error: function (data) {
      console.log("Error While Getting AssetAllocations");
      console.log(data);
    }
  });
}

function postAssetAllocation(data) {
  $.ajax({
    cache: false,
    type: 'POST',
    url: postAllocateUnalocateUrl(),
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
        notifyUser('error', 'Server Error Saving AssetDetails')
        console.log('Serverside Error');
        console.log(json.message)
      }
      else {
        notifyUser('success', json.message)
        getAllAssetAllocationData()
      }
    },
    error: function (data) {
      notifyUser('error', 'Error Saving AssetDetails')
      console.log("Error Saving AssetDetails");
      console.log(data);
    }
  });
}

function postDeviceAssignment(data) {
  $.ajax({
    cache: false,
    type: 'POST',
    url: postDeviceAssignmentUrl(),
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
        notifyUser('error', 'Server Error Assigning Asset To The Campaign')
        console.log('Serverside Error');
        console.log(json.message)
      }
      else {
        notifyUser('success', json.message)
        getAllAssetAllocationData()
      }
    },
    error: function (data) {
      notifyUser('error', 'Error Assigning Asset To The Campaign')
      console.log("Error Assigning Asset To The Campaign");
      console.log(data);
    }
  });
}

function initAssetAllocationDataTable() {
  $(assetTableId).DataTable({
    "destroy": true,
    "lengthMenu": [[10, 20], [10, 20]],
    "autoWidth": false,
    "data": asset_allocation_data,
    "subscriptionSave": true,
    "columns": assetDataColumns
  })
}

function getAllAssetAllocationData() {
  getUallocatedUnassignedDevices()
  getAssetAllocationData()
}

$(assignButton).click(function (event) {
  var data = $(assignSelectionBox).select2('data')
  if (data.length > 0) {
    if(asset_allocation_data.length >= $(totalDevices).val()) {
      notifyUser('error', 'You Have Exceded Total Devices For This Campaign!')
    } else {
      data = data[0]
      default_asset_allocation.imei_no = data.text
      default_asset_allocation.assigned = true
      default_asset_allocation.allocated = false
      postDeviceAssignment(default_asset_allocation)
    }
    
  } else {
    notifyUser('error', 'Please Select A Device First')
  }
})

function assigned_checked(imeiNo) {
    default_asset_allocation.imei_no = imeiNo
    default_asset_allocation.assigned = false
    postDeviceAssignment(default_asset_allocation)
}

function allocated_checked(imeiNo) {
  if($('#allocated_box_'+imeiNo).is(':checked')) {
    default_asset_allocation.imei_no = imeiNo
    default_asset_allocation.allocated = true
  } else {
    default_asset_allocation.imei_no = imeiNo
    default_asset_allocation.allocated = false
  }
  postAssetAllocation(default_asset_allocation)
}

$(refreshDevicesButton).click(function (event) {
  getUallocatedUnassignedDevices()
})

$('#print_asset_allocation-modal-button').click(function (event) {
  $("#print_asset_allocation-modal").modal('show')
})