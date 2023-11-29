

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

function deleteFile(fileName) {
    fetch(`http://localhost:8080/delete/${fileName}`, { method: 'DELETE', credentials: 'include' })
        .then(response => {
            // 根据需要处理响应
            if (response.ok) {
                fetchFileList(); // 重新获取并显示更新后的文件列表
            }
        })
        .catch(error => console.error('Error:', error));
}


function displayFiles(fileList) {
    const container = document.getElementById('file-list');
    container.innerHTML = ''; // 清空旧的内容

    fileList.data.forEach(file => {
        console.log(file);
        const fileElement = document.createElement('div');
        fileElement.textContent = file.fileName;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.onclick = function() {
            deleteFile(file.fileName);
        };

        const downloadButton = document.createElement('a');
        downloadButton.textContent = '下载';
        downloadButton.href = `http://localhost:8080/download/${file.fileName}`;
        downloadButton.download = file.fileName;

        fileElement.appendChild(deleteButton);
        fileElement.appendChild(downloadButton);
        container.appendChild(fileElement);
    });
}

function fetchFileList() {
    fetch('http://localhost:8080/filelist',{credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // 处理文件列表
            displayFiles(data);
        })
        .catch(error => console.error('Error:', error));
}
