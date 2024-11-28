document.querySelector('.user-profile').addEventListener('click', function(){
    fetch('/userProfile', {
        method: 'GET'
    })
    .then((response) => {
        if (response.ok) { // 2xx arası başarılı durum kodlarını kontrol et
            console.log("Request Sended Successfully.");
            window.location.href = '/userProfile'; // Sayfayı yeni URL'ye yönlendirir
        } else {
            console.log("Request Failed with status:", response.status);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
});