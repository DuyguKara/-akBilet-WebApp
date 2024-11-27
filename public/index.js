document.querySelector('.add-event').addEventListener("click", function(){
    document.querySelector('.add-event-modal').style.display = 'block';
});

document.querySelector('.add-event-close').addEventListener('click', function(){
    document.querySelector('.add-event-modal').style.display = 'none';
});

document.querySelector('.add-event-button').addEventListener('click', function(){
    document.querySelector('.add-event-modal').style.display = 'none';
});