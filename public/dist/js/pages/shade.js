//Shade 
var shade_data = []
var customer_data_for_Shade =[]
var default_shade = {
    name: "",
    cId: "",
    note: "",
    pageNo: "",
    bookName: "",
    formula: [],
    day:"",
    month:"",
    year:"",
    hexCode: "",
    totalQty:""
 }

var shadeTableId = "#shadeTable"
var shadeModelId = "#shade-modal"
var formulaModal = "#formula-modal"
var shadeModalTitle = "#shade-modal-title"
var shadeShadeName = "#shade_name"
var selectionBoxId = "#customer_id_selection_box"
var shadePageNo = "#shade_pageNo" 
var shadeBookName = "#shade_bookName"
var shadeHexCode = "#shade_hexCode"
var shadeNote = "#shade_note"

var formulas = []
var shadeFormulaContainer = ".shade_formulaid_container"
var shadeFormulaRowContainer = "#shade_formularow_container"
var shadeFormulaRowViewContainer = "#shade_formularow_view_container"
var Tinter = "#shade_tinter"
var Qty = "#shade_qty"

var shadeTotalQty = "#shade_totalQty"
var shadeId = "#shade_id"
var shadeDataColumns = 
[
  { title: "Shade Name", data: null, render: 'name' },
  { title: "Date", data: null, render: function (data, type, row, meta) {
      return data.day + '/' + data.month + '/' + data.year
    }
  },
  { title: "Customer Name", data: null, render: function (data, type, row, meta) {
   if(data.customer.length > 0){
       return data.customer[0].name
   }else{
       return ''
   }
}
},
  { title: "Page No", data: null, render: 'pageNo' },
  { title: "Book Name", data: null, render: 'bookName' },
  { title: "Hex Code", data: null, render: 'hexCode' },
  { title: "Note", data: null, render: 'note' },
  { title: "Formula", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<a class="btn btn-success btn-block" onclick="viewFormula(\''+data+'\')">View</a>':data
    },
 },
  { title: "Total Quantity", data: null, render: 'totalQty' },
  
  { title: "View", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<a class="btn btn-success btn-block" href="/shade/'+data+'">View</a>':data
    },
  },
  { title: "Edit", data: '_id', render: function (data, type, row, meta) {
    return type === 'display'? '<button class="btn btn-warning btn-block" onclick="editShade(\''+data+'\')">Edit</button>':data
    },
  }
]
function setShadeFormValues(row) {
  console.log('Set Shade Form');
  console.log(row);
  $(shadeId).val(row._id);
  $(shadeShadeName).val(row.name);
  $(selectionBoxId).val(row.cId).change();
  $(shadePageNo).val(row.pageNo);
  $(shadeBookName).val(row.bookName);
  $(shadeHexCode).val(row.hexCode);
  $(shadeTotalQty).val(row.totalQty)
  $(shadeNote).val(row.note);
  formulas = row.formula;
  renderFormulas()
}

function getShadeFormValues() {
  return {
    name:$(shadeShadeName).val(),
    cId:$(selectionBoxId).children("option:selected").val(),
    pageNo:$(shadePageNo).val(),
    bookName:$(shadeBookName).val(),
    hexCode:$(shadeHexCode).val(),
    note:$(shadeNote).val(),
    totalQty:$(shadeTotalQty).val(),
    formula:formulas,
    _id: $(shadeId).val()
   }
}

function getCustomerUrlForShade() {
  return used_host + '/customer'
}

function getShadeData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getShadeUrl()+'/all',
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
          console.error('Serverside Error While Geting Shades');
          console.error(json.message)
        }
        else {
            json.details.forEach(row => {
                var customer = $.grep(customer_data_for_Shade, function(n,i) {
                    return n._id == row.cId
                })
                if(customer.length > 0) {
                    row.customerName = customer[0].name
                } else {
                    row.customerName = ""
                }
            });
          shade_data = json.details
          initShadeTable()
        }
    },
    error: function (data) {
        console.log("Error While Getting Shades");
        console.log(data);
    }
  });
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
            var customer_data = []
            $.each(json.details, function (indx, row) {
                customer_data.push({text: row.name, id: row._id})
            })
            $('#customer_id_selection_box').select2({
                data : customer_data
            })
          }
      },
      error: function (data) {
          console.log("Error While Getting Customers");
          console.log(data);
      }
    });
  }
  
function postShadeData(data) {
  if(!data._id) delete data._id
  data.formula = JSON.stringify(data.formula)
  $.ajax({
    cache: false,
    type: 'POST',
    url: getShadeUrl(),
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
          notifyUser('error', 'Server Error Saving Shade')
          console.log('Serverside Error');
          console.log(json.message)
        }
        else {
          setShadeFormValues(default_shade)
          formulas= []
          renderFormulas()
          notifyUser('success', json.message)
          getAllShades()
        }
    },
    error: function (data) {
      notifyUser('error', 'Error Saving Shade')
        console.log("Error Saving Shade");
        console.log(data);
    }
  });
}

function initCustomerSelectionBox(){
    $(selectionBoxId).empty()
    $(selectionBoxId).append($('<option>').val("").text('Select A Customer'))
    customer_data_for_Shade.forEach(row => {
        $(selectionBoxId).append($('<option>').val(row._id).text(row.customerName))
    });
}

function initShadeTable() {
  console.log('Shade Data');
  console.log(shade_data)
  $(shadeTableId).DataTable({
    "destroy": true,
    "lengthMenu": [[5, 10], [5, 10]],
    "autoWidth": true,
    "data": shade_data,
    "stateSave": true,
    "columns": shadeDataColumns
  })
}

function getAllShades() {
    console.log('In here');
  getShadeData()
  getCustomerData()
}

function addShade(data) {
  console.log('Add Shade');
  console.log(data);
  if(data) {
    if(data.name) {
      var row = $.grep(shade_data, function (n,i) {
        if(data._id) {
          if( n.name ) {
            return n.name.toLowerCase() == data.name.toLowerCase()  && n._id != data._id
          }
        } else return n.name.toLowerCase() == data.name.toLowerCase() 
      })
      if(row.length > 0) {
        notifyUser('warning', 'Shade With Name: '+data.name+  ' Already Exists!')
      } else {
        console.log('Saving Data')
        console.log(data)
        postShadeData(data)
      }
    } else {
      notifyUser('error', 'Please Enter Data In All Fields ')
    }
  } else {
    setShadeFormValues(default_shade)
    $(shadeModalTitle).text('Add Shade')
    $(shadeModelId).modal('show')
    renderFormulas()
  }

}

function editShade(data) {
  console.log('Edit Shade');
  console.log(data);
  
  var row = $.grep(shade_data, function (n,i) {
    return n._id == data
  })
  console.log('After Search');
  console.log(row);
  
  if(row.length > 0) {
    setShadeFormValues(row[0])
    $(shadeModalTitle).text('Edit Shade')
    $(shadeModelId).modal('show')
  } else {
    console.log('Shade Row Not Found')
  }
}

$('#add_shade_button').click(function (params) {
  var data = getShadeFormValues()
    if(!data._id){
        data.day = today.getDate();
        data.month = today.getMonth() + 1;
        data.year = today.getFullYear()
    }
  console.log('Got Shade Form Values');
  console.log(data);
  addShade(data)
})

function addFormulaClicked() {
    var tinter_inp_val = $(Tinter).val()
    var qty_inp_val = $(Qty).val()
    var row = {tinter: tinter_inp_val, qty: qty_inp_val}
    if(tinter_inp_val=='' || qty_inp_val=='') {
      notifyUser('error', 'Cannot Insert Empty Row!')
    } else {
      formulas.push(row)
      renderFormulas()
      $(Tinter).val('');
      $(Qty).val('')
    }
  }
function renderFormulas() {
  $(shadeFormulaRowContainer).html('')
  var sum = 0
  $.each(formulas, function (indx, formula) {
    console.log(formula);
    
    var row = `
      <tr id="formula-${indx}">
        <td> 
          <button class="btn btn-error btn-sm" onClick="removeFormulaRow(${indx})" type="button"><i class="fas fa-times"></i></button>
        </td>
        <td width="40%">
          <h5>${formula.tinter}</h5>
        </td>
        <td width="60%">
          <h5 >${formula.qty}</h5>
        </td>
      </tr>
    `
    sum+= JSON.parse(formula.qty)
    $(shadeFormulaRowContainer).append(row)
  
  })
  $(shadeTotalQty).val(sum)
}
function renderFormulasView(formulas) {
  $(shadeFormulaRowViewContainer).html('')
  var sum = 0
  $.each(formulas, function (indx, formula) {
    console.log(formula);
    var row = `
      <tr>
        <td width="40%">
          <h5>${formula.tinter}</h5>
        </td>
        <td width="60%">
          <h5>${formula.qty}</h5>
        </td>
      </tr>

    ` 
    sum+= JSON.parse(formula.qty)
    $(shadeFormulaRowViewContainer).append(row)
  })
  var row = `
      <tr>
        <td width="40%">
          <h4>Total</h4>
        </td>
        <td width="60%">
          <h5 style="color:red;"><b>${sum}</b></h5>
        </td>
      </tr>

    ` 
  $(shadeFormulaRowViewContainer).append(row)
}
function removeFormulaRow(rowIndx) {
  if (rowIndx > -1) {
    formulas.splice(rowIndx, 1);
  }
  renderFormulas()

}
  
function getFormulaById(formula) {
  var row = $.grep(shade_data, function (n,i) {
    return n.id == formula
  })
  return row[0]
}

  
function viewFormula(data) {
  console.log('Formula');
  console.log(data);
  
  var row = $.grep(shade_data,function (n,i) {
    return n._id == data
  })
  console.log('After View')
  console.log(row)

  if(row.length > 0) {
    renderFormulasView(row[0].formula)
    $(formulaModal).modal('show')
    console.log('yeeeeeeeeeeeeeee')
  } else {
    console.log('Formula Row Not Found')
  }
}
