function ViolationMapper(){
    var self = this

    var formatViolation = function (violation){
        var text = ""
        for(var law in violation){
            if(text.length > 0){
                text += "<br>"
            }
            text += ('<span style="float:left">'+law+'</span><span style="float:right">'+violation[law]+ "次</span>")
        }
        return text
    }

    this.run = function(){
        if(self.map == undefined) return

        var __a = document.createElement("a")
        __a.href = document.URL
        if(__a.host === ""){
            __a.href = __a.href
        }
        var fetchName = __a.pathname.split(/(\\|\/)/g).pop().split('.')[0]
        var infowindow = new google.maps.InfoWindow();

        var table = document.getElementById('wans-data-table')

        var defaultLocation = {lat:25.040234, lng:121.511922}

        var r = new XMLHttpRequest();
        r.open("GET", "./json/"+fetchName+"-fetch.json");
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) return;

            var bank = JSON.parse(r.responseText)
            var clusterData = []

            for(name in bank){
                entry = bank[name]

                var location = entry.gmap.location != undefined ? entry.gmap.location : defaultLocation

                if(location != undefined){
                    if(entry.violateTimes >= 7){
                        var marker = new google.maps.Marker({map:self.map, position: location, title:entry.name})
                        google.maps.event.addListener(marker, 'click', function() {
                            var violate = bank[this.title]
                            var content = "<h5><strong>"+violate.name+"</strong></h5>"
                            +"代表:"+violate.representative+"<br>"
                            +"次數:"+violate.violateTimes
                            infowindow.setContent(content);
                            infowindow.open(self.map, this);
                        });
                    }

                    var fillOpacity = entry.violateTimes *0.0618
                    if(fillOpacity > 0.618) fillOpacity = 0.618
                    var cityCircle = new google.maps.Circle({
                        strokeWeight: 0,
                        fillColor: '#FF0000',
                        fillOpacity: fillOpacity,
                        map: self.map,
                        center: location,
                        radius: entry.violateTimes * 21
                    });
                }

                var dataElem = '<tr><td class="mdl-data-table__cell--non-numeric wans-table-cell--name">' + entry.name + "</td>"
                + '<td class="mdl-data-table__cell--non-numeric wans-table-cell--rep">' + entry.representative + "</td>"
                + '<td class="mdl-data-table__cell--non-numeric wans-table-cell--law">' + formatViolation(entry.violation) + "</td>"
                + '<td class="mdl-data-table__cell--non-numeric wans-table-cell--time">' + entry.violateTimes + "</td></tr>"
                clusterData.push(dataElem)
            }

            var clusterize = new Clusterize({
                rows: clusterData,
                scrollId: 'scrollArea',
                contentId: 'contentArea'
            });
        };
        r.send();
    }
}

var violationMapper = new ViolationMapper()

function callback(){
    violationMapper.map = new google.maps.Map(document.getElementById('wans-map'), {
        center: {lat: 25.02, lng: 121.38},
        zoom: 7
    });

    violationMapper.placeService = new google.maps.places.PlacesService(violationMapper.map);

    violationMapper.run()
}
