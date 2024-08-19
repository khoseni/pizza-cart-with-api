document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => ({
        title: 'Pizza Cart API',
        pizzas: [],
        username: localStorage.getItem('username') || '',
        cartId: localStorage.getItem('cartId') || '',
        cartPizzas: [],
        cartTotal: 0.00,
        paymentAmount: 0,
        message: '',
        featuredPizzas: [],
        featuredPizzaId: '',
        historicalOrders: [],
        showOrders: false,
        isLoggedIn: !!localStorage.getItem('username'),
        filteredPizzas: [],
        sizeFilter: 'all',


        init() {
            this.fetchPizzas();
            this.getFeaturedPizzas();
            if (this.username && this.cartId) {
                this.getCart();
            } else if (this.username) {
                this.createCart().then(() => this.getCart());
            }
            this.getHistoricalOrders();
        },

        fetchPizzas() {
            axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                .then(response => {
                    this.pizzas = response.data.pizzas;
                })
                .catch(error => {
                    console.error('Error fetching pizzas:', error);
                });
        },

        login() {
            if (this.username.length > 2) {
                localStorage.setItem('username', this.username);
                this.createCart().then(() => this.getCart());
            } else {
                alert("Username too short");
            }
        },

        logout() {
            if (confirm("Do you want to logout?")) {
                localStorage.removeItem('username');
                localStorage.removeItem('cartId');
                this.username = '';
                this.cartId = '';
                this.cartPizzas = [];
                this.cartTotal = 0.00;
                this.isLoggedIn = false;
            }
        },

        getFeaturedPizzas() {
            const featuredPizzaURL = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=${this.username}`;
            axios.get(featuredPizzaURL)
                .then(response => {
                    this.featuredPizzas = response.data.pizzas.slice(0, 3) || [];
                })
                .catch(error => console.error('Error fetching featured pizzas:', error));
        },

        getHistoricalOrders() {
            let ordersKey = `${this.username}_historicalOrders`;
            this.historicalOrders = JSON.parse(localStorage.getItem(ordersKey)) || [];
        },

        createCart() {
            if (!this.username) return;
            if (this.cartId) return Promise.resolve();

            const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
            return axios.get(createCartURL)
                .then(result => {
                    this.cartId = result.data.cart_code;
                    localStorage.setItem('cartId', this.cartId);
                });
        },

        getCart() {
            const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
            axios.get(getCartURL)
                .then(res => {
                    const cartData = res.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                })
                .catch(error => console.error('Error fetching cart:', error));
        },

        addPizza(pizzaId) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                cart_code: this.cartId,
                pizza_id: pizzaId
            });
        },

        removePizza(pizzaId) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                cart_code: this.cartId,
                pizza_id: pizzaId
            });
        },

        showCartData() {
            const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
            axios.get(getCartURL)
                .then(res => {
                    const cartData = res.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                })
                .catch(error => console.error('Error fetching cart data:', error));
        },

        payForCart() {
            const change = this.paymentAmount - this.cartTotal;

            axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                cart_code: this.cartId,
                amount: this.paymentAmount
            })
            .then(result => {
                if (result.data.status === 'failure') {
                    this.message = result.data.message;
                    setTimeout(() => this.message = '', 3000);
                } else {
                    if (change > 0) {
                        this.message = `Payment Successful! Here is your Change: R ${change.toFixed(2)}`;
                    } else {
                        this.message = 'Payment Successful!';
                    }

                    const order = {
                        id: new Date().getTime(),
                        date: new Date().toLocaleString(),
                        total: this.cartTotal,
                        pizzas: this.cartPizzas.map(pizza => ({
                            id: pizza.id,
                            flavour: pizza.flavour,
                            price: pizza.price,
                            qty: pizza.qty
                        }))
                    };
                    this.saveOrder(order);

                    setTimeout(() => {
                        this.message = '';
                        this.cartPizzas = [];
                        this.cartTotal = 0.00;
                        this.cartId = '';
                        this.paymentAmount = 0;
                        localStorage.setItem('cartId', '');
                        this.createCart().then(() => {
                            this.getHistoricalOrders();
                        });
                    }, 3000);
                }
            })
            .catch(error => console.error('Error processing payment:', error));
        },

        saveOrder(order) {
            let ordersKey = `${this.username}_historicalOrders`;
            let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
            orders.push(order);
            localStorage.setItem(ordersKey, JSON.stringify(orders));
        },

      
        toggleOrders() {
            this.showOrders = !this.showOrders;
            if (this.showOrders) {
                this.getHistoricalOrders();
            }
        },

       
        setFeaturedPizza(pizzaId) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizzas/featured', {
                username: this.username,
                pizza_id: pizzaId
            }).then(() => {
                this.getFeaturedPizzas();
            }).catch(error => {
                console.error("Error setting featured pizza:", error);
            });
        },

        addFeaturedPizza() {
            if (this.featuredPizzaId) {
                this.setFeaturedPizza(this.featuredPizzaId).then(() => {
                    this.featuredPizzaId = ''; 
                }).catch(error => {
                    console.error("Error adding featured pizza:", error);
                });
            } else {
                alert("Please enter a pizza ID.");
            }
        },

        
        addPizzaToCart(pizzaId) {
            this.addPizza(pizzaId)
                .then(() => this.showCartData())
                .catch(error => console.error('Error adding pizza to cart:', error));
        },

        removePizzaFromCart(pizzaId) {
            this.removePizza(pizzaId)
                .then(() => this.showCartData())
                .catch(error => console.error('Error removing pizza from cart:', error));
        },

    
        showOnly(size) {
            this.sizeFilter = size;
            this.filteredPizzas = this.pizzas.filter(pizza => size === 'all' || pizza.size.toLowerCase() === size.toLowerCase());
        }
    }));
});
