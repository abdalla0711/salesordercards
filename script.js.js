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
        // If incorrect, show an alert.
        alert("Incorrect password.");
        // You could also redirect them away.
        // window.location.href = "about:blank";
    }
})();

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
        image.src = product['image_ulr'];
        square.appendChild(image);

        const name = document.createElement('p');
        name.textContent = product['item name'];
        name.style.fontWeight = 'bold';
        name.style.color = 'white';
        name.style.backgroundColor = '#dea62d';
        square.appendChild(name);

        const price1 = document.createElement('p');
        price1.textContent = `Ca = $${product['retail price Q']}`;
        price1.style.fontWeight = 'bold';
        price1.style.backgroundColor = 'yellow';
        square.appendChild(price1);

        const price2 = document.createElement('p');
        const cartoonPriceWithTax = parseFloat(product['retail price Q']) * 1.15;
        price2.textContent = `Ca + tax = $${cartoonPriceWithTax.toFixed(2)}`;
        square.appendChild(price2);

        const price3 = document.createElement('p');
        const eaPrice = parseFloat(product['retail price Q']) / parseInt(product['ea in ca']);
        price3.textContent = `Bund = $${eaPrice.toFixed(2)}`;
        price3.style.fontWeight = 'bold';
        price3.style.backgroundColor = 'yellow';
        square.appendChild(price3);

        const price4 = document.createElement('p');
        const eaPriceWithTax = cartoonPriceWithTax / parseInt(product['ea in ca']);
        price4.textContent = `Bund + Tax = $${eaPriceWithTax.toFixed(2)}`;
        square.appendChild(price4);

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
                    square.querySelector('p:nth-child(3)').textContent = `Ca = ${price.toFixed(2)} SR`;
                    square.querySelector('p:nth-child(4)').textContent = `Ca + tax = ${priceWithTax} SR`;
                    square.querySelector('p:nth-child(5)').textContent = `Bund = ${eaPrice} SR`;
                    square.querySelector('p:nth-child(6)').textContent = `Bund + Tax = ${eaWithTax} SR`;
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

        // Assuming price categories start from the 2nd column (index 1) to the 9th (index 8)
        for (let i = 1; i <= 8 && i < headers.length; i++) {
            const header = headers[i];
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            priceSelector.appendChild(option);
        }

        priceSelector.addEventListener('change', function() {
            updatePrices();
            this.style.display = 'none';
        });

        document.getElementById('cartContainer').insertBefore(priceSelector, document.getElementById('cartItems'));
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
            console.error(err);
            alert("لم يتم العثور على ملف الأسعار، اختره يدويًا.");
            fallbackFileInput.style.display = 'block';
            fallbackFileInput.addEventListener('change', function(e) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    try {
                        const workbook = XLSX.read(ev.target.result, { type: 'array' });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(sheet);
                        loadProductsFromExcel(jsonData);
                        fallbackFileInput.style.display = 'none';
                    } catch (error) {
                        console.error("Error processing file:", error);
                        alert("There was an error processing the file.");
                    }
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
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            const dummy = document.createElement('textarea');
            dummy.value = cartText;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
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