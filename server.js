let currentUser = null;

/* USERS */
function getUsers(){
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users){
    localStorage.setItem("users", JSON.stringify(users));
}

/* REGISTER */
function register(){

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(!email || !password){
        authMsg.innerText = "Fill all fields";
        return;
    }

    const users = getUsers();

    if(users.find(u => u.email === email)){
        authMsg.innerText = "User already exists";
        return;
    }

    users.push({
        email,
        password,
        transactions:[]
    });

    saveUsers(users);

    authMsg.innerText = "Registration successful ✅";
}

/* LOGIN */
function login(){

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = getUsers();

    const user = users.find(
        u => u.email === email &&
        u.password === password
    );

    if(!user){
        authMsg.innerText = "Invalid Email or Password";
        return;
    }

    currentUser = email;

    localStorage.setItem(
        "currentUser",
        email
    );

    authPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    loadDashboard();
}

/* LOGOUT */
function logout(){

    localStorage.removeItem("currentUser");

    location.reload();
}

/* LOAD DASHBOARD */
function loadDashboard(){

    currentUser =
    localStorage.getItem("currentUser");

    if(!currentUser) return;

    authPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    renderTransactions();
}

/* GET CURRENT USER */
function getCurrentUser(){

    const users = getUsers();

    return users.find(
        u => u.email === currentUser
    );
}

/* ADD TRANSACTION */
function addTransaction(){

    const desc =
    document.getElementById("desc").value.trim();

    const amount =
    Number(document.getElementById("amount").value);

    const type =
    document.getElementById("type").value;

    const category =
    document.getElementById("category").value;

    if(!desc || !amount || !type){
        return;
    }

    const users = getUsers();

    const userIndex =
    users.findIndex(
        u => u.email === currentUser
    );

    users[userIndex].transactions.push({
        id: Date.now(),
        desc,
        amount,
        type,
        category
    });

    saveUsers(users);

    document.getElementById("desc").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "";

    renderTransactions();
}

/* DISPLAY TRANSACTIONS */
function renderTransactions(){

    const user = getCurrentUser();

    if(!user) return;

    const searchValue =
    document.getElementById("search")
    .value.toLowerCase();

    const list =
    document.getElementById("transactionList");

    list.innerHTML = "";

    let income = 0;
    let expense = 0;

    user.transactions.forEach(t => {

        if(
            !t.desc
            .toLowerCase()
            .includes(searchValue)
        ){
            return;
        }

        if(t.type === "income"){
            income += Number(t.amount);
        }else{
            expense += Number(t.amount);
        }

        const item =
        document.createElement("div");

        item.className =
        "flex items-center justify-between p-4 bg-white shadow transaction-item card rounded-xl"; 

        item.innerHTML = `
        <div>
            <h3 class="font-bold">${t.desc}</h3>
            <p>${t.category}</p>
        </div>

        <div class="flex items-center gap-3">

            <span class="${
                t.type === "income"
                ? "text-green-600"
                : "text-red-600"
            }">
                ₦${Number(t.amount).toLocaleString()}
            </span>

            <button
            onclick="deleteTransaction(${t.id})"
            class="bg-red-500 text-white px-3 py-1 rounded">
            🗑️
            </button>

        </div>
        `;

        list.appendChild(item);
    });

    document.getElementById("income").innerText =
    "₦" + income.toLocaleString();

    document.getElementById("expense").innerText =
    "₦" + expense.toLocaleString();

    document.getElementById("balance").innerText =
    "₦" + (income-expense).toLocaleString();
}

/* DELETE TRANSACTION */
function deleteTransaction(id){

    const users = getUsers();

    const userIndex =
    users.findIndex(
        u => u.email === currentUser
    );

    users[userIndex].transactions =
    users[userIndex].transactions.filter(
        t => t.id !== id
    );

    saveUsers(users);

    renderTransactions();
}

/* CLEAR ALL */
function clearTransactions(){

    if(!confirm(
        "Delete all transactions?"
    )) return;

    const users = getUsers();

    const userIndex =
    users.findIndex(
        u => u.email === currentUser
    );

    users[userIndex].transactions = [];

    saveUsers(users);

    renderTransactions();
}

/* EXPORT CSV */
function exportCSV(){

    const user =
    getCurrentUser();

    let csv =
    "Description,Amount,Type,Category\n";

    user.transactions.forEach(t => {

        csv +=
        `${t.desc},${t.amount},${t.type},${t.category}\n`;

    });

    const blob =
    new Blob(
        [csv],
        {type:"text/csv"}
    );

    const a =
    document.createElement("a");

    a.href =
    URL.createObjectURL(blob);

    a.download =
    "transactions.csv";

    a.click();
}

/* DARK MODE */
function toggleDarkMode(){

    document.body.classList.toggle("dark");

    const isDark =
    document.body.classList.contains("dark");

    localStorage.setItem(
        "darkMode",
        isDark
    );

    document.getElementById("themeBtn")
    .innerText =
    isDark ? "☀️" : "🌙";
}

/* LOAD DARK MODE */
if(localStorage.getItem("darkMode") === "true"){

    document.body.classList.add("dark");

    window.addEventListener("load", () => {

        const btn =
        document.getElementById("themeBtn");

        if(btn){
            btn.innerText = "☀️";
        }

    });

}

/* AUTO LOGIN */
loadDashboard();

