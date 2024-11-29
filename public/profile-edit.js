document.querySelector('.logout-button').addEventListener('click', function(){
    fetch('/', {
        method: 'GET'
    })
    .then((response) => {
        if (response.ok) { // 2xx arası başarılı durum kodlarını kontrol et
            console.log("Request Sended Successfully.");
            window.location.href = '/';
        } else {
            console.log("Request Failed with status:", response.status);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
});