const API_URL = "/api/acidentes";

let acidentesAtuais = [];
let graficoUf = null;

const LIMITE_TABELA = 500;


// =========================================
// INICIALIZAÇÃO
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    registrarEventos();

    carregarAcidentes();

});


// =========================================
// EVENTOS
// =========================================

function registrarEventos() {

    document
        .getElementById("formAcidente")
        .addEventListener("submit", salvarAcidente);

    document
        .getElementById("formFiltro")
        .addEventListener("submit", filtrarAcidentes);

    document
        .getElementById("btnLimparFiltro")
        .addEventListener("click", limparFiltros);

    document
        .getElementById("btnBuscarId")
        .addEventListener("click", buscarPorId);

    document
        .getElementById("btnAtualizar")
        .addEventListener("click", carregarAcidentes);

    document
        .getElementById("btnCancelarEdicao")
        .addEventListener("click", limparFormulario);

    document
        .getElementById("formImportacao")
        .addEventListener("submit", importarCsv);

}


// =========================================
// LISTAR ACIDENTES
// GET /api/acidentes
// =========================================

async function carregarAcidentes() {

    try {

        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error(
                await extrairMensagemErro(resposta)
            );
        }

        const acidentes = await resposta.json();

        atualizarInterface(acidentes);

    } catch (erro) {

        console.error(erro);

        mostrarMensagem(
            "Não foi possível carregar os acidentes: " +
            erro.message,
            "erro"
        );

    }

}


// =========================================
// ATUALIZAR TELA
// =========================================

function atualizarInterface(acidentes) {

    acidentesAtuais = acidentes;

    document.getElementById("totalAcidentes").textContent =
        acidentes.length;

    renderizarTabela(acidentes);

    atualizarGrafico(acidentes);

}


// =========================================
// TABELA
// =========================================

function renderizarTabela(acidentes) {

    const corpoTabela =
        document.getElementById("corpoTabela");

    corpoTabela.innerHTML = "";

    if (acidentes.length === 0) {

        const linha = document.createElement("tr");

        const coluna = document.createElement("td");

        coluna.colSpan = 11;
        coluna.textContent =
            "Nenhum acidente encontrado.";

        linha.appendChild(coluna);
        corpoTabela.appendChild(linha);

        return;
    }


    const acidentesExibidos =
        acidentes.slice(0, LIMITE_TABELA);


    acidentesExibidos.forEach(acidente => {

        const linha = document.createElement("tr");

        adicionarCelula(linha, acidente.id);

        adicionarCelula(
            linha,
            acidente.idPrf ?? "—"
        );

        adicionarCelula(
            linha,
            formatarData(acidente.dataOcorrencia)
        );

        adicionarCelula(
            linha,
            formatarHorario(acidente.horario)
        );

        adicionarCelula(linha, acidente.uf);

        adicionarCelula(
            linha,
            acidente.municipio
        );

        adicionarCelula(
            linha,
            acidente.rodovia
        );

        adicionarCelula(
            linha,
            formatarNumero(acidente.quilometro)
        );

        adicionarCelula(
            linha,
            acidente.causaAcidente
        );

        adicionarCelula(
            linha,
            acidente.classificacao
        );


        // AÇÕES
        const colunaAcoes =
            document.createElement("td");

        const containerAcoes =
            document.createElement("div");

        containerAcoes.className =
            "acoes-tabela";


        const botaoEditar =
            document.createElement("button");

        botaoEditar.textContent = "Editar";

        botaoEditar.className =
            "btn btn-editar";

        botaoEditar.addEventListener(
            "click",
            () => editarAcidente(acidente.id)
        );


        const botaoExcluir =
            document.createElement("button");

        botaoExcluir.textContent = "Excluir";

        botaoExcluir.className =
            "btn btn-excluir";

        botaoExcluir.addEventListener(
            "click",
            () => excluirAcidente(acidente.id)
        );


        containerAcoes.appendChild(botaoEditar);
        containerAcoes.appendChild(botaoExcluir);

        colunaAcoes.appendChild(containerAcoes);

        linha.appendChild(colunaAcoes);

        corpoTabela.appendChild(linha);

    });


    // Evita renderizar dezenas de milhares de linhas
    // de uma vez após importar o CSV completo.
    if (acidentes.length > LIMITE_TABELA) {

        const linha = document.createElement("tr");

        const coluna = document.createElement("td");

        coluna.colSpan = 11;

        coluna.textContent =
            `Exibindo os primeiros ${LIMITE_TABELA} ` +
            `de ${acidentes.length} registros.`;

        coluna.style.textAlign = "center";

        linha.appendChild(coluna);
        corpoTabela.appendChild(linha);

    }

}


function adicionarCelula(linha, valor) {

    const coluna = document.createElement("td");

    coluna.textContent =
        valor ?? "—";

    linha.appendChild(coluna);

}


// =========================================
// CADASTRAR / ATUALIZAR
// =========================================

async function salvarAcidente(evento) {

    evento.preventDefault();

    const id =
        document.getElementById("acidenteId").value;

    const acidente =
        obterDadosFormulario();


    const editando =
        id !== "";


    const url =
        editando
            ? `${API_URL}/${id}`
            : API_URL;


    const metodo =
        editando
            ? "PUT"
            : "POST";


    try {

        const resposta = await fetch(url, {

            method: metodo,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(acidente)

        });


        if (!resposta.ok) {

            throw new Error(
                await extrairMensagemErro(resposta)
            );

        }


        mostrarMensagem(
            editando
                ? "Acidente atualizado com sucesso."
                : "Acidente cadastrado com sucesso.",
            "sucesso"
        );


        limparFormulario();

        await carregarAcidentes();


    } catch (erro) {

        console.error(erro);

        mostrarMensagem(
            erro.message,
            "erro"
        );

    }

}


// =========================================
// MONTAR JSON
// =========================================

function obterDadosFormulario() {

    const horario =
        document.getElementById("horario").value;

    const idPrf =
        document.getElementById("idPrf").value;


    return {

        idPrf:
            idPrf
                ? Number(idPrf)
                : null,

        dataOcorrencia:
        document.getElementById(
            "dataOcorrencia"
        ).value,

        horario:
            horario.length === 5
                ? `${horario}:00`
                : horario,

        uf:
        document.getElementById("uf").value,

        municipio:
            document
                .getElementById("municipio")
                .value
                .trim(),

        rodovia:
            document
                .getElementById("rodovia")
                .value
                .trim(),

        quilometro:
            Number(
                document.getElementById(
                    "quilometro"
                ).value
            ),

        causaAcidente:
            document
                .getElementById("causaAcidente")
                .value
                .trim(),

        classificacao:
            document
                .getElementById("classificacao")
                .value
                .trim()

    };

}


// =========================================
// EDITAR
// GET /api/acidentes/{id}
// =========================================

async function editarAcidente(id) {

    try {

        const resposta =
            await fetch(`${API_URL}/${id}`);


        if (!resposta.ok) {

            throw new Error(
                await extrairMensagemErro(resposta)
            );

        }


        const acidente =
            await resposta.json();


        document.getElementById(
            "acidenteId"
        ).value = acidente.id;


        const campoIdPrf =
            document.getElementById("idPrf");

        campoIdPrf.value =
            acidente.idPrf ?? "";

        /*
         * O backend atual não altera idPrf
         * no PUT. Por isso bloqueamos o campo
         * durante a edição.
         */
        campoIdPrf.disabled = true;


        document.getElementById(
            "dataOcorrencia"
        ).value =
            acidente.dataOcorrencia ?? "";


        document.getElementById(
            "horario"
        ).value =
            acidente.horario
                ? acidente.horario.substring(0, 5)
                : "";


        document.getElementById(
            "uf"
        ).value =
            acidente.uf ?? "";


        document.getElementById(
            "municipio"
        ).value =
            acidente.municipio ?? "";


        document.getElementById(
            "rodovia"
        ).value =
            acidente.rodovia ?? "";


        document.getElementById(
            "quilometro"
        ).value =
            acidente.quilometro ?? "";


        document.getElementById(
            "causaAcidente"
        ).value =
            acidente.causaAcidente ?? "";


        document.getElementById(
            "classificacao"
        ).value =
            acidente.classificacao ?? "";


        document.getElementById(
            "tituloFormulario"
        ).textContent =
            `Editar acidente #${acidente.id}`;


        document.getElementById(
            "btnSalvar"
        ).textContent =
            "Salvar alterações";


        document.getElementById(
            "btnCancelarEdicao"
        ).classList.remove("oculto");


        document
            .getElementById("formAcidente")
            .scrollIntoView({
                behavior: "smooth"
            });


    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );

    }

}


// =========================================
// CANCELAR EDIÇÃO
// =========================================

function limparFormulario() {

    document
        .getElementById("formAcidente")
        .reset();


    document.getElementById(
        "acidenteId"
    ).value = "";


    const campoIdPrf =
        document.getElementById("idPrf");

    campoIdPrf.disabled = false;


    document.getElementById(
        "tituloFormulario"
    ).textContent =
        "Cadastrar acidente";


    document.getElementById(
        "btnSalvar"
    ).textContent =
        "Salvar acidente";


    document.getElementById(
        "btnCancelarEdicao"
    ).classList.add("oculto");

}


// =========================================
// EXCLUIR
// DELETE /api/acidentes/{id}
// =========================================

async function excluirAcidente(id) {

    const confirmou =
        confirm(
            `Deseja realmente excluir o acidente #${id}?`
        );


    if (!confirmou) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                await extrairMensagemErro(resposta)
            );

        }


        mostrarMensagem(
            "Acidente excluído com sucesso.",
            "sucesso"
        );


        await carregarAcidentes();


    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );

    }

}


// =========================================
// FILTROS
// GET /api/acidentes/filtro
// =========================================

async function filtrarAcidentes(evento) {

    evento.preventDefault();


    const uf =
        document
            .getElementById("filtroUf")
            .value;


    const rodovia =
        document
            .getElementById("filtroRodovia")
            .value
            .trim();


    const parametros =
        new URLSearchParams();


    if (uf) {
        parametros.append("uf", uf);
    }

    if (rodovia) {
        parametros.append(
            "rodovia",
            rodovia
        );
    }


    if (
        !parametros.has("uf") &&
        !parametros.has("rodovia")
    ) {

        await carregarAcidentes();
        return;

    }


    try {

        const resposta =
            await fetch(
                `${API_URL}/filtro?${parametros}`
            );


        if (!resposta.ok) {

            throw new Error(
                await extrairMensagemErro(resposta)
            );

        }


        const acidentes =
            await resposta.json();


        atualizarInterface(acidentes);


        mostrarMensagem(
            `${acidentes.length} registro(s) encontrado(s).`,
            "info"
        );


    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );

    }

}


// =========================================
// LIMPAR FILTROS
// =========================================

async function limparFiltros() {

    document.getElementById(
        "formFiltro"
    ).reset();


    await carregarAcidentes();

}


// =========================================
// BUSCAR POR ID
// GET /api/acidentes/{id}
// =========================================

async function buscarPorId() {

    const id =
        document.getElementById(
            "filtroId"
        ).value;


    if (!id) {

        mostrarMensagem(
            "Informe um ID para realizar a busca.",
            "erro"
        );

        return;

    }


    try {

        const resposta =
            await fetch(
                `${API_URL}/${id}`
            );


        if (resposta.status === 404) {

            atualizarInterface([]);

            mostrarMensagem(
                `O acidente de ID ${id} não foi encontrado. HTTP 404.`,
                "erro"
            );

            return;

        }


        if (!resposta.ok) {

            throw new Error(
                await extrairMensagemErro(resposta)
            );

        }


        const acidente =
            await resposta.json();


        atualizarInterface([acidente]);


        mostrarMensagem(
            `Acidente #${id} encontrado.`,
            "sucesso"
        );


    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );

    }

}


// =========================================
// IMPORTAÇÃO CSV
// POST /api/acidentes/importar
// =========================================

async function importarCsv(evento) {

    evento.preventDefault();


    const inputArquivo =
        document.getElementById("arquivoCsv");


    const arquivo =
        inputArquivo.files[0];


    if (!arquivo) {

        mostrarMensagem(
            "Selecione um arquivo CSV.",
            "erro"
        );

        return;

    }


    const formData =
        new FormData();


    /*
     * O nome "arquivo" precisa ser exatamente
     * igual ao @RequestParam("arquivo")
     * utilizado pelo backend.
     */
    formData.append(
        "arquivo",
        arquivo
    );


    const botao =
        evento.submitter;


    try {

        botao.disabled = true;
        botao.textContent =
            "Importando...";


        mostrarMensagem(
            "Importação em andamento...",
            "info"
        );


        const resposta =
            await fetch(
                `${API_URL}/importar`,
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!resposta.ok) {

            throw new Error(
                await extrairMensagemErro(resposta)
            );

        }


        const resultado =
            await resposta.json();


        document.getElementById(
            "linhasLidas"
        ).textContent =
            resultado.linhasLidas;


        document.getElementById(
            "linhasImportadas"
        ).textContent =
            resultado.importadas;


        document.getElementById(
            "linhasRejeitadas"
        ).textContent =
            resultado.rejeitadas;


        document.getElementById(
            "linhasDuplicadas"
        ).textContent =
            resultado.duplicadas;


        document.getElementById(
            "mensagemImportacao"
        ).textContent =
            resultado.mensagem;


        document.getElementById(
            "resultadoImportacao"
        ).classList.remove("oculto");


        inputArquivo.value = "";


        mostrarMensagem(
            "Importação concluída com sucesso.",
            "sucesso"
        );


        await carregarAcidentes();


    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );


    } finally {

        botao.disabled = false;
        botao.textContent =
            "Importar CSV";

    }

}


// =========================================
// GRÁFICO
// =========================================

function atualizarGrafico(acidentes) {

    const totaisPorUf = {};


    acidentes.forEach(acidente => {

        const uf =
            acidente.uf || "Não informado";


        totaisPorUf[uf] =
            (totaisPorUf[uf] || 0) + 1;

    });


    const dadosOrdenados =
        Object.entries(totaisPorUf)
            .sort((a, b) => b[1] - a[1]);


    const ufs =
        dadosOrdenados.map(
            item => item[0]
        );


    const totais =
        dadosOrdenados.map(
            item => item[1]
        );


    if (graficoUf) {
        graficoUf.destroy();
    }


    const contexto =
        document
            .getElementById("graficoUf")
            .getContext("2d");


    graficoUf = new Chart(
        contexto,
        {

            type: "bar",

            data: {

                labels: ufs,

                datasets: [
                    {
                        label:
                            "Quantidade de acidentes",

                        data: totais,

                        backgroundColor:
                            "rgba(18, 58, 99, 0.75)",

                        borderColor:
                            "rgba(18, 58, 99, 1)",

                        borderWidth: 1
                    }
                ]

            },

            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    x: {

                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }

                    }

                }

            }

        }
    );

}


// =========================================
// MENSAGENS
// =========================================

function mostrarMensagem(
    texto,
    tipo = "info"
) {

    const elemento =
        document.getElementById("mensagem");


    elemento.textContent = texto;


    elemento.className =
        `mensagem mensagem-${tipo}`;


    elemento.classList.remove(
        "oculto"
    );


    window.clearTimeout(
        mostrarMensagem.timeout
    );


    mostrarMensagem.timeout =
        window.setTimeout(
            () => {

                elemento.classList.add(
                    "oculto"
                );

            },
            6000
        );

}


// =========================================
// ERROS DA API
// =========================================

async function extrairMensagemErro(
    resposta
) {

    try {

        const texto =
            await resposta.text();


        if (!texto) {

            return `Erro HTTP ${resposta.status}`;

        }


        const dados =
            JSON.parse(texto);


        if (dados.erro) {
            return dados.erro;
        }


        if (
            Array.isArray(dados.erros)
        ) {

            return dados.erros.join(" ");

        }


        return `Erro HTTP ${resposta.status}`;


    } catch {

        return `Erro HTTP ${resposta.status}`;

    }

}


// =========================================
// FORMATAÇÃO
// =========================================

function formatarData(data) {

    if (!data) {
        return "—";
    }


    const partes =
        data.split("-");


    if (partes.length !== 3) {
        return data;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function formatarHorario(horario) {

    if (!horario) {
        return "—";
    }


    return horario.substring(0, 5);

}


function formatarNumero(numero) {

    if (
        numero === null ||
        numero === undefined
    ) {
        return "—";
    }


    return Number(numero)
        .toLocaleString(
            "pt-BR",
            {
                maximumFractionDigits: 2
            }
        );

}