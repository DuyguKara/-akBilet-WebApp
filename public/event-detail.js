document.querySelector('.buy-button').addEventListener('click', function(){
    document.querySelector('.payment-modal').style.display = 'block';
});

document.querySelector('.payment-modal-content > span').addEventListener('click', function(){
    document.querySelector('.payment-modal').style.display = 'none';
});

document.querySelector('.payment-button').addEventListener('click', function(){
    document.querySelector('.payment-modal').style.display = 'none';
});