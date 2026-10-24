document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    botaoCamera();
    getPhotoUri();
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