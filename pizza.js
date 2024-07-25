document.addEventListener("alpine:init", () => {


    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: 0,
            message: '',
            
            fetchPizzas() {
                axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(response => {
                        this.pizzas = response.data.pizzas;
                    })
                    .catch(error => {
                        console.error('Error fetching pizzas:', error);
                    });
            },

            // Method to show only pizzas of the selected size
            showOnly(size) {
                this.filteredPizzas = this.pizzas.filter(pizza => {
                    if (size === 'all') {
                        return true; // Show all pizzas
                    } else {
                        return pizza.size.toLowerCase() === size.toLowerCase();
                    }
                });
            },

            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                } else {
                    alert("user name too short")
                }
                this.createCart();
            },
            logout() {
                if (confirm("do you want to logout?")) {
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    localStorage['username'] = '';
                }

            },
            createCart() {
                if (!this.username) {
                    // this.cartId = 'No username to creat a cart for'
                    return;

                }
                const cartId = localStorage['cartId'];

                if (cartId) {
                    this.cartId = cartId;
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`
                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        });
                }
            },
            getCart() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
                axios.get(getCartURL)
                    .then(res => {
                        const cartData = res.data;
                        this.cartPizzas = cartData.pizzas;
                        this.cartTotal = cartData.total.toFixed(2);
                       // console.log(res.data.pizzas);

                    })
            },
            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                })

            },
            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                })

            },
            pay(amount) {
                axios.post(' https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    "cart_code": this.cartId,
                    amount
                })

            },

            showCartData() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
                axios.get(getCartURL)
                    .then(res => {
                        const cartData = res.data;
                        this.cartPizzas = cartData.pizzas;
                        this.cartTotal = cartData.total.toFixed(2);

                 })

            },

            init() {

                const storedUsername = localStorage['username'];
                if (storedUsername) {
                    this.username = storedUsername
                }

                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        // console.log(result.data);
                        this.pizzas = result.data.pizzas;
                    });
                if (!this.cartId) {
                    this.createCart()
                    //.then((result) => {
                    this.showCartData();
                    // })

                }

            },
            addPizzaToCart(pizzaId) {
                alert(pizzaId)
                this
                    .addPizza(pizzaId)
                    .then(this.showCartData())
            },
            removePizzaFromCart(pizzaId) {
                alert(pizzaId)
                this
                    .removePizza(pizzaId)
                    .then(this.showCartData())
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
                            setTimeout(() => this.message = '', 3000)
                        } else {
                            if (change > 0) {
                                this.message = `Payment Succeful! Here is your Change R: ${change.toFixed(2)}`;
                            } else {
                                this.message = 'Payment Succeful!';
                            }

                            setTimeout(() => {
                                this.message = '';
                                this.cartPizzas = [];
                                this.cartTotal = 0.00;
                                this.cartId = '';
                                this.paymentAmount = 0;
                                localStorage['cartId'] = '';
                                this.createCart();
                            }, 3000);
                        }
                    })
            },
            
        }

    });

});

