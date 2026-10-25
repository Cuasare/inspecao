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
    `CREATE TABLE IF NOT EXISTS projetos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS pontes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projeto_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
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

function botaoCamera(){
    const btt_foto = document.getElementById("tirarFoto");
    btt_foto.addEventListener("click", tirarFoto);
}

function tirarFoto() {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        correctOrientation: true,
    });
}

function onSuccess(imageUri) {
    var imagem = document.getElementById("minhaFoto");

    window.resolveLocalFileSystemURL(imageUri, function (fileEntryOrigin) {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (diretorioDestino) {

            const novo_nome = "foto_" + new Date().getTime() + ".jpg";

            fileEntryOrigin.moveTo(diretorioDestino, novo_nome, function (novoFileEntry) {

                imagem.src = novoFileEntry.toURL();

                console.log("Foto salva permanentemente em: " + novoFileEntry.toURL());
                localStorage.setItem("ultima_foto_nome", novo_nome);

            }, errorFileSystem);
        }, errorFileSystem);
    }, errorFileSystem);
}

function onFail(message) {
    alert('Falha ao retirar a foto: ' + message);
}

function getPhotoUri() {
    var imagem = document.getElementById("minhaFoto");
    const imagemDiv = document.getElementById("imageFallback");
    const nomeArquivo = localStorage.getItem("ultima_foto_nome");

    if (nomeArquivo == null){
        if (imagemDiv) imagemDiv.textContent = "Foto não encontrada!";
        return;
    }

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (diretorio) {
        diretorio.getFile(nomeArquivo, { create: false }, function (fileEntry) {

            imagem.src = fileEntry.toURL();

        }, errorFileSystem);
    }, errorFileSystem);
}

function errorFileSystem(error) {
    console.error("Erro no File System: Código " + error.code);
}