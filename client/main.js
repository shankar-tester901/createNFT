async function uploadfile() {
    $("#pageLoading").show();
    try {
        document.getElementById("status").innerHTML = "Uploading the file and making it into a NFT ....takes time ... hold on ...  "
        var file = document.getElementById("customFile").files[0];
        let fileObj = new FormData();
        fileObj.append("data", file);
        const response = await fetch("/server/create_nft_function/uploadFile", { method: "POST", body: fileObj });
        console.log(response);
        $("#pageLoading").hide();
        document.getElementById("status").innerHTML = '';
        const responseData = await response.json();
        console.log(responseData);
        document.getElementById("status").innerHTML = JSON.stringify(responseData.message) ;
    } catch (e) {
        console.log(e);
        $("#pageLoading").hide();
        document.getElementById("status").innerHTML = JSON.stringify(e);
    }
}

function hideLoadingGif()
{
   // console.log('hideloadingGif invoked');
    $("#pageLoading").hide();
}


async function updateFile(fileId) {

    console.log('updateFile invoked ');
    try {
        var file = document.getElementById(fileId).files[0];
        let fileObj = new FormData();
        fileObj.append("data", file);
        const response = await fetch("/server/create_nft_function/updateFile/" + fileId, { method: "PUT", body: fileObj })
        const data = await response.json();
        if (response.status === 200) {
            alert(data.message)
            setTimeout(function () {
                window.location.reload();
            }, 2000);
        }
    } catch (e) {
        console.log(e);
        alert("Error. Please try again after sometime.");
    }
}


