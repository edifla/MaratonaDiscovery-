const Modal = {
    open() {
        document.querySelector('.modal-overlay')
        .classList
        .add('active')
    },
    close() {
        document.querySelector('.modal-overlay')
        .classList
        .remove('active')
    }
}

const Storage = {
get(){
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
},
set(transaction){
    localStorage.setItem("dev.finances:transactions",JSON.stringify(transaction))
}

}
const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {

        //Index retorna a posição então ele vai receber a posição do array e removelo
        Transaction.all.splice(index, 1)
        App.reload()

    },

    incomes() {
        //Coletar e somar todas as transações > 0
        let income = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income
    },
    expenses() {
        //Coletar e somar todas as transações < 0
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    //Cria a tabela e a insere na div do tbody
    addTransaction(transaction, index) {

        const tr = document.createElement('tr')

        tr.innerHTML = DOM.innerHTMLTransaction(transaction,index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    //Estrutura da tabela convertendo a classe para entrada ou saida
    innerHTMLTransaction(transaction, index) {

        // A classe da div vai ficar armazenada na variavel cssclass que vai ser retornada na construção do html
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        // Estamos pegando o transaction.amount passando pela função de formatação e armazenando na variavel amount
        const amount = Utils.formatCurrency(transaction.amount)

        //Essa função vai retornar a estrutura html para a variavel tr
        const html = `
        <td .class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
           <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover elemento">
        </td>
        `
        return html
    },

    updateBalance() {

        // Atualizada a balança de entradas
        document
            .getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes())

        // Atualizada a balança de saidas
        document
            .getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses())

        // Atualizada a balança do Total
        document
            .getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = ""
    },
}
//Formata o valor em real brasileiro
const Utils = {

    formatDate(date){
        // Vai separar a data em array de string
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatAmount(value){
        value = Number(value) * 100
        return value
    
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ""
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    }
}

const Form = {
    //Pega os input inteiro
    description : document.querySelector('input#description'),
    amount : document.querySelector('input#amount'),
    date : document.querySelector('input#date'),

    // Pegando os VALORES dos input coletados acima
    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const { description ,amount, date} = Form.getValues() //Isso é uma forma resumida de fazer oque está abaixo
        // let description = Form.getValues().description
        // let amount = Form.getValues().amount
        // let date = Form.getValues().date
    
        // .trim faz uma limpeza de espaçoes vazios na string,
        if( description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "" ) {
        //Vai exibir um erro no console um erro com essa legenda
            throw new Error("Por favor, preencha todos os campos")
        }

    },

    formatValues(){
        let { description ,amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        
        return{
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){

        // Não permite que as informações sejam vazadas pela url
        event.preventDefault()

        try{
            // Etapas
            // 1- Verificar se todas as informações foram preenchidas
            Form.validateFields()
            // 2- Formatar os dados para salvar
            const transaction = Form.formatValues()
            // 3-Salvar
            Transaction.add(transaction)
            // 4-Apagar os dados do formulário
            Form.clearFields()
            // 5-Fechar o modal
            Modal.close()
            
        }catch(error){
            // Vai capturar a mensage do error que criamos na validação e exibir no navegador
            alert(error.message)
        }
        
        
    }, 
}


const App = {
    init() {
        
        //carregar todas as transactions na tabela
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },

    reload() {
        DOM.clearTransaction()
        App.init()
    },
}

App.init()
