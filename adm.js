// ==========================
// CONFIGURAÇÃO SUPABASE
// ==========================
const supabaseUrl = 'https://uqutpnljzqinpqufufql.supabase.co';
const supabaseKey = 'sb_publishable_9ZFZPSQwU0cYow5HdkpQJw_L9hgRrWl';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ==========================
// TROCA DE ABAS
// ==========================
function switchTab(tab, el) {
    document.querySelectorAll('.tab-content')
        .forEach(t => t.classList.remove('active'));

    document.querySelectorAll('.btn-tab')
        .forEach(b => b.classList.remove('active'));

    document.getElementById(`tab-${tab}`).classList.add('active');
    el.classList.add('active');

    if (tab === 'pedidos') carregarPedidos();
    if (tab === 'produtos') carregarProdutos();
}

// ==========================
// CARREGAR PEDIDOS
// ==========================
async function carregarPedidos() {
    const container = document.getElementById('lista-pedidos');
    container.innerHTML = "Carregando pedidos...";

    const { data, error } = await _supabase
        .from('pedidos')
        .select('*, itens_pedido(*)')
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = "Erro ao carregar pedidos: " + error.message;
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = "Nenhum pedido encontrado.";
        return;
    }

    let tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Data / Hora</th>
                    <th>Cliente</th>
                    <th>WhatsApp</th>
                    <th>Endereço</th>
                    <th>Total</th>
                    <th>Itens</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(p => {
        const dataHora = new Date(p.created_at).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        });

        const itens = p.itens_pedido
            ?.map(i => `${i.produto_nome} (${i.tamanho})`)
            .join(', ') || '-';

        tableHtml += `
            <tr>
                <td>${dataHora}</td>
                <td>${p.cliente_nome || '-'}</td>
                <td>${p.telefone || '-'}</td>
                <td>${p.endereco || '-'}</td>
                <td>R$ ${Number(p.valor_total).toFixed(2)}</td>
                <td>${itens}</td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table>`;
    container.innerHTML = tableHtml;
}

// ==========================
// CARREGAR PRODUTOS
// ==========================
async function carregarProdutos() {
    const container = document.getElementById('lista-produtos');
    container.innerHTML = "Carregando inventário...";

    const { data, error } = await _supabase
        .from('produtos')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        container.innerHTML = "Erro ao carregar produtos.";
        return;
    }

    let html = `<div class="produtos-grid">`;

    data.forEach(prod => {
        html += `
            <div class="produto-card">
                <div class="linha-campos">
                    <div class="campo">
                        <label>Nome:</label>
                        <input type="text" id="nome-${prod.id}" value="${prod.nome}" class="input-edit">
                    </div>
                    <div class="campo">
                        <label>Preço (R$):</label>
                        <input type="number" step="0.01" id="price-${prod.id}" value="${prod.preco}" class="input-edit">
                    </div>
                    <div class="campo">
                        <label>URL da Imagem:</label>
                        <input type="text" id="img-${prod.id}" value="${prod.imagem_url || ''}" class="input-edit">
                    </div>
                    <div class="campo">
                        <label>Descrição:</label>
                        <input type="text" id="desc-${prod.id}" value="${prod.descricao || ''}" placeholder="Ex: Algodão 100%" class="input-edit">
                    </div>
                </div>

                <img src="${prod.imagem_url}" class="preview-img" onerror="this.src='https://via.placeholder.com/150'">

                <button onclick="atualizarProduto(${prod.id})" class="btn-save">
                    SALVAR
                </button>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// ==========================
// ATUALIZAR PRODUTO
// ==========================
async function atualizarProduto(id) {
    const nome = document.getElementById(`nome-${id}`).value;
    const preco = parseFloat(document.getElementById(`price-${id}`).value);
    const imagem = document.getElementById(`img-${id}`).value;
    const descricao = document.getElementById(`desc-${id}`).value;

    const { error } = await _supabase
        .from('produtos')
        .update({
            nome: nome,
            preco: preco,
            imagem_url: imagem,
            descricao: descricao
        })
        .eq('id', id);

    if (error) {
        alert("Erro ao salvar: " + error.message);
    } else {
        alert(`Produto "${nome}" atualizado com sucesso!`);
        carregarProdutos();
    }
}

// ==========================
// TEMPO REAL - PEDIDOS
// ==========================
_supabase
    .channel('pedidos-em-tempo-real')
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        () => carregarPedidos()
    )
    .subscribe();

// ==========================
// INICIALIZAÇÃO
// ==========================
window.onload = () => {
    carregarPedidos();
    carregarProdutos(); // já carrega produtos também
};
