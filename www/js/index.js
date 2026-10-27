var db = null;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    botaoCamera();
    getPhotoUri();

    db = window.sqlitePlugin.openDatabase({
        name: 'inspecoes.db',
        localtion: 'default',
    })

    iniciarTabelas();

}

const SCHEMA = [
    `CREATE TABLE IF NOT EXISTS pontes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
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
    });
}

function errorBanco(error) {
    console.error("Erro no banco: " + error.message);
}




