var map;
/*地図を表示させる関数*/
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 35.658581, lng: 139.745433 },
        zoom: 13
    });
}
initMap();//ここで関数呼び出しが必要だった