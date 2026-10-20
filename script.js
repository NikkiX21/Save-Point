// ========================================
// GATINHO APAIXONADO
// SCRIPT PRINCIPAL
// ========================================


// ========================================
// NAVEGAÇÃO
// ========================================

function mostrarTela(idDaTela) {

    const telas = document.querySelectorAll(".tela");

    telas.forEach(function(tela) {
        tela.classList.remove("ativa");
    });

    const tela = document.getElementById(idDaTela);

    if (tela) {
        tela.classList.add("ativa");
    }

}


// ========================================
// JOGO DOS ASTEROIDES
// ========================================

let canvas;
let ctx;
let nave;

let imagemNave = new Image();
imagemNave.src = "nave.png";

let imagemAsteroide = new Image();
imagemAsteroide.src = "asteroide.png";

let jogoIniciado = false;
let jogoRodando = false;
let missaoComecou = false;

let faseAtual = 1;
let vidas = 3;
let pontos = 0;
let asteroidesDestruidos = 0;

let teclas = {};
let tiros = [];
let asteroides = [];
let estrelas = [];
let particulas = [];
let flashTela = 0;

let intervaloAsteroides = null;


const fases = {

    1: {
        objetivo: 10,
        velocidadeMin: 2,
        velocidadeMax: 4,
        intervalo: 1000
    },

    2: {
        objetivo: 15,
        velocidadeMin: 3,
        velocidadeMax: 5,
        intervalo: 700
    },

    3: {
        objetivo: 20,
        velocidadeMin: 4,
        velocidadeMax: 7,
        intervalo: 450
    }

};


// ========================================
// ABRIR JOGO
// ========================================

function abrirJogo() {

    mostrarTela("tela-jogo1");

    setTimeout(function() {
        iniciarJogo();
    }, 100);

}


// ========================================
// INICIAR JOGO
// ========================================

function iniciarJogo() {

    if (jogoIniciado) {
        return;
    }

    jogoIniciado = true;

    canvas = document.getElementById("jogo");

    if (!canvas) {
        console.error("Canvas não encontrado.");
        return;
    }

    ctx = canvas.getContext("2d");

    ajustarCanvas();
    criarNave();
    criarEstrelas();
    configurarTeclado();
    atualizarPlacar();

    loop();

}


// ========================================
// CANVAS
// ========================================

function ajustarCanvas() {

    if (!canvas) {
        return;
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    if (nave) {
        posicionarNave();
    }

}


// ========================================
// NAVE
// ========================================

function criarNave() {

    nave = {

        x: 0,
        y: 0,

        largura: 60,
        altura: 70,

        velocidade: 6

    };

    posicionarNave();

}


function posicionarNave() {

    if (!nave || !canvas) {
        return;
    }

    nave.x =
        canvas.width / 2 -
        nave.largura / 2;

    nave.y =
        canvas.height -
        nave.altura -
        20;

}


// ========================================
// TECLADO
// ========================================

function configurarTeclado() {

    window.addEventListener(
        "keydown",
        function(event) {

            teclas[event.key] = true;


            // MODO TESTE
            // N = passar de fase

            if (
                event.key === "n" ||
                event.key === "N"
            ) {

                if (jogoRodando) {

                    asteroidesDestruidos =
                        fases[faseAtual].objetivo;

                    atualizarPlacar();
                    verificarFimDaFase();

                }

            }


            // ESPAÇO = ATIRAR

            if (
                event.code === "Space" &&
                jogoRodando
            ) {

                criarTiro();

                event.preventDefault();

            }

        }
    );


    window.addEventListener(
        "keyup",
        function(event) {

            teclas[event.key] = false;

        }
    );

}


// ========================================
// ESTRELAS
// ========================================

function criarEstrelas() {

    estrelas = [];

    for (let i = 0; i < 100; i++) {

        estrelas.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            tamanho:
                Math.random() * 2 + 1

        });

    }

}


function desenharEstrelas() {

    ctx.fillStyle = "white";

    estrelas.forEach(function(estrela) {

        ctx.fillRect(
            estrela.x,
            estrela.y,
            estrela.tamanho,
            estrela.tamanho
        );

    });

}


// ========================================
// DESENHAR NAVE
// ========================================

function desenharNave() {

    if (!imagemNave.complete) {
        return;
    }

    ctx.drawImage(
        imagemNave,
        nave.x,
        nave.y,
        nave.largura,
        nave.altura
    );

}


// ========================================
// TIROS
// ========================================

function criarTiro() {

    tiros.push({

        x:
            nave.x +
            nave.largura / 2 -
            3,

        y:
            nave.y,

        largura: 6,
        altura: 15,

        velocidade: 9

    });

}


function atualizarTiros() {

    tiros.forEach(function(tiro) {

        tiro.y -= tiro.velocidade;

    });


    for (
        let i = tiros.length - 1;
        i >= 0;
        i--
    ) {

        if (
            tiros[i].y +
            tiros[i].altura <
            0
        ) {

            tiros.splice(i, 1);

        }

    }

}


function desenharTiros() {

    tiros.forEach(function(tiro) {

        ctx.save();

        ctx.shadowColor = "#ff304f";
        ctx.shadowBlur = 12;

        ctx.fillStyle = "#ff304f";

        ctx.fillRect(
            tiro.x,
            tiro.y,
            tiro.largura,
            tiro.altura
        );

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            tiro.x + 1,
            tiro.y,
            tiro.largura - 2,
            tiro.altura
        );

        ctx.restore();

    });

}

// ========================================
// ASTEROIDES
// ========================================

function criarAsteroide() {

    const configuracao =
        fases[faseAtual];

    const tamanho =
        Math.random() * 25 + 25;

    const velocidade =
        Math.random() *
        (
            configuracao.velocidadeMax -
            configuracao.velocidadeMin
        )
        +
        configuracao.velocidadeMin;


    asteroides.push({

        x:
            Math.random() *
            (canvas.width - tamanho),

        y:
            -tamanho,

        tamanho:
            tamanho,

        velocidade:
            velocidade

    });

}


function atualizarAsteroides() {

    asteroides.forEach(function(asteroide) {

        asteroide.y +=
            asteroide.velocidade;

    });


    for (
        let i = asteroides.length - 1;
        i >= 0;
        i--
    ) {

        if (
            asteroides[i].y >
            canvas.height +
            asteroides[i].tamanho
        ) {

            asteroides.splice(i, 1);

        }

    }

}


function desenharAsteroides() {

    if (!imagemAsteroide.complete) {
        return;
    }

    asteroides.forEach(function(asteroide) {

        ctx.drawImage(
            imagemAsteroide,
            asteroide.x,
            asteroide.y,
            asteroide.tamanho,
            asteroide.tamanho
        );

    });

}

function criarExplosao(x, y, tamanho) {

    for (let i = 0; i < 15; i++) {

        const angulo =
            Math.random() * Math.PI * 2;

        const velocidade =
            Math.random() * 3 + 1;

        particulas.push({

            x: x,
            y: y,

            velocidadeX:
                Math.cos(angulo) * velocidade,

            velocidadeY:
                Math.sin(angulo) * velocidade,

            tamanho:
                Math.random() * 3 + 2,

            vida: 1

        });

    }

    flashTela = 0.15;

}

function atualizarParticulas() {

    for (
        let i = particulas.length - 1;
        i >= 0;
        i--
    ) {

        const particula = particulas[i];

        particula.x += particula.velocidadeX;
        particula.y += particula.velocidadeY;

        particula.vida -= 0.03;

        if (particula.vida <= 0) {

            particulas.splice(i, 1);

        }

    }

    if (flashTela > 0) {
        flashTela -= 0.03;
    }

}
function desenharParticulas() {

    particulas.forEach(function(particula) {

        ctx.save();

        ctx.globalAlpha = particula.vida;

        ctx.fillStyle = "#ffffff";

        ctx.shadowColor = "#ff304f";
        ctx.shadowBlur = 8;

        ctx.fillRect(
            particula.x,
            particula.y,
            particula.tamanho,
            particula.tamanho
        );

        ctx.restore();

    });

}

// ========================================
// COLISÕES
// ========================================

function verificarColisoes() {


    // TIRO CONTRA ASTEROIDE

    for (
        let i = tiros.length - 1;
        i >= 0;
        i--
    ) {

        const tiro = tiros[i];


        for (
            let j = asteroides.length - 1;
            j >= 0;
            j--
        ) {

            const asteroide =
                asteroides[j];


            const tiroX =
                tiro.x +
                tiro.largura / 2;

            const tiroY =
                tiro.y +
                tiro.altura / 2;


            const asteroideX =
                asteroide.x +
                asteroide.tamanho / 2;

            const asteroideY =
                asteroide.y +
                asteroide.tamanho / 2;


            const distanciaX =
                Math.abs(
                    tiroX -
                    asteroideX
                );

            const distanciaY =
                Math.abs(
                    tiroY -
                    asteroideY
                );


            if (
                distanciaX <
                asteroide.tamanho / 2
                &&
                distanciaY <
                asteroide.tamanho / 2
            ) {
             criarExplosao(
              asteroideX,
              asteroideY,
              asteroide.tamanho
             );
                tiros.splice(i, 1);

                asteroides.splice(j, 1);

                asteroidesDestruidos++;

                pontos += 100;

                atualizarPlacar();

                verificarFimDaFase();

                break;

            }

        }

    }


    // NAVE CONTRA ASTEROIDE

    if (!jogoRodando) {
        return;
    }


    for (
        let i = asteroides.length - 1;
        i >= 0;
        i--
    ) {

        const asteroide =
            asteroides[i];


        const colidiu =

            nave.x <
            asteroide.x +
            asteroide.tamanho

            &&

            nave.x +
            nave.largura >
            asteroide.x

            &&

            nave.y <
            asteroide.y +
            asteroide.tamanho

            &&

            nave.y +
            nave.altura >
            asteroide.y;


        if (colidiu) {

            asteroides.splice(i, 1);

            perderVida();

            break;

        }

    }

}


// ========================================
// VIDA
// ========================================

function perderVida() {

    vidas--;

    atualizarPlacar();

    posicionarNave();


    if (vidas <= 0) {

        gameOver();

    }

}


// ========================================
// GAME OVER
// ========================================

function gameOver() {

    jogoRodando = false;
    missaoComecou = false;

    pararAsteroides();

    asteroides = [];
    tiros = [];


    const tela =
        document.getElementById("game-over");


    if (tela) {

        tela.classList.remove("escondida");

    }

}


// ========================================
// COMEÇAR MISSÃO
// ========================================

function comecarMissao() {

    faseAtual = 1;
    vidas = 3;
    pontos = 0;
    asteroidesDestruidos = 0;

    tiros = [];
    asteroides = [];

    jogoRodando = true;
    missaoComecou = true;


    const inicio =
        document.getElementById("inicio-missao");

    if (inicio) {
        inicio.classList.add("escondida");
    }


    const gameOver =
        document.getElementById("game-over");

    if (gameOver) {
        gameOver.classList.add("escondida");
    }


    atualizarPlacar();
    iniciarAsteroides();

}


// ========================================
// ASTEROIDES
// ========================================

function iniciarAsteroides() {

    pararAsteroides();


    intervaloAsteroides =
        setInterval(function() {

            if (!jogoRodando) {
                return;
            }


            const configuracao =
                fases[faseAtual];


            if (
                asteroidesDestruidos <
                configuracao.objetivo
            ) {

                criarAsteroide();

            }

        }, fases[faseAtual].intervalo);

}


function pararAsteroides() {

    if (
        intervaloAsteroides !== null
    ) {

        clearInterval(
            intervaloAsteroides
        );

        intervaloAsteroides = null;

    }

}


// ========================================
// FIM DA FASE
// ========================================

function verificarFimDaFase() {

    const objetivo =
        fases[faseAtual].objetivo;


    if (
        asteroidesDestruidos >=
        objetivo
    ) {

        terminarFase();

    }

}


function terminarFase() {

    jogoRodando = false;
    missaoComecou = false;

    pararAsteroides();

    asteroides = [];
    tiros = [];


    const tela =
        document.getElementById(
            "missao-concluida"
        );

    const titulo =
        document.getElementById(
            "titulo-missao"
        );

    const texto =
        document.getElementById(
            "texto-missao"
        );

    const botao =
        document.getElementById(
            "botao-missao"
        );


    if (faseAtual < 3) {

        titulo.textContent =
            ` FASE ${faseAtual} CONCLUÍDA! `;

        texto.textContent =
            `Prepare-se para a Fase ${faseAtual + 1}.`;

        botao.textContent =
            "CONTINUAR";

    }

    else {

        titulo.textContent =
            " MISSÃO CONCLUÍDA! ";

        texto.textContent =
            "Você sobreviveu às três fases da tempestade espacial.";

        botao.textContent =
            "IR PARA O SEGUNDO JOGO";

    }


    tela.classList.remove("escondida");

}


// ========================================
// CONTINUAR MISSÃO
// ========================================

function continuarMissao() {

    const tela =
        document.getElementById(
            "missao-concluida"
        );


    if (faseAtual < 3) {

        faseAtual++;

        vidas = 3;
        pontos = 0;
        asteroidesDestruidos = 0;

        tiros = [];
        asteroides = [];

        jogoRodando = true;
        missaoComecou = true;


        tela.classList.add("escondida");

        atualizarPlacar();
        iniciarAsteroides();

        return;

    }


    tela.classList.add("escondida");

    abrirEnigma1();

}


// ========================================
// REINICIAR JOGO
// ========================================

function reiniciarJogo() {

    const gameOver =
        document.getElementById("game-over");

    if (gameOver) {
        gameOver.classList.add("escondida");
    }


    faseAtual = 1;
    vidas = 3;
    pontos = 0;
    asteroidesDestruidos = 0;

    tiros = [];
    asteroides = [];

    jogoRodando = false;
    missaoComecou = false;


    atualizarPlacar();
    posicionarNave();


    const inicio =
        document.getElementById("inicio-missao");

    if (inicio) {
        inicio.classList.remove("escondida");
    }

}


// ========================================
// PLACAR
// ========================================

function atualizarPlacar() {

    const vidasElemento =
        document.getElementById("vidas");

    const informacoes =
        document.getElementById("informacoes-jogo");


    if (
        !vidasElemento ||
        !informacoes
    ) {
        return;
    }


    // ========================================
    // CORAÇÕES
    // ========================================

    vidasElemento.innerHTML = "";

    for (
        let i = 0;
        i < vidas;
        i++
    ) {

        const coracao =
            document.createElement("img");

        coracao.src =
            "coracao.png";

        coracao.alt =
            "Vida";

        coracao.className =
            "imagem-coracao";

        vidasElemento.appendChild(
            coracao
        );

    }


    // ========================================
    // INFORMAÇÕES
    // ========================================

    const objetivo =
        fases[faseAtual].objetivo;


    informacoes.textContent =
        `LEVEL ${faseAtual} | ` +
        `SCORE: ${pontos} | ` +
        `${asteroidesDestruidos} / ${objetivo}`;

}

// ========================================
// LOOP
// ========================================

function loop() {

    if (!ctx || !canvas) {
        return;
    }


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (
        teclas["ArrowLeft"] ||
        teclas["a"] ||
        teclas["A"]
    ) {

        nave.x -=
            nave.velocidade;

    }


    if (
        teclas["ArrowRight"] ||
        teclas["d"] ||
        teclas["D"]
    ) {

        nave.x +=
            nave.velocidade;

    }


    if (nave.x < 0) {
        nave.x = 0;
    }


    if (
        nave.x +
        nave.largura >
        canvas.width
    ) {

        nave.x =
            canvas.width -
            nave.largura;

    }


    if (jogoRodando) {

        atualizarTiros();
        atualizarAsteroides();
        verificarColisoes();

    }
        atualizarParticulas();

    desenharEstrelas();
    desenharAsteroides();
    desenharNave();
    desenharTiros();
    desenharParticulas();


    requestAnimationFrame(loop);

}


// ========================================
// REDIMENSIONAR
// ========================================

window.addEventListener(
    "resize",
    function() {

        ajustarCanvas();

    }
);



// ============================================================
// ENIGMA 1 — CIFRA DE CÉSAR
// ============================================================

const mensagemCorretaEnigma1 =
    `Quando a porta se fechar, não procure a saída. Procure aquilo que permanece escondido quando toda a janela está vazia. A chave da ação deve estar e aquilo que parece apenas decoração guarda o caminho para aquilo que você procura. Observe o que foi colocado fora do lugar, conte aquilo que ninguém encontrou e não confie na primeira coisa que seu olhar encontrar.`;


// ----------------------------------------
// NORMALIZAR TEXTO
// ----------------------------------------

function normalizarTexto(texto) {

    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();

}


// ----------------------------------------
// ABRIR ENIGMA 1
// ----------------------------------------

function abrirEnigma1() {

    mostrarTela("tela-enigma1");

}


// ----------------------------------------
// VERIFICAR ENIGMA 1
// ----------------------------------------

function verificarEnigma1() {

    const campo =
        document.getElementById(
            "resposta-enigma1"
        );

    const resultado =
        document.getElementById(
            "resultado-enigma1"
        );

    const botaoVerificar =
        document.getElementById(
            "botao-verificar-enigma1"
        );

    const botaoContinuar =
        document.getElementById(
            "botao-continuar-enigma1"
        );


    if (!campo || !resultado) {
        return;
    }


    const resposta =
        normalizarTexto(campo.value);

    const correta =
        normalizarTexto(
            mensagemCorretaEnigma1
        );


    if (resposta === correta) {

        resultado.textContent =
            " MENSAGEM DECIFRADA! ";

        resultado.className =
            "resultado sucesso";


        if (botaoVerificar) {
            botaoVerificar.disabled = true;
        }


        if (botaoContinuar) {
            botaoContinuar.classList.remove(
                "escondido"
            );
        }

    }

    else {

        resultado.textContent =
            " Ainda não. A mensagem continua escondendo alguma coisa.";

        resultado.className =
            "resultado erro";

    }

}


// ----------------------------------------
// CONTINUAR ENIGMA 1
// ----------------------------------------

function continuarEnigma1() {

    const botao =
        document.getElementById(
            "botao-continuar-enigma1"
        );


    if (
        botao &&
        botao.classList.contains("escondido")
    ) {
        return;
    }


    mostrarTela("tela-enigma2");

}


// ========================================
// CONFIGURAR BOTÃO DO ENIGMA 1
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const botaoVerificar =
            document.getElementById(
                "botao-verificar-enigma1"
            );

        const botaoContinuar =
            document.getElementById(
                "botao-continuar-enigma1"
            );


        if (botaoVerificar) {

            botaoVerificar.addEventListener(
                "click",
                verificarEnigma1
            );

        }


        if (botaoContinuar) {

            botaoContinuar.addEventListener(
                "click",
                continuarEnigma1
            );

        }

    }
);



// ============================================================
// ENIGMA 2 — O QUADRO
// ============================================================

// ========================================
// ESTADO DO ENIGMA
// ========================================

let chaveFoiEncontrada = false;


// ========================================
// PISTAS DO QUADRO
// ========================================

const pistasQuadro = {

    lua: {
        titulo: " LUA",
        texto:
            "03\n\n" +
            "Uma lua observa a cena através da escuridão."
    },

    flor: {
        titulo: " FLOR",
        texto:
            "17\n\n" +
            "Uma flor antiga. Parece ter sido colocada cuidadosamente aqui."
    },

    chave: {
        titulo: " CHAVE",
        texto:
            "08\n\n" +
            "Uma chave enferrujada.\n\n" +
            "Ela parece diferente dos outros objetos."
    },

    relogio: {
        titulo: " RELÓGIO",
        texto:
            "21\n\n" +
            "O relógio marca uma hora que não parece corresponder ao ambiente."
    },

    janela: {
        titulo: "🪟 JANELA",
        texto:
            "14\n\n" +
            "Do outro lado da janela não há nada além de escuridão."
    }

};


// ========================================
// ABRIR PISTA
// ========================================

function abrirPistaQuadro(objeto) {

    const pista = pistasQuadro[objeto];

    if (!pista) {
        return;
    }

    const janela =
        document.getElementById("janela-pista-quadro");

    const titulo =
        document.getElementById("titulo-pista-quadro");

    const texto =
        document.getElementById("texto-pista-quadro");


    titulo.textContent = pista.titulo;
    texto.textContent = pista.texto;

    janela.classList.remove("escondida");


    // ====================================
    // SE FOR A CHAVE
    // ====================================

      if (objeto === "chave") {

        chaveFoiEncontrada = true;

        const chave =
            document.querySelector(".area-clique.chave");

        if (chave) {

            chave.classList.add("escondida");

        }

    }

}

// ========================================
// FECHAR PISTA
// ========================================

function fecharPistaQuadro() {
    const janela =
        document.getElementById(
            "janela-pista-quadro"
        );

    janela.classList.add("escondida");

    // ====================================
    // SE ENCONTROU A CHAVE
    // ====================================
    if (chaveFoiEncontrada) {

        // Esconde a imagem COM a chave
        const imagemComChave =
            document.querySelector(
                ".imagem-objetos-com-chave"
            );

        if (imagemComChave) {
            imagemComChave.classList.add(
                "escondida"
            );
        }

        // Mostra a imagem SEM a chave
        const imagemSemChave =
            document.querySelector(
                ".imagem-objetos-sem-chave"
            );

        if (imagemSemChave) {
            imagemSemChave.classList.remove(
                "escondida"
            );
        }

        // Mostra a mensagem de chave encontrada
        const chaveEncontrada =
            document.getElementById(
                "chave-encontrada"
            );

        if (chaveEncontrada) {
            chaveEncontrada.classList.remove(
                "escondida"
            );
        }
    }
}


// ========================================
// CONTINUAR DEPOIS DE ENCONTRAR A CHAVE
// ========================================

function continuarEnigma2() {

    const chaveEncontrada =
        document.getElementById(
            "chave-encontrada"
        );

    const resposta =
        document.getElementById(
            "resposta-quadro"
        );


    // Esconde a mensagem da chave

    if (chaveEncontrada) {

        chaveEncontrada.classList.add(
            "escondida"
        );

    }


    // Mostra a parte da resposta

    if (resposta) {

        resposta.classList.remove(
            "escondida"
        );

    }

}


// ========================================
// RESPOSTA DO ENIGMA 2
// ========================================

const respostaCorretaEnigma2 =
    "JANELA";


// ========================================
// NORMALIZAR RESPOSTA
// ========================================

function normalizarRespostaEnigma2(texto) {

    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();

}


// ========================================
// VERIFICAR ENIGMA 2
// ========================================

function verificarEnigma2() {

    const campo =
        document.getElementById(
            "resposta-enigma2"
        );

    const resultado =
        document.getElementById(
            "resultado-enigma2"
        );

    const botaoContinuar =
        document.getElementById(
            "botao-continuar-enigma2"
        );


    if (!campo || !resultado || !botaoContinuar) {
        console.error(
            "Elementos do Enigma 2 não encontrados."
        );
        return;
    }


    const resposta =
        normalizarRespostaEnigma2(
            campo.value
        );

    const correta =
        normalizarRespostaEnigma2(
            respostaCorretaEnigma2
        );


    // ====================================
    // RESPOSTA CORRETA
    // ====================================

    if (resposta === correta) {

        resultado.textContent =
            " VOCÊ DESCOBRIU ONDE USAR A CHAVE! ";

        resultado.className =
            "resultado sucesso";


        // AGORA SIM aparece o botão
        // para ir ao Enigma 3

        botaoContinuar.classList.remove(
            "escondido"
        );

    }


    // ====================================
    // RESPOSTA ERRADA
    // ====================================

    else {

        resultado.textContent =
            " Ainda não. A chave precisa abrir alguma coisa...";

        resultado.className =
            "resultado erro";


        // Garante que o botão continue escondido

        botaoContinuar.classList.add(
            "escondido"
        );

    }

}


// ============================================================
// ENIGMA 3 — AS PORTAS
// ============================================================


// ========================================
// PORTA CORRETA
// ========================================



const portaCorreta = "b";


// ========================================
// IR PARA ENIGMA 3
// ========================================

function irParaEnigma3() {

    // Esconde qualquer elemento
    // restante do Enigma 2

    const chaveEncontrada =
        document.getElementById(
            "chave-encontrada"
        );

    const resposta =
        document.getElementById(
            "resposta-quadro"
        );


    if (chaveEncontrada) {

        chaveEncontrada.classList.add(
            "escondida"
        );

    }


    if (resposta) {

        resposta.classList.add(
            "escondida"
        );

    }


    // Vai para o Enigma 3

    mostrarTela("tela-enigma3");

}


// ========================================
// ESCOLHER PORTA
// ========================================

function escolherPorta(porta) {
    const resultado = document.getElementById("resultado-porta");
    const botaoFinal = document.getElementById("botao-final-enigma3");

    if (!resultado || !botaoFinal) {
        console.error("Não encontrei o resultado ou o botão de continuar.");
        return;
    }

    // Esconde o botão até confirmar a porta correta.
    botaoFinal.classList.add("escondido");

    if (porta !== portaCorreta) {
        resultado.textContent = "A chave gira, mas essa não é a porta.";
        resultado.className = "resultado erro";
        return;
    }

    resultado.textContent = "CLIC... A porta se abriu. Você encontrou o caminho.";
    resultado.className = "resultado sucesso";

    // Libera o botão somente após acertar.
    botaoFinal.classList.remove("escondido");
}

// ========================================
// VOLTAR AO QUADRO
// ========================================

function voltarAoQuadro() {
    mostrarTela("tela-enigma2");
}

// ========================================
// FINAL DO ENIGMA 3
// ========================================

function finalizarEnigma3() {
    mostrarTela("tela-fotos");
}



function virarFoto(botao) {
    botao.classList.toggle("virada");
}



function reproduzirAudio() {
    const audio = document.getElementById("audio-cartas");

    if (audio.paused) {
        audio.play().catch((erro) => {
            console.error("Não foi possível reproduzir o áudio:", erro);
        });
    } else {
        audio.pause();
    }
}
