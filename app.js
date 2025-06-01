document.addEventListener('DOMContentLoaded', () => {
    // Declara variáveis que irão armazenar os dados carregados
    // Elas serão populadas pela chamada fetch
    let clientes = [];
    let carros = [];
    let locacoes = [];

    // --- Funções para Gerar Novos IDs ---
    function getNextClienteId() {
        return clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
    }

    function getNextCarroId() {
        // Mantém o padrão de IDs de carros começando em 101 se vazio
        return carros.length > 0 ? Math.max(...carros.map(c => c.id)) + 1 : 101;
    }

    function getNextLocacaoId() {
        // Mantém o padrão de IDs de locações começando em 1001 se vazio
        return locacoes.length > 0 ? Math.max(...locacoes.map(l => l.id)) + 1 : 1001;
    }

    // --- Funções para Renderizar Tabelas ---
    function renderClientesTable() {
        const tbody = document.getElementById('tabelaClientesBody');
        tbody.innerHTML = ''; // Limpa antes de renderizar
        clientes.forEach(cliente => {
            const tr = tbody.insertRow();
            tr.insertCell().textContent = cliente.id;
            tr.insertCell().textContent = cliente.nome;
            tr.insertCell().textContent = cliente.cpf;
            tr.insertCell().textContent = cliente.telefone;
            tr.insertCell().textContent = cliente.email;
        });
    }

    function renderCarrosTable() {
        const tbody = document.getElementById('tabelaCarrosBody');
        tbody.innerHTML = '';
        carros.forEach(carro => {
            const tr = tbody.insertRow();
            tr.insertCell().textContent = carro.id;
            tr.insertCell().textContent = carro.marca;
            tr.insertCell().textContent = carro.modelo;
            tr.insertCell().textContent = carro.ano;
            tr.insertCell().textContent = carro.placa;
            tr.insertCell().textContent = carro.disponivel ? 'Sim' : 'Não';
        });
    }

    function renderLocacoesTable() {
        const tbody = document.getElementById('tabelaLocacoesBody');
        tbody.innerHTML = '';
        locacoes.forEach(locacao => {
            const cliente = clientes.find(c => c.id === locacao.cliente_id);
            const carro = carros.find(ca => ca.id === locacao.carro_id);

            const tr = tbody.insertRow();
            tr.insertCell().textContent = locacao.id;
            tr.insertCell().textContent = cliente ? cliente.nome : `Cliente ID ${locacao.cliente_id} não encontrado`;
            tr.insertCell().textContent = carro ? `${carro.marca} ${carro.modelo} (${carro.placa})` : `Carro ID ${locacao.carro_id} não encontrado`;
            tr.insertCell().textContent = locacao.data_inicio;
            tr.insertCell().textContent = locacao.data_fim;
            tr.insertCell().textContent = `R$ ${parseFloat(locacao.valor_total).toFixed(2)}`;
        });
    }

    // --- Funções para Popular Selects dos Formulários ---
    function popularSelectClientes() {
        const select = document.getElementById('locacaoCliente');
        select.innerHTML = '<option value="" disabled selected>Selecione um cliente</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nome} (${cliente.cpf})`;
            select.appendChild(option);
        });
    }

    function popularSelectCarrosDisponiveis() {
        const select = document.getElementById('locacaoCarro');
        select.innerHTML = '<option value="" disabled selected>Selecione um carro</option>';
        carros.filter(carro => carro.disponivel).forEach(carro => {
            const option = document.createElement('option');
            option.value = carro.id;
            option.textContent = `${carro.marca} ${carro.modelo} (${carro.placa})`;
            select.appendChild(option);
        });
    }
    
    // Formatar data de YYYY-MM-DD (input type="date") para DD-MM-YYYY (JSON)
    function formatarDataParaJSON(dataInput) {
        if (!dataInput) return ""; // Retorna string vazia se a data não for fornecida
        const [ano, mes, dia] = dataInput.split('-');
        return `${dia}-${mes}-${ano}`;
    }

    // --- Handlers para Cadastro ---
    document.getElementById('formCadastroCliente').addEventListener('submit', function(event) {
        event.preventDefault();
        const novoCliente = {
            id: getNextClienteId(),
            nome: document.getElementById('clienteNome').value.trim(),
            cpf: document.getElementById('clienteCpf').value.trim(),
            telefone: document.getElementById('clienteTelefone').value.trim(),
            email: document.getElementById('clienteEmail').value.trim(),
        };
        if (!novoCliente.nome || !novoCliente.cpf || !novoCliente.email) {
            alert('Nome, CPF e Email são obrigatórios para cadastrar cliente.');
            return;
        }
        clientes.push(novoCliente);
        renderClientesTable();
        popularSelectClientes(); // Atualiza o select de clientes no form de locação
        this.reset(); // Limpa o formulário
        bootstrap.Modal.getInstance(document.getElementById('modalCadastroCliente')).hide(); // Esconde o modal
        alert('Cliente cadastrado com sucesso!');
    });

    document.getElementById('formCadastroCarro').addEventListener('submit', function(event) {
        event.preventDefault();
        const novoCarro = {
            id: getNextCarroId(),
            marca: document.getElementById('carroMarca').value.trim(),
            modelo: document.getElementById('carroModelo').value.trim(),
            ano: parseInt(document.getElementById('carroAno').value),
            placa: document.getElementById('carroPlaca').value.trim(),
            disponivel: document.getElementById('carroDisponivel').checked,
        };
        if (!novoCarro.marca || !novoCarro.modelo || isNaN(novoCarro.ano) || !novoCarro.placa) {
            alert('Marca, Modelo, Ano e Placa são obrigatórios para cadastrar carro.');
            return;
        }
        carros.push(novoCarro);
        renderCarrosTable();
        popularSelectCarrosDisponiveis(); // Atualiza o select de carros no form de locação
        this.reset();
        bootstrap.Modal.getInstance(document.getElementById('modalCadastroCarro')).hide();
        alert('Carro cadastrado com sucesso!');
    });

    document.getElementById('formCadastroLocacao').addEventListener('submit', function(event) {
        event.preventDefault();
        const clienteId = parseInt(document.getElementById('locacaoCliente').value);
        const carroId = parseInt(document.getElementById('locacaoCarro').value);
        const dataInicioInput = document.getElementById('locacaoDataInicio').value;
        const dataFimInput = document.getElementById('locacaoDataFim').value;
        const valorTotal = parseFloat(document.getElementById('locacaoValor').value);

        if (isNaN(clienteId) || isNaN(carroId)) {
            alert('Por favor, selecione um cliente e um carro válidos.');
            return;
        }
        if (!dataInicioInput || !dataFimInput || isNaN(valorTotal)) {
            alert('Data de início, data de fim e valor total são obrigatórios.');
            return;
        }

        const novaLocacao = {
            id: getNextLocacaoId(),
            cliente_id: clienteId,
            carro_id: carroId,
            data_inicio: formatarDataParaJSON(dataInicioInput),
            data_fim: formatarDataParaJSON(dataFimInput),
            valor_total: valorTotal,
        };

        if (new Date(dataFimInput) < new Date(dataInicioInput)) {
            alert('A data final não pode ser anterior à data inicial.');
            return;
        }

        const carroAlugado = carros.find(c => c.id === carroId);
        if (carroAlugado) {
            if (!carroAlugado.disponivel) {
                alert('O carro selecionado não está mais disponível. Por favor, atualize a lista e tente novamente.');
                popularSelectCarrosDisponiveis(); // Atualiza a lista caso tenha mudado em outro momento
                return;
            }
            carroAlugado.disponivel = false;
        } else {
            alert('Carro selecionado não encontrado. Isso não deveria acontecer se o select foi populado corretamente.');
            return;
        }

        locacoes.push(novaLocacao);
        renderLocacoesTable();
        renderCarrosTable(); // Para refletir a mudança de disponibilidade
        popularSelectCarrosDisponiveis(); // Atualiza a lista de carros disponíveis
        this.reset();
        bootstrap.Modal.getInstance(document.getElementById('modalCadastroLocacao')).hide();
        alert('Locação cadastrada com sucesso!');
    });


    // --- Inicialização e Carregamento de Dados ---
    async function carregarDadosEIniciarAplicacao() {
        try {
            // O caminho 'data/locadora.json' é relativo ao arquivo HTML (index.html)
            const response = await fetch('data/locadora.json'); 
            
            if (!response.ok) {
                // Se a resposta não for OK (ex: 404, 500), lança um erro
                throw new Error(`Erro ao buscar o arquivo: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();

            // Atribui os dados carregados às variáveis no escopo do DOMContentLoaded
            // Garante que sejam arrays mesmo se o JSON estiver malformado ou a chave não existir
            clientes = data.clientes || []; 
            carros = data.carros || [];
            locacoes = data.locacoes || [];

            // Agora que os dados estão carregados, inicializa a renderização das tabelas e os selects
            renderClientesTable();
            renderCarrosTable();
            renderLocacoesTable();
            popularSelectClientes();
            popularSelectCarrosDisponiveis();

            // Adiciona listeners para popular selects quando os modais de locação são abertos
            // Isso garante que os selects de cliente e carro estejam sempre atualizados
            const modalLocacaoElement = document.getElementById('modalCadastroLocacao');
            if (modalLocacaoElement) {
                modalLocacaoElement.addEventListener('show.bs.modal', () => {
                    popularSelectClientes();
                    popularSelectCarrosDisponiveis();
                });
            }

        } catch (error) {
            console.error("Falha ao carregar ou processar o arquivo locadora.json:", error);
            // Tenta exibir uma mensagem de erro mais amigável na página, dentro do container principal
            const mainContainer = document.querySelector('div.container'); 
            const displayErrorArea = mainContainer || document.body; // Fallback para o body se o container não for encontrado

            displayErrorArea.innerHTML = `
                <div class="alert alert-danger mt-5" role="alert">
                    <h4>Erro Crítico ao Carregar Dados</h4>
                    <p>Não foi possível carregar as informações da locadora a partir do arquivo <code>data/locadora.json</code>.</p>
                    <p><strong>Possíveis causas:</strong></p>
                    <ul>
                        <li>O arquivo <code>data/locadora.json</code> não foi encontrado no local esperado. Verifique se ele está na pasta 'data/' no mesmo nível do seu arquivo HTML principal (index.html).</li>
                        <li>O arquivo <code>locadora.json</code> pode conter erros de sintaxe JSON. Verifique a validade do JSON.</li>
                        <li>Problemas de permissão de acesso ao arquivo no servidor (se estiver rodando em um).</li>
                        <li>A política de CORS pode estar bloqueando a requisição se o HTML estiver sendo aberto localmente (file://) em alguns navegadores. Tente usar um servidor local simples (como Live Server do VS Code).</li>
                    </ul>
                    <p><strong>Detalhes do erro (para desenvolvedores):</strong> ${error.message}</p>
                    <p>Por favor, verifique o console do navegador para mais informações e tente recarregar a página após corrigir o problema.</p>
                </div>`;
        }
    }

    // Inicia o processo de carregamento dos dados e configuração da aplicação
    carregarDadosEIniciarAplicacao();
});