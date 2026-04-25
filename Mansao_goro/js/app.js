function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const accountLinks = document.querySelectorAll('a[href="login.html"], a[href="signup.html"]');
    
    accountLinks.forEach(link => {
        if (user) {
            if (link.querySelector('.material-symbols-outlined')) {
                link.href = 'profile.html';
                // Optional: Change icon to something else or add name
            }
        }
    });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartBtn = document.getElementById('cart-icon');
    if (cartBtn) {
        // Keep original icon but add count
        const originalIcon = "shopping_cart";
        cartBtn.innerHTML = `${originalIcon} (${count})`;
    }
}

function subscribeNewsletter() {
    const email = document.getElementById('newsletter-email').value;
    if (email) {
        alert(`Obrigado! O ritual chegará em breve para: ${email}`);
        document.getElementById('newsletter-email').value = '';
    } else {
        alert('Por favor, insira um e-mail válido.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    updateCartCount();
});
