var map1;
var map2;
var markers = []
var infowindow3;
var contentString;
function initMap() {
    
    map1 = new google.maps.Map(document.getElementById('map1'), {
      center: {lat: 39.809734, lng: -98.555620},
      zoom: 4,
      mapTypeId: google.maps.MapTypeId.ROADMAP ,
      //styles: map_style
    });
    map2 = new google.maps.Map(document.getElementById('map2'), {
      center: {lat: 39.809734, lng: -98.555620},
      zoom: 4,
      mapTypeId: google.maps.MapTypeId.ROADMAP ,
    //   styles: map_style
    });
}
function load_data(data) {
    console.log('Got Geo Data');
    console.log(data);
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
    $.each(data, function (indx,dev) {
        var est_time = DateTime.utc((2000+dev.geo_location[0].year),dev.geo_location[0].month,dev.geo_location[0].day,dev.geo_location[0].hour,dev.geo_location[0].min,dev.geo_location[0].sec).setZone('UTC-5');
        var lng = dev.geo_location[0].location.coordinates[0]
        var lat = dev.geo_location[0].location.coordinates[1]
        var latLng = new google.maps.LatLng(lat,lng);
        var letter = 'P'
        var marker = new google.maps.Marker({
            position: latLng,
            map: map1,
            label: letter,
            info: `
            <h2>${dev.imei_no}</h2>
            <h4>Time: ${est_time.toLocaleString(DateTime.DATETIME_MED)+' EST'}</h4>
            <h4>Battery: ${dev.geo_location[0].battery}</h4>
            <p>Data From GPS</p>
            `,
            animation: google.maps.Animation.DROP
        });
        google.maps.event.addListener(marker, 'click', function () {
            // infowindow3.close(map1, this)
            infowindow3 = new google.maps.InfoWindow();
            infowindow3.setContent(this.info);                              
            infowindow3.open(map1, this);                   
        });
        markers.push(marker)
    })
}
function  getMapData() {
    $.ajax({
        cache: false,
        type: 'GET',
        url: getUrl() + $('#campaignId').val(),
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
                //showNoData();
                //hideMap();
                console.log('Serverside Error');
            } 
            else {
                if(json.details.length > 0) {
                    // showMap();
                    // hideNoData();
                    load_data(json.details);
                } else {
                    console.log('Recieved Empty Data');
                    
                    // showNoData();
                    // hideMap();
                }
                
            }
        },
        error: function (json) {
            console.log("Error");
            console.log(json);
            // showNoData();
            // hideMap();
        }
    });
}
function getUrl(){
    return used_host + "/device/geodata/"
}

function showMap(params) {
    $("#map1").hasClass('hidden')?$("#map1").removeClass('hidden'):'';
    $("#map2").hasClass('hidden')?$("#map2").removeClass('hidden'):'';
    $(".map_nodata").hasClass('hidden')?'':$(".map_nodata").addClass('hidden');
}
function hideMap(params) {
    $("#map1").hasClass('hidden')?'':$("#map1").addClass('hidden');
    $("#map2").hasClass('hidden')?'':$("#map2").addClass('hidden');
    $(".map_nodata").hasClass('hidden')?$(".map_nodata").removeClass('hidden'):'';
}
function refreshMap() {
    var local_est = DateTime.local().setZone('UTC-5');
    $('#map1_lable').html(' '+local_est.toLocaleString(DateTime.DATETIME_MED)+' EST')
    getMapData()
}
$(document).ready(function() {
    refreshMap()
});

window.setInterval(function(){
    refreshMap()
  }, 365000);