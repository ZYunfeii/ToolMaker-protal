

function ajaxGet(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', path, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
        callback(xhr.responseText);
        }
    }
    xhr.send();
}

function initHtml(jsonName) {
    ajaxGet('http://localhost:8080/user/info', function(response) {
        // console.log(response);
        if (response !== null && response !== undefined && response.trim() !== "") {
            var userInfoJson = JSON.parse(response);
            let amis = amisRequire('amis/embed');
            ajaxGet(jsonName, function(response){
                var amisJson = JSON.parse(response);
                amisJson.title = userInfoJson.userinfo.id;
                let amisScoped = amis.embed('#root', amisJson);
            });
        } else {
            window.location.href = "index.html";
        }
            
        });
}
