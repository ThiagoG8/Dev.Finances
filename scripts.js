// programação do modal
const Modal = {
    open() {
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

    },
    close() {
        // Fechar modal
        // Remover a classe active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    },

    closeWarning() {
        document
            .querySelector('.modal-warning')
            .classList
            .remove('economize')
    }
}

// muda a aplicação para dark mode
const darkMode = {
    toggleMode() {
        const body = document.querySelector('body')
        body.classList.toggle('dark')

        const dark = document.querySelectorAll(
            '.card, .card, .total, .svg, .source_code, .modal, .teste, #data-table'
        )
        
        if(body.classList.contains('dark')) {
            dark.forEach(card => {
                card.classList.add('dark')
            })
        } else {
            dark.forEach(card => {
                card.classList.remove('dark')
            })
        }
    }
}

// salva as transações no navegador
const Storage = {
    // retornar as transações em array ou vazio se não existir transações
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    // converte o array em JSON e salva as transações no storage
    set(transactions) {
        localStorage.setItem("dev.finances:transactions",JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    
    incomes() {
        let income = 0;
        // pegar todas as transacoes
        // para cada transacao
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero
            if( transaction.amount > 0 ) {
                // somar a uma variavel e retonar a variavel
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        // pegar todas as transacoes
        // para cada transacao
        Transaction.all.forEach(transaction => {
            // se ela for menor que zero
            if( transaction.amount < 0 ) {
                // somar a uma variavel e retonar a variavel
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        let Total = Transaction.incomes() + Transaction.expenses()

        if(Total < 0) {
            document
                .querySelector('.card.total')
                .classList
                .add('negative')

            document
                .querySelector('.modal-warning')
                .classList
                .add('economize')
        } else {
            document
                .querySelector('.card.total')
                .classList
                .remove('negative')
        }

        return Total
    }
}

// programação da DOM
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    // criar o elemento tr e adiciona ela dentro do tbody
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },

    // criar os dados (td) e renderiza na tela
    innerHTMLTransaction(transaction, index) {
        const CSSclasse = transaction.amount > 0 ? "income" :
        "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclasse}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `

        return html

        // Os dados nesse caso seriam os das transações.
    },

    // atualiza as entradas, saidas e o total
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    // limpa as transações quando deletar ou criar uma nova
    clearTransacrions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// progrmação da formatação da moeda, valor da transação e da data
const Utils = {
    // formata o valor da transação
    formatAmount(value) {

        // o jeito que o markão usou na aula

        // value = Number(value.replace(/\,\./g, "")) * 100
        // return value

        // o jeito que ele recomenta 

        value = value * 100
        return Math.round(value)
    },

    // formata a data para o formato brasileiro 
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    // formata o valor da moeda e adiciona o simbolo negativo
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "- " : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },
}

// programação do formulario 
const Form = {
    // criar props que buscam o value(o que esta escrito) no input
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    // pega o que esta escrito no input
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // verifica se os campos estão preenchidos
    valideteFileds() {
        const { description, amount, date } = Form.getValues()

        if ( description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "" ) {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    // formata os dados dos campos para salvar
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    // salva as transações
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    // limpa o formulario 
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // verificar se todas as informações foram preenchidas
            Form.valideteFileds()
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar e atualiza a aplicação
            Form.saveTransaction(transaction)
            // apagar os dados do formulario
            Form.clearFields()
            // fecha o modal 
            Modal.close()

        } catch (error) {
            alert(error.message);
        }
    }
}

// programação da aplicação
const App = {
    // inicia a aplicação
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    // recarega a aplicação para renderizar as novas transações
    reload() {
        DOM.clearTransacrions()
        App.init()
    }
}

App.init();