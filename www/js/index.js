var db = null;
var listaProjetos = document.getElementById("lista-projetos-vazia")

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    db = window.sqlitePlugin.openDatabase({
        name: 'inspecoes.db',
        location: 'default',
    })

    iniciarTabelas();
    registrarOuvintes();
}

const SCHEMA = [
    `CREATE TABLE IF NOT EXISTS pontes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS patologias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ponte_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL,
        severidade TEXT NOT NULL DEFAULT 'ok'
            CHECK (severidade IN ('ok', 'baixa', 'media', 'alta', 'critica')),
        risco TEXT NOT NULL DEFAULT 'ok'
            CHECK (risco IN ('ok', 'baixo', 'moderado', 'alto', 'critico')),
        sincronizado INTEGER NOT NULL DEFAULT 0
            CHECK (sincronizado IN (0, 1)),
        FOREIGN KEY (ponte_id) REFERENCES pontes(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS fotos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patologia_id INTEGER NOT NULL,
        caminho TEXT NOT NULL,
        FOREIGN KEY (patologia_id) REFERENCES patologias(id) ON DELETE CASCADE
    )`,
];

function iniciarTabelas() {
    db.executeSql('PRAGMA foreign_keys = ON;', [], criarTabelas, errorBanco);
}

function criarTabelas() {
    db.transaction(function (tx) {
        SCHEMA.forEach(function (sql) {
            tx.executeSql(sql);
        });
    }, errorBanco, function () {
        console.log("Tabelas prontas");
        buscarPontes();
    });
}


function errorBanco(error) {
    console.error("Erro no banco: " + error.message);
}

document.addEventListener("online", online, false)

function online() {
    var estadoInternet = navigator.connection.type;
    if (estadoInternet !== Connection.NONE){
        const status = document.getElementById("status-conexao");
        status.classList.replace("offline", "online");
        status.textContent = 'Online';
        const sincronizarButton = document.getElementById("btn-sincronizar")
        sincronizarButton.disabled = false;

    }
}

document.addEventListener("offline", offline, false);

function offline() {
    const status = document.getElementById("status-conexao");
    status.classList.replace("online", "offline");
    status.textContent = 'Offline';
    const sincronizarButton = document.getElementById("btn-sincronizar")
    sincronizarButton.disabled = true;
}

function registrarOuvintes() {
    const dialog = document.getElementById("dialog-novo-projeto");
    const form = document.getElementById("form-novo-projeto");
    const input = document.getElementById("input-nome-projeto");

    dialog.addEventListener("close", function (){
        const nome = input.value.trim();

        if (dialog.returnValue === "salvar" && nome){
            salvarNomePonte(nome)
        }

        dialog.returnValue = "";
        form.reset();
    })
}

function salvarNomePonte(nome) {
    db.transaction(function (tx){
        tx.executeSql('INSERT INTO pontes (nome) VALUES (?)', [nome])
    }, errorBanco, buscarPontes)
}

function buscarPontes() {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM pontes';

        tx.executeSql(query, [], function (tx, resultSet){
            const tamanho = resultSet.rows.length;

            const template = document.getElementById("tpl-item-projeto")
            const container = document.getElementById("lista-projetos")
            container.innerHTML = '';

            for (let i = 0; i < tamanho; i++){
                const row = resultSet.rows.item(i)
                const clone = template.content.cloneNode(true)
                clone.querySelector(".item-projeto-nome").textContent = row.nome;
                container.appendChild(clone);
            }

            listaProjetos.hidden = tamanho > 0;
        }, errorBanco);
    }, errorBanco);
}

