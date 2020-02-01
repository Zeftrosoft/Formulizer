//AssetDetails 
var asset_details_data = []
var default_asset_details = {
  total_assets: "",
  name: "", 
  image : "",
  height: "",
  width: "",
  channel: "",
  program: "",
  merchandise_type: "",
  promotion: "",
  mfg_day: "",
  mfg_month: "",
  mfg_year: "",
  est_shipping_day: "",
  est_shipping_month: "",
  est_shipping_year:"",
  day: "",
  month: "",
  year: "",
  active: "",
 
}
var campaignId = "#campaignId"
var asset_detailsTableId = "#asset_detailsTable"
var asset_detailsModelId = "#asset_details-modal"
var asset_detailsModalTitle = "#asset_details-modal-title"
var asset_detailsTotalAssets = "#total_assets"
var asset_detailsName = "#name"
var asset_detailsImage = "#image"
var asset_detailsHeight = "#height" 
var asset_detailsWidth = "#width"
var asset_detailsChannel = "#channel"
var asset_detailsProgram = "#program"
var asset_detailsMerchandiseType = "#merchandise_type"
var asset_detailsPromotion = "#promotion"
var asset_detailsId = "#asset_details_id"
var asset_mfgDate = "#mfg_date"
var asset_shippingDate = "#est_shipping_date"
var asset_detailsDataColumns = 
[
  { title: "Total Assets", data: null, render: 'total_assets' },
  { title: "Name", data: null, render: 'name' },
  { title: "Height", data: null, render: 'height' },
  { title: "Width", data: null, render: 'width' },
  { title: "Channel", data: null, render: 'channel' },
  { title: "Program", data: null, render: 'program' },
  { title: "Merchandise Type", data: null, render: 'merchandise_type' },
  { title: "Promotion", data: null, render: 'promotion' },
  { title: "Mfg Date ", data: null, render: function (data, type, row, meta) {
      return data.mfg_day + '/' + data.mfg_month + '/' + data.mfg_year 
    } 
  },
  { title: "Shipping Date", data: null, render: function (data, type, row, meta) {
    return data.est_shipping_day + '/' + data.est_shipping_month + '/' + data.est_shipping_year 
  } 
  },
  { title: "Created On", data: null, render: function (data, type, row, meta) {
  return data.day + '/' + data.month + '/' + data.year 
  } 
  },
  { title: "Status", data: null, render: function (data, type, row, meta) {
      return data.active ? '<span style="color:green">Active</span>' : '<span style="color:red">Not Active</span>'
    } 
  },
  // { title: 'Image', render: function (data, type, row, meta) {
  //   return type === 'display'? '<input type="file" name="pic" accept="image/*"></input> <label class="custom-file-label" for="customFile">Choose file</label>':data
  // }
  //},
  { title: "Edit", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<button class="btn btn-warning btn-block" onclick="editAssetDetails(\''+data+'\')">Edit</button>':data
  },
  }
]
function setAssetDetailsFormValues(row) {
  console.log('Set AssetDetails Form');
  console.log(row);
  $(asset_detailsId).val(row._id);
  $(asset_detailsTotalAssets).val(row.total_assets);
  $(asset_detailsName).val(row.name);
  $(asset_detailsHeight).val(row.height);
  $(asset_detailsWidth).val(row.width);  
  $(asset_detailsChannel).val(row.channel); 
  $(asset_detailsProgram).val(row.program);  
  $(asset_detailsMerchandiseType).val(row.merchandise_type);
  $(asset_detailsPromotion).val(row.promotion); 
  if(row.mfg_year && row.est_shipping_year) {
    $(asset_mfgDate).val(row.mfg_year+'-'+(row.mfg_month<10?'0':'')+row.mfg_month+'-'+(row.mfg_day<10?'0':'')+row.mfg_day)
    $(asset_shippingDate).val(row.est_shipping_year+'-'+(row.est_shipping_month<10?'0':'')+row.est_shipping_month+'-'+(row.est_shipping_day<10?'0':'')+row.est_shipping_day)
  }
}

function getAssetDetailsFormValues() {
  var mfgDate = $(asset_mfgDate).val().toString().split('-')
  var shippingDate = $(asset_shippingDate).val().toString().split('-')
  return {
    campaignId: $(campaignId).val(),
    total_assets:$(asset_detailsTotalAssets).val(),
    name:$(asset_detailsName).val(),
    height:$(asset_detailsHeight).val(),
    width:$(asset_detailsWidth).val(),
    channel:$(asset_detailsChannel).val(),
    program:$(asset_detailsProgram).val(),
    merchandise_type: $(asset_detailsMerchandiseType).val(),
    promotion:$(asset_detailsPromotion).val(),
    _id: $(asset_detailsId).val(),
    mfg_day: mfgDate[2],
    mfg_month: mfgDate[1],
    mfg_year: mfgDate[0],
    est_shipping_day: shippingDate[2],
    est_shipping_month: shippingDate[1],
    est_shipping_year:shippingDate[0],
  }
}

function getAssetDetailsUrl() {
  return used_host + '/asset_details'
}

function getAssetDetailsData (querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getAssetDetailsUrl()+'/campaignId/'+$(campaignId).val(),
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
          console.error('Serverside Error While Geting AssetDetailss');
          console.error(json.message)
        }
        else {
          asset_details_data = json.details
          initAssetDetailsTable()
        }
    },
    error: function (data) {
        console.log("Error While Getting AssetDetailss");
        console.log(data);
    }
  });
}

function postAssetDetailsData(data) {
  if(!data._id) delete data._id
  $.ajax({
    cache: false,
    type: 'POST',
    url: getAssetDetailsUrl(),
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
          setAssetDetailsFormValues(default_asset_details)
          notifyUser('success', json.message)
          getAllAssetDetailss()
        }
    },
    error: function (data) {
      notifyUser('error', 'Error Saving AssetDetails')
        console.log("Error Saving AssetDetails");
        console.log(data);
    }
  });
}

function initAssetDetailsTable() {
  console.log('AssetDetails Data');
  console.log(asset_details_data)
  $(asset_detailsTableId).DataTable({
    "destroy": true,
    "lengthMenu": [[5, 10], [5, 10]],
    "autoWidth": false,
    "data": asset_details_data,
    "widthSave": true,
    "columns": asset_detailsDataColumns
  })
}

function getAllAssetDetailss() {
  getAssetDetailsData()
}

function addAssetDetails(data) {
  console.log('Add AssetDetails');
  console.log(data);
  if(data) {
    if(data.name && data.total_assets && data.height && data.width && data.channel && data.program && data.promotion && data.merchandise_type ) {
      if(asset_details_data.length > 0) {
        notifyUser('warning', 'AssetDetails With Name: '+data.name+' Already Exists!')
      } else {
        console.log('Saving Data')
        console.log(data)
        postAssetDetailsData(data)
      }
    } else {
      notifyUser('error', 'Please Enter Data In All Fields ')
    }
  } else {
    setAssetDetailsFormValues(default_asset_details)
    $(asset_detailsModalTitle).text('Add AssetDetails')
    $(asset_detailsModelId).modal('show')
  }

}

function editAssetDetails(data) {
  console.log('Edit AssetDetails');
  console.log(data);
  
  var row = $.grep(asset_details_data, function (n,i) {
    return n._id == data
  })
  console.log('After Search');
  console.log(row);
  
  if(row.length > 0) {
    setAssetDetailsFormValues(row[0])
    $(asset_detailsModalTitle).text('Edit AssetDetails')
    $(asset_detailsModelId).modal('show')
  } else {
    console.log('AssetDetails Row Not Found')
  }
}

$('#add_assets_details_button').click(function (params) {
  var data = getAssetDetailsFormValues()
  if(!data._id){
    data.day = today.getDate();
    data.month = today.getMonth() + 1;
    data.year= today.getFullYear();
    data.active = false;
  }
  console.log('Got AssetDetails Form Values');
  console.log(data);
    
  addAssetDetails(data)
})
