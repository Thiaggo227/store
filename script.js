// ==========================
// CONFIGURAÇÃO SUPABASE
// ==========================
const supabaseUrl = 'https://uqutpnljzqinpqufufql.supabase.co'; 
const supabaseKey = 'sb_publishable_9ZFZPSQwU0cYow5HdkpQJw_L9hgRrWl'; 
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ==========================
// MENU HAMBÚRGUER
// ==========================
const menuIcon = document.getElementById("menu-icon");
const menu = document.getElementById("menu");

menuIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.classList.toggle("active");
  menuIcon.classList.toggle("bi-list");
  menuIcon.classList.toggle("bi-x");
});

document.addEventListener("click", (e) => {
  if (menu.classList.contains("active") && !menu.contains(e.target) && !menuIcon.contains(e.target)) {
    menu.classList.remove("active");
    menuIcon.classList.remove("bi-x");
    menuIcon.classList.add("bi-list");
  }
});

// ==========================
// CARRINHO
// ==========================
let cardAtual = null;
let carrinho = [];

const contadorCarrinho = document.getElementById("contadorCarrinho");

// Inicializa o badge sempre com 0
contadorCarrinho.style.display = "inline";
contadorCarrinho.textContent = "0";
contadorCarrinho.style.cssText = `
  background:#00b81c;
  color:#fff;
  font-weight:bold;
  font-size:12px;
  padding:2px 6px;
  border-radius:50%;
  position:relative;
  top:-10px;
  left:-5px;
`;

function atualizarBadgeCarrinho() {
  contadorCarrinho.textContent = carrinho.length; // 0 ou quantidade de itens
}

function converterValor(texto) {
  return parseFloat(texto.replace("R$", "").replace(",", ".").trim());
}

function calcularTotalCarrinho() {
  return carrinho.reduce((soma, item) => soma + item.valor, 0);
}

function fecharTodosModais() {
  document.querySelectorAll(".modalTamanho, .modalCompra, .modalCarrinho").forEach((m) => m.classList.remove("ativo"));
}

// ==========================
// MODAL TAMANHO
// ==========================
const modalTamanho = document.createElement("div");
modalTamanho.className = "modalTamanho";
modalTamanho.innerHTML = `
<div class="modalTamanhoConteudo">
  <span class="fecharTamanho">&times;</span>
  <h2 id="tituloTamanho"></h2>
  <div class="tamanhos">
    <button>P</button><button>M</button><button>G</button><button>GG</button><button>XG</button>
  </div>
</div>`;
document.body.appendChild(modalTamanho);

const fecharTamanho = modalTamanho.querySelector(".fecharTamanho");
const tituloTamanho = modalTamanho.querySelector("#tituloTamanho");

function abrirModalTamanho(nome, card) {
  cardAtual = card;
  fecharTodosModais();
  tituloTamanho.textContent = nome;
  modalTamanho.classList.add("ativo");
}

fecharTamanho.onclick = () => modalTamanho.classList.remove("ativo");

modalTamanho.querySelectorAll(".tamanhos button").forEach((btn) => {
  btn.onclick = () => {
    const tamanho = btn.textContent;
    cardAtual.dataset.tamanhoSelecionado = tamanho;
    tamanhoInput.value = tamanho;
    cardAtual.querySelector(".btnTamanho").innerHTML = `TAMANHO ${tamanho} <i class="bi bi-x-circle removerTamanho"></i>`;
    modalTamanho.classList.remove("ativo");
  };
});

// ==========================
// MODAL COMPRA
// ==========================
const modalCompra = document.createElement("div");
modalCompra.className = "modalCompra";
modalCompra.innerHTML = `
<div class="modalCompraConteudo">
  <span class="fecharCompra">&times;</span>
  <h2>Finalize sua compra</h2>
  <p id="valorProduto" style="font-weight:bold"></p>
  <form id="formCompra">
    <input type="text" name="nome" placeholder="Nome completo" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="text" name="endereco" placeholder="Endereço e Número" required>
    <input type="text" name="cep" placeholder="CEP" required>
    <input type="tel" name="telefone" placeholder="Telefone" required>
    <select id="formaPagamento" required>
      <option value="">Forma de pagamento</option>
      <option value="pix">Pix</option>
      <option value="cartao">Cartão crédito</option>
      <option value="cartao">Cartão débito</option>
      <option value="dinheiro">Dinheiro</option>
    </select>
    <div id="areaTroco" style="display:none;">
      <input type="number" id="valorPago" placeholder="Valor pago">
      <p id="trocoTexto"></p>
    </div>
    <input type="hidden" id="tamanhoSelecionado">
    <button type="submit" class="btnFinalizarCarrinho">Finalizar compra</button>
  </form>
</div>`;
document.body.appendChild(modalCompra);

const fecharCompra = modalCompra.querySelector(".fecharCompra");
const valorProduto = modalCompra.querySelector("#valorProduto");
const formCompra = modalCompra.querySelector("#formCompra");
const formaPagamento = modalCompra.querySelector("#formaPagamento");
const areaTroco = modalCompra.querySelector("#areaTroco");
const valorPago = modalCompra.querySelector("#valorPago");
const trocoTexto = modalCompra.querySelector("#trocoTexto");
const tamanhoInput = modalCompra.querySelector("#tamanhoSelecionado");

function atualizarValorCompra() {
  let total = carrinho.length > 0 ? calcularTotalCarrinho() : (cardAtual ? converterValor(cardAtual.querySelector(".pValor").textContent) : 0);
  valorProduto.textContent = `Valor total: R$ ${total.toFixed(2).replace(".", ",")}`;
  return total;
}

function abrirModalCompra() {
  fecharTodosModais();
  atualizarValorCompra();
  modalCompra.classList.add("ativo");
}

fecharCompra.onclick = () => modalCompra.classList.remove("ativo");

formaPagamento.onchange = () => {
  areaTroco.style.display = formaPagamento.value === "dinheiro" ? "block" : "none";
};

// ==========================
// MODAL CARRINHO
// ==========================
const modalCarrinho = document.createElement("div");
modalCarrinho.className = "modalCarrinho";
modalCarrinho.innerHTML = `
<div class="modalCarrinhoConteudo">
  <span class="fecharCarrinho">&times;</span>
  <h2>Seu Carrinho</h2>
  <ul id="listaCarrinho"></ul>
  <h3 id="totalCarrinho">Total: R$ 0,00</h3>
  <p id="carrinhoVazioTexto" style="display:none;font-weight:bold;">Carrinho vazio</p>
  <button id="finalizarCarrinho" class="btnFinalizarCarrinho">Finalizar compra</button>
</div>`;
document.body.appendChild(modalCarrinho);

const btnAbrirCarrinho = document.querySelector(".btnCar");
const listaCarrinho = modalCarrinho.querySelector("#listaCarrinho");
const totalCarrinho = modalCarrinho.querySelector("#totalCarrinho");
const fecharCarrinho = modalCarrinho.querySelector(".fecharCarrinho");
const btnFinalizar = modalCarrinho.querySelector("#finalizarCarrinho");

function atualizarCarrinho() {
  listaCarrinho.innerHTML = "";
  if (carrinho.length === 0) {
    totalCarrinho.textContent = "Total: R$ 0,00";
    btnFinalizar.style.display = "none";
    modalCarrinho.querySelector("#carrinhoVazioTexto").style.display = "block";
  } else {
    btnFinalizar.style.display = "block";
    modalCarrinho.querySelector("#carrinhoVazioTexto").style.display = "none";
    let total = 0;
    carrinho.forEach((item, i) => {
      total += item.valor;
      const li = document.createElement("li");
      li.innerHTML = `${item.nome} — ${item.tamanho} — ${item.valorTexto} <button class="removerItem" data-index="${i}">❌</button>`;
      listaCarrinho.appendChild(li);
    });
    totalCarrinho.textContent = `Total: R$ ${total.toFixed(2).replace(".", ",")}`;
  }
  atualizarBadgeCarrinho();
}

btnAbrirCarrinho.onclick = () => { atualizarCarrinho(); modalCarrinho.classList.add("ativo"); };
fecharCarrinho.onclick = () => modalCarrinho.classList.remove("ativo");
btnFinalizar.onclick = () => { modalCarrinho.classList.remove("ativo"); abrirModalCompra(); };

modalCarrinho.addEventListener("click", (e) => {
  if (e.target.classList.contains("removerItem")) {
    carrinho.splice(e.target.dataset.index, 1);
    atualizarCarrinho();
  }
});

// ==========================
// EVENTOS DE COMPRA E CARRINHO
// ==========================
document.addEventListener("click", (e) => {
  const btnTamanho = e.target.closest(".btnTamanho");
  if (btnTamanho && !e.target.classList.contains("removerTamanho")) {
    const card = btnTamanho.closest(".box, .mid");
    abrirModalTamanho(card.querySelector(".pBox").textContent, card);
    return;
  }

  if (e.target.classList.contains("removerTamanho")) {
    const card = e.target.closest(".box, .mid");
    delete card.dataset.tamanhoSelecionado;
    card.querySelector(".btnTamanho").innerHTML = `VER TAMANHOS <i class="bi bi-star"></i>`;
    return;
  }

  const btnBuy = e.target.closest(".btnBuy");
  if (btnBuy) {
    cardAtual = btnBuy.closest(".box, .mid");
    abrirModalCompra();
    return;
  }

  const btnCart = e.target.closest(".btnCart");
  if (btnCart) {
    const card = btnCart.closest(".box, .mid");
    const tamanho = card.dataset.tamanhoSelecionado;
    if (!tamanho) { mostrarMensagem("Escolha o tamanho!", "#d9534f"); return; }

    carrinho.push({
      nome: card.querySelector(".pBox").textContent,
      tamanho,
      valor: converterValor(card.querySelector(".pValor").textContent),
      valorTexto: card.querySelector(".pValor").textContent
    });

    mostrarMensagem("Adicionado ao carrinho", "#00b81c");
    atualizarBadgeCarrinho();
  }
});

// ==========================
// FINALIZAR COMPRA (SUPABASE)
// ==========================
formCompra.onsubmit = async (e) => {
  e.preventDefault();
  
  const total = atualizarValorCompra();
  const dadosPedido = {
    cliente_nome: formCompra.nome.value,
    cliente_email: formCompra.email.value,
    endereco: formCompra.endereco.value,
    cep: formCompra.cep.value,
    telefone: formCompra.telefone.value,
    forma_pagamento: formaPagamento.value,
    valor_total: total
  };

  try {
    const { data: pedido, error: erroPed } = await _supabase.from('pedidos').insert([dadosPedido]).select();
    if (erroPed) throw erroPed;

    const itens = (carrinho.length > 0 ? carrinho : [{
      nome: cardAtual.querySelector(".pBox").textContent,
      tamanho: cardAtual.dataset.tamanhoSelecionado,
      valor: converterValor(cardAtual.querySelector(".pValor").textContent)
    }]).map(item => ({
      pedido_id: pedido[0].id,
      produto_nome: item.nome,
      tamanho: item.tamanho,
      preco_unitario: item.valor
    }));

    const { error: erroItens } = await _supabase.from('itens_pedido').insert(itens);
    if (erroItens) throw erroItens;

    mostrarMensagem("Compra realizada com sucesso!", "#00b81c");
    carrinho = [];
    atualizarCarrinho();
    modalCompra.classList.remove("ativo");
    formCompra.reset();
  } catch (error) {
    console.error("Erro ao salvar no banco:", error);
    mostrarMensagem("Erro: " + error.message, "#d9534f");
  }
};

// ==========================
// FUNÇÃO MENSAGEM
// ==========================
function mostrarMensagem(texto, cor) {
  const msg = document.createElement("span");
  msg.textContent = texto;
  msg.style.cssText = `
    position:fixed;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    padding:8px 16px;
    background:#00b81c;
    color:#fff;
    font-weight:bold;
    font-size:12px;
    border-radius:0px;
    z-index:9999;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 1500);
}

// ==========================
// PRODUTOS DO BANCO
// ==========================
async function carregarProdutosSite() {
  const container = document.getElementById("produtos");
  const { data, error } = await _supabase.from("produtos").select("*");

  if (error) { console.error("Erro ao carregar produtos:", error); return; }

  container.innerHTML = "";

  data.forEach(prod => {
    const card = document.createElement("div");
    card.className = "box";

    card.innerHTML = `
      <img src="${prod.imagem_url}" class="imgShop">
      <p class="pBox">${prod.nome}</p>
      <p class="pValor">R$ ${prod.preco.toFixed(2)}</p>
      <button class="btnTamanho">VER TAMANHOS</button>
      <button class="btnBuy">COMPRAR</button>
      <button class="btnCart">ADD CARRINHO</button>
    `;

    container.appendChild(card);
  });
}

// ==========================
// MODAL ADMIN
// ==========================
const btnAdm = document.getElementById("btnAdm");
const modalAdm = document.getElementById("modalAdm");
const fecharAdm = modalAdm.querySelector(".fecharAdm");
const entrarAdm = document.getElementById("entrarAdm");
const usuarioAdmInput = document.getElementById("usuarioAdm");
const senhaAdmInput = document.getElementById("senhaAdm");
const toggleSenhaAdm = document.getElementById("toggleSenhaAdm");

btnAdm.addEventListener("click", () => { modalAdm.style.display = "flex"; });
fecharAdm.addEventListener("click", () => { modalAdm.style.display = "none"; });
window.addEventListener("click", (e) => { if (e.target === modalAdm) modalAdm.style.display = "none"; });

entrarAdm.addEventListener("click", async () => {
  const usuario = usuarioAdmInput.value.trim();
  const senha = senhaAdmInput.value.trim();
  if (!usuario || !senha) { alert("Preencha usuário e senha!"); return; }

  try {
    const { data, error } = await _supabase.from("admin").select("*")
      .eq("usuario", usuario).eq("senha", senha).single();

    if (error || !data) alert("Usuário ou senha incorretos!");
    else window.location.href = "adm.html";
  } catch (err) { console.error(err); alert("Erro ao validar login."); }
});

// ==========================
// TOGGLE SENHA ADMIN
// ==========================
toggleSenhaAdm.addEventListener("click", () => {
  const tipo = senhaAdmInput.type === "password" ? "text" : "password";
  senhaAdmInput.type = tipo;
  toggleSenhaAdm.className = tipo === "password" ? "bi bi-eye" : "bi bi-eye-slash";
});

// ==========================
// CARREGAR PRODUTOS AO ABRIR O SITE
// ==========================
window.onload = carregarProdutosSite;
