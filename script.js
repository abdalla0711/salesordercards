// --- SCRIPT START ---

// This function runs immediately to check the password.
(function() {
    // --- Create the dynamic password ---
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const dateString = day + month + hour;
    const correctPassword = dateString.split('').reverse().join('');

    // --- Prompt the user and check the password ---
    const userInput = prompt("Please enter the password:");

    if (userInput === correctPassword) {
        // If correct, make the page visible.
        document.body.style.visibility = 'visible';
    } else {
        // If incorrect, show an alert and do nothing else. The page remains hidden.
        alert("Incorrect password.");
    }
})(); // The () at the end makes this function run automatically.


// The rest of the script is wrapped in DOMContentLoaded to ensure the page is ready.
document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.getElementById('productGrid');
    const cartItemsContainer = document.getElementById('cartItems');
    const priceSelector = document.createElement('select');
    priceSelector.id = 'priceSelector';
    const filterInput = document.getElementById('filterInput');
    const copyButton = document.getElementById('copyButton');
    const fallbackFileInput = document.getElementById('fallbackFileInput');
    const products = [];
    let cartLineCounter = 1;
    let cartTotal = 0;

    function createProductSquare(product) {
        const square = document.createElement('div');
        square.className = 'productSquare';
        square.dataset.productName = product['item name'];

        const image = document.createElement('img');
        image.src = product['image_ulr'] || 'https://via.placeholder.com/300x200.png?text=No+Image';
        square.appendChild(image);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';
        
        const name = document.createElement('p');
        name.textContent = product['item name'];
        contentDiv.appendChild(name);

        const price1 = document.createElement('p');
        price1.textContent = `Ca = $${product['retail price Q']}`;
        contentDiv.appendChild(price1);

        const price2 = document.createElement('p');
        const cartoonPriceWithTax = parseFloat(product['retail price Q']) * 1.15;
        price2.textContent = `Ca + tax = $${cartoonPriceWithTax.toFixed(2)}`;
        contentDiv.appendChild(price2);

        const price3 = document.createElement('p');
        const eaPrice = parseFloat(product['retail price Q']) / parseInt(product['ea in ca']);
        price3.textContent = `Bund = $${eaPrice.toFixed(2)}`;
        contentDiv.appendChild(price3);

        const price4 = document.createElement('p');
        const eaPriceWithTax = cartoonPriceWithTax / parseInt(product['ea in ca']);
        price4.textContent = `Bund + Tax = $${eaPriceWithTax.toFixed(2)}`;
        contentDiv.appendChild(price4);
        
        square.appendChild(contentDiv);

        square.addEventListener('click', function() {
            const quantity = prompt('Enter the quantity:');
            if (quantity && !isNaN(quantity)) {
                const cartItem = document.createElement('div');
                cartItem.className = 'cartItem';
                cartItem.innerHTML = `
                    <span>${cartLineCounter}. </span>
                    <span>${product['item code']} | </span>
                    <span>${quantity}Ca | </span>
                    <span>${parseFloat(product[priceSelector.value]).toFixed(2)}SR | </span>
                    <span>${product['item name']}</span>
                `;
                cartItemsContainer.appendChild(cartItem);
                const itemTotal = parseFloat(product[priceSelector.value]) * quantity;
                cartTotal += itemTotal;
                updateCartTotal();
                cartLineCounter++;
            }
        });

        return square;
    }
    
    // --- THIS IS THE FIXED FUNCTION ---
    function updatePrices() {
      const selectedCategory = priceSelector.value;
      const squares = Array.from(document.getElementsByClassName('productSquare'));

      squares.forEach((square) => {
        const productName = square.dataset.productName;
        const product = products.find(p => p['item name'] === productName);
        
        if (product) {
            const price = parseFloat(product[selectedCategory]);

            if (!isNaN(price)) {
                const eaInCa = parseInt(product['ea in ca']);
                const priceWithTax = (price * 1.15).toFixed(2);
                const eaPrice = (price / eaInCa).toFixed(2);
                const eaWithTax = (price * 1.15 / eaInCa).toFixed(2);
                
                const contentDiv = square.querySelector('.card-content');
                // These querySelectors now target the correct <p> tags inside the card-content div
                contentDiv.querySelector('p:nth-of-type(2)').textContent = `Ca = ${price.toFixed(2)} SR`;
                contentDiv.querySelector('p:nth-of-type(3)').textContent = `Ca + tax = ${priceWithTax} SR`;
                contentDiv.querySelector('p:nth-of-type(4)').textContent = `Bund = ${eaPrice} SR`;
                contentDiv.querySelector('p:nth-of-type(5)').textContent = `Bund + Tax = ${eaWithTax} SR`;
            }
        }
      });
    }

    function updateCartTotal() {
        const cartTotalElement = document.getElementById('cartTotal');
        const cartTotalWithTax = cartTotal * 1.15;
        cartTotalElement.textContent = `Total with tax: ${cartTotalWithTax.toFixed(2)} SR`;
        copyButton.style.display = cartTotal > 0 ? 'block' : 'none';
    }

    function loadProductsFromExcel(jsonData) {
        const headers = Object.keys(jsonData[0]);
        jsonData.forEach(product => {
            products.push(product);
            const square = createProductSquare(product);
            productGrid.appendChild(square);
        });

        // Clear existing options before adding new ones
        priceSelector.innerHTML = ''; 
        for (let i = 1; i <= 8 && i < headers.length; i++) {
            const header = headers[i];
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            priceSelector.appendChild(option);
        }
        
        // --- THIS IS THE FIXED EVENT LISTENER ---
        priceSelector.addEventListener('change', function () {
            updatePrices(); // Call the function to change prices on the cards
            this.style.display = 'none'; // Hide the selector after a choice is made
        });

        if (!document.getElementById('priceSelector')) {
            document.getElementById('cartContainer').insertBefore(priceSelector, document.getElementById('cartItems'));
        }
        
        // Initial price update based on the default selection
        updatePrices();
    }

    fetch('PRICES.xlsx')
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            loadProductsFromExcel(jsonData);
        })
        .catch(err => {
            alert("لم يتم العثور على ملف الأسعار، اختره يدويًا.");
            fallbackFileInput.style.display = 'block';
            fallbackFileInput.addEventListener('change', function(e) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const workbook = XLSX.read(ev.target.result, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    loadProductsFromExcel(jsonData);
                    fallbackFileInput.style.display = 'none';
                };
                reader.readAsArrayBuffer(e.target.files[0]);
            });
        });

    copyButton.addEventListener('click', function() {
        const cartItems = document.getElementsByClassName('cartItem');
        let cartText = '';
        for (let i = 0; i < cartItems.length; i++) {
            const spans = cartItems[i].querySelectorAll('span');
            cartText += Array.from(spans).map(s => s.textContent).join('') + '\n';
        }
        cartText += '\n' + document.getElementById('cartTotal').textContent;
        navigator.clipboard.writeText(cartText).then(() => {
            alert("تم نسخ محتوى السلة.");
        });
    });

    filterInput.addEventListener('input', function() {
        const val = filterInput.value.toLowerCase();
        document.querySelectorAll('.productSquare').forEach(el => {
            el.style.display = el.dataset.productName.toLowerCase().includes(val) ? 'block' : 'none';
        });
    });
});

// --- SCRIPT END ---
