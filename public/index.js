document.querySelector('.add-event').addEventListener("click", function(){
    document.querySelector('.add-event-modal').style.display = 'block';
});

document.querySelector('.add-event-close').addEventListener('click', function(){
    document.querySelector('.add-event-modal').style.display = 'none';
});

document.querySelector('.add-event-button').addEventListener('click', function(){
    document.querySelector('.add-event-modal').style.display = 'none';
});

document.querySelector('#edit-event').addEventListener("click", function(){
    document.querySelector('.edit-event-modal').style.display = 'block';
});

document.querySelector('.edit-event-close').addEventListener('click', function(){
    document.querySelector('.edit-event-modal').style.display = 'none';
});

document.querySelector('.edit-event-button').addEventListener('click', function(){
    document.querySelector('.edit-event-modal').style.display = 'none';
});

$(document).on('click', '#delete-event', function() {
    const dataId = $(this).data('id'); 
        //console.log("Deleting event with ID: " + dataId);

    fetch(`/events/${dataId}`, {
        method: 'DELETE'
    })
    .then((response) => {
        if (response.status === 204) {
            console.log("Event Deleted");
            $(this).closest('.grid-item').remove();
        } else {
            console.log("Event could not be deleted.");
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
});


$(document).on('click', '#edit-event', function() {
    $("input").focus();
    const dataId = $(this).attr('data-id');
    //console.log(dataId);

    $('.edit-event-button').off('click').on('click', function(event) {

        const editEventName = document.getElementById('editName').value;
        const image = document.getElementById('editImg').files[0];
        const editDate = document.getElementById('edit-date-input').value;
        const editLocation = document.getElementById('editLocationInfo').value;

        // Boş alan kontrolü
        if (!editEventName || !image || !editDate || !editLocation) {
            alert("Please fill all blanks.");
            return;
        }else {
        const formData = new FormData();
        formData.append('editEventName', editEventName);
        formData.append('image', image);
        formData.append('editDate', editDate);
        formData.append('editLocation', editLocation);

        fetch(`events/${dataId}`, {
            method: 'PUT',
            body: formData
        })
        .then((response) => {
            if (response.status === 204) {
                console.log("Event Changed");
            } else {
                console.log("Event could not be deleted.");
            }
        })
        .catch((error) => {
            console.error(error);
        });

        }
    });
});