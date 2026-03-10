document.getElementById('start-btn').addEventListener('click', () => {
    document.querySelectorAll('.slide')[0].classList.remove('active');
    document.querySelectorAll('.slide')[1].classList.add('active');
});
