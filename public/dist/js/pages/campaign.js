//Campaign 
var campaign_data = []
var default_campaign = {
  name: "",
  total_assets: "", 
  total_devices : "",
  start_day: "",
  start_month: "",
  start_year: "",
  end_day: "",
  end_month: "",
  end_year: "",
  subscription: "",
  day: "",
  month: "",
  year: "",
  active: "",
 
}
var campaignTableId = "#campaignTable"
var campaignModelId = "#campaign-modal"
var campaignModalTitle = "#campaign-modal-title"
var campaignName = "#campaign_name"
var campaignTotalAssets = "#campaign_total_assets"
var campaignTotalDevices = "#campaign_total_devices" 
var campaignSubscription = "#campaign_subscription_selection_box"
var startDate = "#campaign_start_date"
var endDate = "#campaign_end_date"
var campaignId = "#campaign_id"
var accountId = "#accountId"
var customerId = "#customerId"
var campaignDataColumns = 
[
  { title: "Name", data: null, render: 'name' },
  { title: "Total Assets", data: null, render: 'total_assets' },
  { title: "Total Devices", data: null, render: 'total_devices' },
  { title: "Subscription", data: null, render: 'subscription' },
  { title: "Start Date", data: null, render: function (data, type, row, meta) {
    return data.start_day + '/' + data.start_month + '/' + data.start_year 
  } 
  },
  { title: "End Date", data: null, render: function (data, type, row, meta) {
      return data.end_day + '/' + data.end_month + '/' + data.end_year 
    } 
  },
  { title: "Created On", data: null, render: function (data, type, row, meta) {
    return data.day + '/' + data.month + '/' + data.year 
  } 
  },
  { title: "Status", data: null, render: function (data, type, row, meta) {
      return data.active ? '<span style="color:green">Active</span>' : '<button class="btn btn-success btn-block" onclick="startCampaignClicked(\''+row._id+'\')">Start</span>'
    } 
  },
  { title: "View", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<a class="btn btn-success btn-block" href="/campaign/'+data+'">View</a>':data
    } 
  },
  { title: "Edit", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<button class="btn btn-warning btn-block" onclick="editCampaign(\''+data+'\')">Edit</button>':data
  },
}
]
function setCampaignFormValues(row) {
  console.log('Set Campaign Form');
  console.log(row);
  $(campaignId).val(row._id);
  $(campaignName).val(row.name);
  $(campaignTotalAssets).val(row.total_assets);
  $(campaignTotalDevices).val(row.total_devices);
  $(campaignSubscription).val(row.subscription);
  if(row.start_year && row.end_year) {
    $(startDate).val(row.start_year+'-'+(row.start_month<10?'0':'')+row.start_month+'-'+(row.start_day<10?'0':'')+row.start_day)
    $(endDate).val(row.end_year+'-'+(row.end_month<10?'0':'')+row.end_month+'-'+(row.end_day<10?'0':'')+row.end_day)
  }
}

function getCampaignFormValues() {
  console.log($(startDate).val())
  var start_date = $(startDate).val().toString().split('-')
  var end_date = $(endDate).val().toString().split('-')
  return {
    accountId:$(accountId).val(),
    customerId:$(customerId).val(),
    name:$(campaignName).val(),
    total_assets:$(campaignTotalAssets).val(),
    total_devices:$(campaignTotalDevices).val(),
    start_day: start_date[2],
    start_month: start_date[1],
    start_year: start_date[0],
    end_day: end_date[2],
    end_month: end_date[1],
    end_year: end_date[0],
    subscription:$(campaignSubscription).val(),
    _id: $(campaignId).val()
  
  }
}
function getCampaignUrl() {
  return used_host + '/campaign'
}

function getCampaignData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getCampaignUrl()+'/customerId/'+$(customerId).val(),
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
          console.error('Serverside Error While Geting Campaigns');
          console.error(json.message)
        }
        else {
          campaign_data = json.details
          initCampaignTable()
        }
    },
    error: function (data) {
        console.log("Error While Getting Campaigns");
        console.log(data);
    }
  });
}

function postCampaignData(data) {
  if(!data._id) delete data._id
  $.ajax({
    cache: false,
    type: 'POST',
    url: getCampaignUrl(),
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
          notifyUser('error', 'Server Error Saving Campaign')
          console.log('Serverside Error');
          console.log(json.message)
        }
        else {
          setCampaignFormValues(default_campaign)
          notifyUser('success', json.message)
          getAllCampaigns()
        }
    },
    error: function (data) {
      notifyUser('error', 'Error Saving Campaign')
        console.log("Error Saving Campaign");
        console.log(data);
    }
  });
}

function postStartCampaign(campaignId) {
  $.ajax({
    cache: false,
    type: 'POST',
    url: getCampaignUrl()+'/start',
    dataType: 'json',
    data: {campaignId: campaignId},
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
          notifyUser('error', 'Server Error Starting Campaign')
          console.log('Serverside Error');
          console.log(json.message)
        }
        else {
          notifyUser('success', json.message)
          getAllCampaigns()
        }
    },
    error: function (data) {
      notifyUser('error', 'Error Saving Campaign')
        console.log("Error Saving Campaign");
        console.log(data);
    }
  });
}

function initCampaignTable() {
  console.log('Campaign Data');
  console.log(campaign_data)
  $(campaignTableId).DataTable({
    "destroy": true,
    "lengthMenu": [[5, 10], [5, 10]],
    "autoWidth": false,
    "data": campaign_data,
    "subscriptionSave": true,
    "columns": campaignDataColumns
  })
}

function startCampaignClicked(campaignId) {
  postStartCampaign(campaignId)
}

function getAllCampaigns() {
  getCampaignData()
}

function addCampaign(data) {
  console.log('Add Campaign');
  console.log(data);
  if(data) {
    if(data.name && data.total_assets && data.total_devices && data.subscription && data.start_day && data.end_day &&
       data.start_month && data.end_month && data.start_year && data.end_year) {
      var row = $.grep(campaign_data, function (n,i) {
        if(data._id) {
          if( n.name ) {
            return n.name.toLowerCase() == data.name.toLowerCase() && n._id != data._id
          }
        } else return n.name.toLowerCase() == data.name.toLowerCase()
      })
      if(row.length > 0) {
        notifyUser('warning', 'Campaign With Name: '+data.name+ ' Already Exists!')
      } else {
        console.log('Saving Data')
        console.log(data)
        postCampaignData(data)
      }
    } else {
      notifyUser('error', 'Please Enter Data In All Fields ')
    }
  } else {
    setCampaignFormValues(default_campaign)
    $(campaignModalTitle).text('Add Campaign')
    $(campaignModelId).modal('show')
  }

}

function editCampaign(data) {
  console.log('Edit Campaign');
  console.log(data);
  
  var row = $.grep(campaign_data, function (n,i) {
    return n._id == data
  })
  console.log('After Search');
  console.log(row);
  
  if(row.length > 0) {
    setCampaignFormValues(row[0])
    $(campaignModalTitle).text('Edit Campaign')
    $(campaignModelId).modal('show')
  } else {
    console.log('Campaign Row Not Found')
  }
}

$('#add_campaign_button').click(function (params) {
  var data = getCampaignFormValues()
  if(!data._id){
    data.day = today.getDate();
    data.month = today.getMonth() + 1;
    data.year= today.getFullYear();
    data.active = false;
  }
  console.log('Got Campaign Form Values');
  console.log(data);
    
  addCampaign(data)
})
