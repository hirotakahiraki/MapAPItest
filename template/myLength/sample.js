$(function () {

    searchLoad();

    function searchLoad() {
        var renderFLG = false;
        var directionsDisplay;
        var directionsService = new google.maps.DirectionsService();
        var map, mode;
        var currentDirections = null;
        var startSpot = document.getElementById("address").value;
        var endSpot = document.getElementById("address2").value;
        console.log(startSpot);
        console.log(endSpot);

        initialize();

        /* 地図初期化 */
        function initialize() {
            var myOptions = {
                zoom: 13,
                center: { lat: 35.670236, lng: 139.749832 },
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            /* 地図オブジェクト生成 */
            map = new google.maps.Map(document.getElementById("map"), myOptions);
            if (!renderFLG) render(map);
            calcRoute(startSpot, endSpot, map);
        }

        /* ルート検索結果を描画 */
        function render(map) {
            dbg("render:" + renderFLG);
            renderFLG = true;
            // ルートをレンダリング
            directionsDisplay = new google.maps.DirectionsRenderer({
                "map": map,
                "preserveViewport": true,
                "draggable": true
            });
            // 右カラムにルート表示
            directionsDisplay.setPanel(document.getElementById("directions_panel"));
            // 出発地点・到着地点マーカーが移動された時
            google.maps.event.addListener(directionsDisplay, 'directions_changed', function () {
                currentDirections = directionsDisplay.getDirections();//現在地を取得
                var route = currentDirections.routes[0];
                var s = "";
                var place_id = "";//ジオコーディング用
                var length = "";//変数書き込み用にする予定
                for (var i = 0; i < route.legs.length; i++) {//for文で回っているが、普通に考えて１回しか回らないはず
                    s += route.legs[i].start_address + ' to ';
                    s += route.legs[i].end_address + '\n';
                    s += route.legs[i].distance.text;
                    place_id = route.legs[i].start_address;
                    length = route.legs[i].distance.text;
                }
                dbg("directions_changed:" + s);
                geocodeAddress(place_id, map); // マップの位置変更
                console.log("len: " + length)
            });
        }

        /*アドレスを受け取った後にジオコーディング化してマップの位置を変更する関数*/
        function geocodeAddress(address,resultsMap) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    resultsMap.setCenter(results[0].geometry.location);//センターの位置を変更
                    var marker = new google.maps.Marker({//マーカーを自分の位置に変更
                        map: resultsMap,
                        position: results[0].geometry.location
                    });
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }

        /* モード変更 */
        $("#mode").bind("change", function () {
            $(".button-group button").removeClass("active");
            calcRoute(startSpot, endSpot);
            $("#show").addClass("active");
        });

        /* ルート算出 */
        function calcRoute(startSpot, endSpot, map) {
            switch ($("#mode").val()) {
                case "driving":
                    mode = google.maps.DirectionsTravelMode.DRIVING;
                    break;
                case "bicycling":
                    mode = google.maps.DirectionsTravelMode.BICYCLING;
                    break;
                case "transit":
                    mode = google.maps.DirectionsTravelMode.TRANSIT;
                    break;
                case "walking":
                    mode = google.maps.DirectionsTravelMode.WALKING;
                    break;
                default:
                    mode = google.maps.DirectionsTravelMode.DRIVING;
                    break;
            }
            if (!renderFLG) render(map);
            var request = {
                origin: startSpot,         /* 出発地点 */
                destination: endSpot,      /* 到着地点 */
                travelMode: mode            /* 交通手段 */
            };
            /* ルート描画 */
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    dbg(response);
                    directionsDisplay.setDirections(response);
                } else {
                    dbg("status:" + status);
                }
            });
        }
        /* ルート表示・非表示切り替え */
        $(".button-group button").click(function (e) {
            $(".button-group button").removeClass("active");
            var id = $(this).attr("id");
            if (id == "show") {
                calcRoute(startSpot, endSpot);
                $(this).addClass("active");
            } else {
                $(this).addClass("active");
                reset();
            }
        });
        /* ルート削除 */
        function reset() {
            currentDirections = null;
            directionsDisplay.setMap(null);
            renderFLG = false;
        }
    }
    $('#submit').click(function () {
        searchLoad();
    })
});
var dbg = function (str) {
    try {
        if (window.console && console.log) {
            console.log(str);
        }
    } catch (err) {
        alert("error:" + err);
    }
}
