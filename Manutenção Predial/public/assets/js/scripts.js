// Interceptor global do Fetch API para lidar com expiração de sessão e redirecionamento (Opção B)
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    try {
        const response = await originalFetch(...args);
        
        // Se a resposta foi redirecionada para a tela de login (index.php ou AuthController)
        if (response.redirected && (response.url.includes('index.php') || response.url.includes('login') || response.url.includes('AuthController'))) {
            window.location.reload();
            return response;
        }

        // Se o status da resposta for 401 (Não Autorizado) ou 403 (Proibido)
        if (response.status === 401 || response.status === 403) {
            window.location.reload();
            return response;
        }

        // Caso a resposta retorne HTML contendo a tela de login (expiração silenciosa)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            const clone = response.clone();
            const text = await clone.text();
            if (text.includes('login-form') || text.includes('index.php') || text.includes('<!DOCTYPE') || text.includes('verificarAutenticacao')) {
                window.location.reload();
            }
        }

        return response;
    } catch (error) {
        console.error('Fetch global interceptor error:', error);
        throw error;
    }
};

// Carrega o Ultimo tema salvo no LocalStorage e define uma saudação de acordo com a hora do dia.
window.onload = () => {
    // Se tiver tema no LocalStorage eu pego ele se não coloca "claro" mesmo
    let tema = localStorage.getItem('tema') || 'claro';

    // Definindo atributo "data-tema" com valor da minha variavel tema
    document.documentElement.setAttribute("data-tema", tema);

    // Isso é para mudar o icone dos btns, mas tive que colocar uma condicional para verificar se eles existem ou não
    // Serve também para mudar a logo do senai
    let btnTema = document.getElementById("tema");
    let imgSenai = document.getElementById("senai-logo");
    let imgSenai2 = document.getElementById("senai-logo2");
    if (tema == 'escuro') {
        if (imgSenai != undefined) {
            imgSenai.src = 'assets/imgs/senaiEscuro.png';
        }
        if (imgSenai2 != undefined) {
            imgSenai2.src = '../../assets/imgs/senailogo2.png';
        }
        if (btnTema != undefined) {
            document.getElementById("tema").innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
        }
    } else {
        if (imgSenai != undefined) {
            imgSenai.src = 'assets/imgs/senailogo.png';

        }
        if (imgSenai2 != undefined) {
            imgSenai2.src = '../../assets/imgs/senailogo2.png';
        }
        if (btnTema != undefined) {
            document.getElementById("tema").innerHTML = '<i class="bi bi-brightness-high-fill"></i>';
        }
    }

    let local_txt = document.getElementById("msg_especial");

    // Mudar a mensagem de boas vindas com base no horario do dia 
    if (local_txt != undefined) {
        let data = new Date();
        let hora = data.getHours();
        // console.log(hora);

        if (hora >= 6 && hora < 12) {
            local_txt.innerHTML = "<strong style='color: var(--corBase)'>Bom Dia</strong>";
        } else if (hora >= 12 && hora < 18) {
            local_txt.innerHTML = "<strong style='color: var(--corBase)'>Boa Tarde</strong>";
        } else if (hora >= 18) {
            local_txt.innerHTML = "<strong style='color: var(--corBase)'>Boa Noite</strong>";
        } else {
            local_txt.innerHTML = "<strong style='color: var(--corBase)'>Olá</strong>";
        }
    }

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        const dropdownUsuario = document.getElementById('dropdown-usuario');
        const avatar = document.querySelector('.avatar');

        if (dropdownUsuario && !dropdownUsuario.contains(e.target) && !avatar.contains(e.target)) {
            dropdownUsuario.classList.remove('ativo');
        }
    });

    // Lógica migrada do nr12rework
    var placeholderQuebra = document.querySelectorAll(".quebraMobile");
    var sizeWidth = window.innerWidth;
    if (sizeWidth <= 720) {
        if (placeholderQuebra != undefined) {
            for (let i = 0; i < placeholderQuebra.length; i++) {
                placeholderQuebra[i].style.display = "flex";
                placeholderQuebra[i].style.flexDirection = "column";
            }
        }
    }

    startRealTimeClock();

    // Lógica da Sidebar (Refatorada com Persistência em LocalStorage)
    const arrow = document.getElementById("fechar-nav");
    const body = document.body;

    // Recupera o estado persistido da sidebar (se não existir, por padrão desktop fica aberto/não colapsado)
    const sidebarCollapsed = localStorage.getItem('sidebar-collapsed');
    
    if (window.innerWidth > 768) {
        if (sidebarCollapsed === 'true') {
            body.classList.add('sidebar-collapsed');
            if (arrow) {
                arrow.innerHTML = '<i class="bi bi-arrow-right-circle-fill"></i>';
            }
        } else {
            body.classList.remove('sidebar-collapsed');
            if (arrow) {
                arrow.innerHTML = '<i class="bi bi-arrow-left-circle-fill"></i>';
            }
        }
    }

    if (arrow) {
        arrow.addEventListener('click', () => {
            body.classList.toggle('sidebar-collapsed');
            
            const isCollapsed = body.classList.contains('sidebar-collapsed');
            localStorage.setItem('sidebar-collapsed', isCollapsed ? 'true' : 'false');
            
            if (isCollapsed) {
                arrow.innerHTML = '<i class="bi bi-arrow-right-circle-fill"></i>';
            } else {
                arrow.innerHTML = '<i class="bi bi-arrow-left-circle-fill"></i>';
            }
        });
    }

    // Inserção Dinâmica do Botão Hamburger (Mobile/Tablet) desativada a pedido do usuário
    /*
    const divHeader = document.querySelector('.div-header');
    const isHomePage = window.location.pathname.endsWith('home.php') || document.querySelector('.home-cards-grid');
    if (divHeader && !document.getElementById('mobile-sidebar-toggle') && !isHomePage) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'mobile-sidebar-toggle';
        toggleBtn.className = 'mobile-toggle-btn';
        toggleBtn.setAttribute('aria-label', 'Menu de Navegação');
        toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
        
        // Insere o botão de toggle como primeiro elemento no cabeçalho
        divHeader.insertBefore(toggleBtn, divHeader.firstChild);
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            body.classList.toggle('sidebar-open');
        });
    }
    */

    // Backdrop/Scrim dinâmico para a sidebar no mobile
    if (!document.querySelector('.sidebar-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
        
        backdrop.addEventListener('click', () => {
            body.classList.remove('sidebar-open');
        });
    }

    // Fechar a sidebar mobile se clicar fora dela
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.getElementById('mobile-sidebar-toggle');
        if (body.classList.contains('sidebar-open') && sidebar && !sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
            body.classList.remove('sidebar-open');
        }
    });

    // Gestos de Deslize (Swipe) para fechar a sidebar mobile facilmente
    let touchStartX = 0;
    let touchEndX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        // Deslizar para a esquerda (mínimo de 60px) fecha o menu
        if (body.classList.contains('sidebar-open') && (touchStartX - touchEndX > 60)) {
            body.classList.remove('sidebar-open');
        }
    }, { passive: true });

    // ==========================================
    // LÓGICA DE SUBMENUS EXPANSÍVEIS (ACCORDION)
    // ==========================================
    const btnManutencao = document.getElementById("btn-manutencao");
    const btnInspecoes = document.getElementById("btn-inspecoes");
    const menuManutencao = document.querySelector(".menu-manutencao");
    const menuInspecoes = document.querySelector(".menu-inspecoes");
    const submenuManutencao = document.getElementById("submenu-manutencao");
    const submenuInspecoes = document.getElementById("submenu-inspecoes");

    // Função auxiliar para fechar Manutenção
    function fecharManutencao() {
        if (menuManutencao) menuManutencao.classList.remove("aberto");
        if (submenuManutencao) {
            submenuManutencao.classList.remove("aberto");
            submenuManutencao.style.display = "none";
        }
    }

    // Função auxiliar para fechar Inspeções
    function fecharInspecoes() {
        if (menuInspecoes) menuInspecoes.classList.remove("aberto");
        if (submenuInspecoes) {
            submenuInspecoes.classList.remove("aberto");
            submenuInspecoes.style.display = "none";
        }
    }

    if (btnManutencao) {
        btnManutencao.addEventListener("click", (e) => {
            e.preventDefault();
            if (body.classList.contains('sidebar-collapsed')) {
                body.classList.remove('sidebar-collapsed');
                localStorage.setItem('sidebar-collapsed', 'false');
                if (arrow) arrow.innerHTML = '<i class="bi bi-arrow-left-circle-fill"></i>';
            }

            const estaAberto = menuManutencao.classList.contains("aberto");
            if (estaAberto) {
                fecharManutencao();
            } else {
                fecharInspecoes(); // Accordion: fecha o outro
                menuManutencao.classList.add("aberto");
                if (submenuManutencao) {
                    submenuManutencao.classList.add("aberto");
                    submenuManutencao.style.display = "flex";
                }
            }
        });
    }

    if (btnInspecoes) {
        btnInspecoes.addEventListener("click", (e) => {
            e.preventDefault();
            if (body.classList.contains('sidebar-collapsed')) {
                body.classList.remove('sidebar-collapsed');
                localStorage.setItem('sidebar-collapsed', 'false');
                if (arrow) arrow.innerHTML = '<i class="bi bi-arrow-left-circle-fill"></i>';
            }

            const estaAberto = menuInspecoes.classList.contains("aberto");
            if (estaAberto) {
                fecharInspecoes();
            } else {
                fecharManutencao(); // Accordion: fecha o outro
                menuInspecoes.classList.add("aberto");
                if (submenuInspecoes) {
                    submenuInspecoes.classList.add("aberto");
                    submenuInspecoes.style.display = "flex";
                }
            }
        });
    }

    // Auto-expande o menu correspondente baseado na URL da página atual ao carregar
    const path = window.location.pathname;
    if (path.includes("preventivas.php") || path.includes("corretivas.php")) {
        fecharInspecoes();
        if (menuManutencao) menuManutencao.classList.add("aberto");
        if (submenuManutencao) {
            submenuManutencao.classList.add("aberto");
            submenuManutencao.style.display = "flex";
        }
    } else if (path.includes("inspecoes_seguranca.php")) {
        fecharManutencao();
        if (menuInspecoes) menuInspecoes.classList.add("aberto");
        if (submenuInspecoes) {
            submenuInspecoes.classList.add("aberto");
            submenuInspecoes.style.display = "flex";
        }
    }
}

// Garante que a data apareça mesmo com defer
document.addEventListener('DOMContentLoaded', startRealTimeClock);

// Função para exibir a data atual
function startRealTimeClock() {
    const clockElement = document.getElementById("current-date-time");
    if (!clockElement) return;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    clockElement.innerHTML = `<i class="bi bi-calendar3"></i> ${day}/${month}/${year}`;
}

// Muda a visibilidade do campo "senha" 
function showPass() {
    // Coleto e armazenos o Btn do Olho e o Input de Senha

    let eye = document.getElementById("btnEyeLogin");
    let inputPass = document.getElementById("senha");

    if (inputPass.type == "text") {
        inputPass.type = "password";
        eye.innerHTML = '<i class="bi bi-eye-fill"></i>';
    } else {
        inputPass.type = "text";
        eye.innerHTML = '<i class="bi bi-eye-slash"></i>';
    }
}

// Muda o icone de sol pra lua com base no tema da pagina, além de armazenar no localStorage e mudar o tema em sí
function changeTheme() {
    let tema_atual = document.documentElement.getAttribute("data-tema")
    let imgSenai2 = document.getElementById("senai-logo2");

    if (tema_atual == "escuro") {
        localStorage.removeItem('tema');
        document.documentElement.setAttribute("data-tema", "claro");
        document.getElementById("tema").innerHTML = '<i class="bi bi-brightness-high-fill"></i>';
        localStorage.setItem('tema', 'claro');
        imgSenai2.src = '../../assets/imgs/senailogo2';
        if (imgSenai2 != undefined) {
            imgSenai2.src = '../../assets/imgs/senailogo2.png';
        }
    } else {
        localStorage.removeItem('tema');
        document.documentElement.setAttribute("data-tema", "escuro");
        document.getElementById("tema").innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
        localStorage.setItem('tema', 'escuro');
        if (imgSenai2 != undefined) {
            imgSenai2.src = '../../assets/imgs/senailogo2.png';
        }
    }
}

// Muda o icone da porta
function changeSairBtn(oc) {
    let btnSair = document.querySelector(".sair");
    if (oc == "open") {
        btnSair.innerHTML = 'Sair <i class="bi bi-door-open-fill"></i>';
    } else {
        btnSair.innerHTML = 'Sair <i class="bi bi-door-closed-fill"></i>';
    }
}

function closeModal(qual) {
    if (qual == 'acesso') {
        document.getElementById('acesso').style.display = 'none';
        // Seria Legal tirar o ?acesso=negado dps que fechar
    } else if (qual == 'adicaoUser') {
        document.getElementById('adicaoUser').style.display = 'none';

    } else if (qual == 'adicaoTipoMaquina') {
        document.getElementById('adicaoTipoMaquina').style.display = 'none';
    } else if (qual == 'edicaoTipoMaquina') {
        document.getElementById('edicaoTipoMaquina').style.display = 'none';
    } else if (qual == 'dellTipoMaquina') {
        document.getElementById('dellTipoMaquina').style.display = 'none';
    } else if (qual == "notificacao-modal") {
        document.getElementById('notificacao-modal').style.display = 'none';
        document.querySelector('.modal-notificacao').style.display = 'none';
    } else if (qual == 'dell') {
        document.getElementById('dell').style.display = 'none';
    } else if (qual == 'dellMachine') {
        document.getElementById('dellMachine').style.display = 'none';
    } else if (qual == 'modalAcessorios') {
        document.getElementById('modalAcessorios').style.display = 'none';
    } else if (qual == 'modalFAQ') {
        document.getElementById('modalFAQ').style.display = 'none';
    } else if (qual == 'corretiva') {
        document.getElementById('corretiva').style.display = 'none';
    } else if (qual == 'preventiva') {
        document.getElementById('preventiva').style.display = 'none';
    } else if (qual == 'resetPass') {
        document.getElementById('resetPass').style.display = 'none';
    } else if (qual == 'corretiva') {
        document.getElementById('corretiva').style.display = 'none';
    } else if (qual == 'preventiva') {
        document.getElementById('preventiva').style.display = 'none';
    } else if (qual == "view") {
        document.getElementById("view").style.display = "none";
    } else if (qual == "anexos") {
        document.getElementById("anexos").style.display = "none";
    } else if (qual == "sucesso") {
        document.getElementById("sucesso").style.display = "none";
    } else if (qual == 'modalHistorico') {
        document.getElementById('modalHistorico').style.display = 'none';
    } else if (qual == 'novaOS') {
        document.getElementById('novaOS').style.display = 'none';
    } else if (qual == 'detalheOS') {
        document.getElementById('detalheOS').style.display = 'none';
    } else if (qual == 'historicoOS') {
        document.getElementById('historicoOS').style.display = 'none';
    } else if (qual == 'encaminharOS') {
        document.getElementById('encaminharOS').style.display = 'none';
    } else if (qual == 'aceitarOSModal') {
        document.getElementById('aceitarOSModal').style.display = 'none';
    } else if (qual == 'arquivarOSModal') {
        document.getElementById('arquivarOSModal').style.display = 'none';
    } else if (qual == 'recusarOSModal') {
        document.getElementById('recusarOSModal').style.display = 'none';
    } else if (qual == 'modalPesquisaMaquina') {
        document.getElementById('modalPesquisaMaquina').style.display = 'none';
    }
}

function exibirSucesso(mensagem) {
    const msgElement = document.getElementById("sucesso-msg");
    if (msgElement) {
        msgElement.innerText = mensagem;
        showModal('sucesso');
    } else {
        alert(mensagem); // Fallback caso o modal não exista na página
    }
}

function showModal(qual, id) {
    if (qual == "adicaoUser") {
        document.getElementById(qual).style.display = "flex";
    } else if (qual == "edicaoUser") {
        editarUsuario(id);
    } else if (qual == "adicaoMachine") {
        document.getElementById(qual).style.display = "flex";
    } else if (qual == "maquinasLote") {
        document.getElementById("maquinasLote").style.display = "flex";
        document.getElementById("adicaoMachine").style.display = "none";
    } else if (qual == "adicaoMotor") {
        document.getElementById(qual).style.display = "flex";
    } else if (qual == "editarMotor") {
        editarMotor(id);
    } else if (qual == "deletarMotor") {
        document.getElementById("dellMotor").style.display = "flex";
        document.getElementById("id_motor_del").value = id;
    } else if (qual == "desativarMotor") {
        document.getElementById("desativarMotorModal").style.display = "flex";
        document.getElementById("id_motor_confirm").value = id;
    } else if (qual == "ativarMotor") {
        document.getElementById("ativarMotorModal").style.display = "flex";
        document.getElementById("id_motor_ativar_confirm").value = id;
    } else if (qual == "adicaoTipoMaquina") {
        document.getElementById(qual).style.display = "flex";
    } else if (qual == "edicaoTipoMaquina") {
        editarTipoMaquina(id);
    } else if (qual == "deletarTipoMaquina") {
        document.getElementById("dellTipoMaquina").style.display = "flex";
        document.getElementById("id_tipma_del").value = id;
    } else if (qual == "desativarTipMa") {
        document.getElementById("desativarTipMaModal").style.display = "flex";
        document.getElementById("id_tipma_confirm").value = id;
    } else if (qual == "ativarTipMa") {
        document.getElementById("ativarTipMaModal").style.display = "flex";
        document.getElementById("id_tipma_ativar_confirm").value = id;
    } else if (qual == "notificacao-modal") {
        document.getElementById(qual).style.display = "flex";
        document.querySelector('.modal-notificacao').style.display = 'flex';
        carregarNotificacoes();
    } else if (qual == 'dell') {
        document.getElementById('dell').style.display = 'flex';
        document.getElementById("id_usuario").value = id;

    } else if (qual == 'resetPass') {
        const modal = document.getElementById('resetPass');
        // Define o ID no input hidden para o JavaScript saber quem atualizar
        document.getElementById("id_usuario_reset_confirm").value = id;
        // Abre a modal de confirmação
        modal.style.display = 'flex';

    } else if (qual == 'dellMachine') {
        document.getElementById('dellMachine').style.display = 'flex';
        document.getElementById("id_maquina_del").value = id;
    } else if (qual == 'modalAcessorios') {
        document.getElementById('modalAcessorios').style.display = 'flex';
        carregarAcessorios(id); // Call function to load data
    } else if (qual == 'corretiva') {
        document.getElementById('corretiva').style.display = 'flex';
    } else if (qual == 'preventiva') {
        document.getElementById('preventiva').style.display = 'flex';
    } else if (qual == 'view') {
        document.getElementById('view').style.display = 'flex';
    } else if (qual == "modalFAQ") {
        document.getElementById('modalFAQ').style.display = 'flex';

    } else if (qual == "anexos") {
        document.getElementById("anexos").style.display = "flex";
    } else if (qual == 'novaOS') {
        document.getElementById('novaOS').style.display = 'flex';
    } else if (qual == 'detalheOS') {
        document.getElementById('detalheOS').style.display = 'flex';
    } else if (qual == 'historicoOS') {
        document.getElementById('historicoOS').style.display = 'flex';
    } else if (qual == 'encaminharOS') {
        document.getElementById('encaminharOS').style.display = 'flex';
    } else if (qual == 'aceitarOSModal') {
        document.getElementById('aceitarOSModal').style.display = 'flex';
    } else if (qual == 'arquivarOSModal') {
        document.getElementById('arquivarOSModal').style.display = 'flex';
    } else if (qual == 'recusarOSModal') {
        document.getElementById('recusarOSModal').style.display = 'flex';
    } else if (qual == 'modalPesquisaMaquina') {
        document.getElementById('modalPesquisaMaquina').style.display = 'flex';
    } else if (qual == 'observacaoOSModal') {
        document.getElementById('observacaoOSModal').style.display = 'flex';
    } else if (qual == "sucesso") {
        document.getElementById("sucesso").style.display = "flex";
    }
}

function editarMotor(id) {
    fetch('../actions/motors/get_motor.php?id=' + id)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                document.getElementById('edit_idmotor').value = data.idmotor;
                document.getElementById('edit_motor_fabricante').value = data.motor_fabricante;
                document.getElementById('edit_motor_modelo').value = data.motor_modelo;
                document.getElementById('edit_motor_potencia').value = data.motor_potencia;
                document.getElementById('edit_motor_tensao').value = data.motor_tensão;
                document.getElementById('edit_motor_corrente').value = data.motor_corrente;
                document.getElementById('edit_motor_status').value = data.motor_status;
                document.getElementById('editarMotor').style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao buscar dados do motor.');
        });
}

function excluirMotor(id, acao = 'deletar') {
    fetch('../actions/motors/delete_motor.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'id=' + id + '&acao=' + acao
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('pendingSuccessMessage', data.message);
                location.reload();
            } else {
                alert('Erro: ' + (data.message || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar a solicitação.');
        });
}

function editarTipoMaquina(id) {
    fetch('../actions/descricao_maquina/get_descricao_maquina.php?id=' + id)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                document.getElementById('edit_idtipomaquina').value = data.idtipomaquina;
                document.getElementById('edit_tipomaquina_nome').value = data.tipomaquina_nome;
                document.getElementById('edit_tipomaquina_arquivo').value = data.tipomaquina_arquivo;
                document.getElementById('edit_tipomaquina_status').value = data.tipomaquina_status;
                document.getElementById('edicaoTipoMaquina').style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao buscar dados da descrição de máquina.');
        });
}

function excluirTipoMaquina(id, acao = 'deletar') {
    fetch('../actions/descricao_maquina/delete_descricao_maquina.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'id=' + id + '&acao=' + acao
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('pendingSuccessMessage', data.message);
                location.reload();
            } else {
                alert('Erro: ' + (data.message || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar a solicitação.');
        });
}

// botoes de tema | notificação e suas respectivas animações ou funcionalidades

const notificacao = document.getElementById("notificacao");
// const fechar = document.getElementById("fechar-modal");

if (notificacao != undefined) {
    notificacao.addEventListener('mouseover', () => {
        notificacao.style.animation = 'animTremendo 0.25s linear';
    })

    notificacao.addEventListener('mouseout', () => {
        notificacao.style.animation = 'none';
    })
}



//oque?
function excluir(qual, id) {
    if (qual == 'usuario') {
        fetch('../actions/user/delete_users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'id=' + id
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    sessionStorage.setItem('pendingSuccessMessage', 'Usuário excluído com sucesso!');
                    location.reload();
                } else { //hey vamos separar a logica função para cada excluir, acho melhor e seguro
                    alert('Erro ao excluir usuário: ' + (data.message || 'Erro desconhecido'));
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao processar a solicitação.');
            });
    } else if (qual == 'maquina') {
        fetch('../actions/machines/delete_machines.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'id=' + id
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na rede ou arquivo não encontrado');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);


                if (data.success === true) {
                    sessionStorage.setItem('pendingSuccessMessage', data.message);
                    location.reload();
                } else {
                    alert('Erro: ' + (data.message || 'Erro desconhecido'));
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao processar a solicitação. Verifique o console (F12).');
            });
    }
}

function editarUsuario(id) {
    fetch('../actions/user/get_user.php?id=' + id)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                document.getElementById('edit_user_id').value = data.id;
                document.getElementById('edit_user_nome').value = data.nome;
                document.getElementById('edit_user_email').value = data.email;
                document.getElementById('edit_user_permissao').value = data.permissao;
                document.getElementById('edicaoUser').style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao buscar dados do usuário.');
        });
}

function editarMaquina(id) {
    // Busca os dados da máquina
    fetch('../actions/machines/get_machine.php?id=' + id)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Preenche o formulário
                document.getElementById('edit_id').value = data.id;
                document.getElementById('edit_denominacao').value = data.denominacao;
                document.getElementById('edit_marca').value = data.marca;
                document.getElementById('edit_modelo').value = data.modelo;
                document.getElementById('edit_numero_identificacao').value = data.numero_identificacao;
                document.getElementById('edit_ano_fabricacao').value = data.ano_fabricacao;
                document.getElementById('edit_setor').value = data.setor;

                // Limpa e preenche a tabela de inspeção
                const tbody = document.querySelector("#table-edit-inspection tbody");
                tbody.innerHTML = "";

                if (data.checklist && data.checklist.length > 0) {
                    data.checklist.forEach(item => {
                        adicionarNovaLinhaEdit(item.item_verificacao, item.frequencia, item.id);
                    });
                } else {
                    adicionarNovaLinhaEdit(); // Adiciona uma linha vazia se não houver itens
                }

                // Abre o modal
                document.getElementById('edicaoMachine').style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao buscar dados da máquina.');
        });
}

function excluirMaquina(id) {
    fetch('../actions/machines/delete_machines.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'id=' + id
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ou arquivo não encontrado');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);


            if (data.success === true) {
                sessionStorage.setItem('pendingSuccessMessage', data.message);
                location.reload();
            } else {
                alert('Erro: ' + (data.message || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar a solicitação. Verifique o console (F12).');
        });
}

function adicionarNovaLinhaEdit(atividade = "", frequencia = "mensal", id = "") {
    const tbody = document.querySelector("#table-edit-inspection tbody");
    const novaLinha = document.createElement("tr");
    const index = tbody.children.length + 1;

    novaLinha.innerHTML = `
        <td class="index-numero">${index}</td>
        <td>
            <input type="hidden" name="id_item[]" value="${id}">
            <input type="text" name="atividade[]" placeholder="Novo item de inspeção..." value="${atividade}">
        </td>
        <td>
            <select name="freq[]">
                <option value="mensal" ${frequencia === 'mensal' ? 'selected' : ''}>MENSAL</option>
                <option value="semestral" ${frequencia === 'semestral' ? 'selected' : ''}>SEMESTRAL</option>
                <option value="trimestral" ${frequencia === 'trimestral' ? 'selected' : ''}>TRIMESTRAL</option>
                <option value="anual" ${frequencia === 'anual' ? 'selected' : ''}>ANUAL</option>
                <option value="bianual" ${frequencia === 'bianual' ? 'selected' : ''}>BIANUAL</option>
            </select>
        </td>
        <td>
            <button type="button" class="btn-trash2" onclick="removerLinhaEdit(this)">
                <i class="bi bi-trash-fill"></i>
            </button>
        </td>
    `;

    tbody.appendChild(novaLinha);
    atualizarNumeracaoEdit();
}

function removerLinhaEdit(botao) {
    const linha = botao.closest("tr");
    linha.remove();
    atualizarNumeracaoEdit();
}

function atualizarNumeracaoEdit() {
    const linhas = document.querySelectorAll("#table-edit-inspection tbody tr");

    linhas.forEach((linha, index) => {
        const celulaNumero = linha.querySelector(".index-numero");
        if (celulaNumero) {
            celulaNumero.textContent = index + 1;
        }
    });
}


const btnAddInspecao = document.getElementById("addInspectionItemBtn");

if (btnAddInspecao) {
    btnAddInspecao.addEventListener("click", function () {
        adicionarNovaLinha();
    });
}

function adicionarNovaLinha() {
    const tbody = document.querySelector("#table-add-inspection tbody");
    const novaLinha = document.createElement("tr");

    novaLinha.innerHTML = `
        <td class="index-numero"></td>
        <td>
            <input type="text" name="atividade[]" placeholder="Novo item de inspeção...">
        </td>
        <td>
            <select name="freq[]">
                <option value="mensal">MENSAL</option>
                <option value="semestral">SEMESTRAL</option>
                <option value="trimestral">TRIMESTRAL</option>
                <option value="anual">ANUAL</option>
                <option value="bianual">BIANUAL</option>
            </select>
        </td>
        <td>
            <button type="button" class="btn-trash2" onclick="removerLinha(this)">
                <i class="bi bi-trash-fill"></i>
            </button>
        </td>
    `;

    tbody.appendChild(novaLinha);
    atualizarNumeracao();
}

function removerLinha(botao) {
    const linha = botao.closest("tr");
    const totalLinhas = document.querySelectorAll("#table-add-inspection tbody tr").length;

    if (totalLinhas > 1) {
        linha.remove();
        atualizarNumeracao();
    } else {
        linha.querySelector("input").value = "";
        alert("É necessário ter pelo menos um item de inspeção.");
    }
}

function atualizarNumeracao() {
    const linhas = document.querySelectorAll("#table-add-inspection tbody tr");

    linhas.forEach((linha, index) => {
        const celulaNumero = linha.querySelector(".index-numero");
        if (celulaNumero) {
            celulaNumero.textContent = index + 1;
        }
    });
}

function LimparTabela() {
    const iconeLixeira = document.querySelector('lixeira');

    iconeLixeira.addEventListener('click', function () {
        let tabela = document.querySelectorAll("#table-add-inspection tbody tr");

        if (confirm("Tem certeza realmente que quer realmente excluir tudo? ")) {
            tabela.innerHTML = "";

            adicionarNovaLinha()
        }
    });
}

const btnLimparTudo = document.getElementById("lixeira");

if (btnLimparTudo) {
    btnLimparTudo.addEventListener("click", function () {
        if (confirm("Tem certeza que deseja remover TODOS os itens de inspeção?")) {
            const tbody = document.querySelector("#table-add-inspection tbody");
            tbody.innerHTML = "";
            adicionarNovaLinha();
        }
    });
}

/* Script de mudar tabela */


document.addEventListener("DOMContentLoaded", function () {
    const registrosPorPagina = 10;

    const btnAnterior = document.getElementById("btn-ant");
    const btnProximo = document.getElementById("btn-prox");

    if (!btnAnterior || !btnProximo) return; // Nenhum controle de paginação nesta página

    // Lista de possíveis tbodies usados nas páginas
    const tabelasPossiveis = [
        "tabela-usuarios",
        "tabela-maquinas",
        "tabela-logs",
        "tabela-preventiva",
        "tabela-os-body",
        "tabela-descricao_maquinas"
    ];

    // Encontra a primeira tabela presente na página
    const tabelaAtivaId = tabelasPossiveis.find(id => document.getElementById(id));
    if (!tabelaAtivaId) return;

    function setupPagination(tbody) {
        let paginaAtual = 1;
        let linhas = Array.from(tbody.getElementsByTagName("tr"));

        function totalPaginas() {
            return Math.max(1, Math.ceil(linhas.length / registrosPorPagina));
        }

        function mostrarPagina(pagina) {
            paginaAtual = Math.min(Math.max(1, pagina), totalPaginas());
            const inicio = (paginaAtual - 1) * registrosPorPagina;
            const fim = inicio + registrosPorPagina;

            linhas.forEach((linha, index) => {
                linha.style.display = (index >= inicio && index < fim) ? "" : "none";
            });

            atualizarBotoes();
        }

        function atualizarBotoes() {
            if (paginaAtual === 1) {
                btnAnterior.style.opacity = "0.3";
                btnAnterior.disabled = true;
                btnAnterior.style.pointerEvents = "none";
            } else {
                btnAnterior.style.opacity = "1";
                btnAnterior.disabled = false;
                btnAnterior.style.pointerEvents = "auto";
            }

            if (paginaAtual >= totalPaginas()) {
                btnProximo.style.opacity = "0.3";
                btnProximo.disabled = true;
                btnProximo.style.pointerEvents = "none";
            } else {
                btnProximo.style.opacity = "1";
                btnProximo.disabled = false;
                btnProximo.style.pointerEvents = "auto";
            }
        }

        function refresh() {
            // Coleta apenas as linhas que não foram ocultas pela pesquisa ou filtro
            linhas = Array.from(tbody.querySelectorAll("tr")).filter(tr => 
                !tr.classList.contains('hidden-by-filter') && 
                !tr.querySelector('td[colspan]')
            );
            
            if (paginaAtual > totalPaginas()) paginaAtual = totalPaginas();
            mostrarPagina(1); // Volta para a primeira página ao filtrar
        }

        // Escuta o evento de filtro para atualizar a paginação
        document.addEventListener('tabelaFiltrada', () => {
            refresh();
        });

        return { mostrarPagina, refresh, next() { mostrarPagina(paginaAtual + 1); }, prev() { mostrarPagina(paginaAtual - 1); } };
    }

    const tbody = document.getElementById(tabelaAtivaId);
    const pager = setupPagination(tbody);

    btnAnterior.addEventListener("click", function () {
        if (typeof pager.prev === 'function') pager.prev();
    });

    btnProximo.addEventListener("click", function () {
        if (typeof pager.next === 'function') pager.next();
    });

    // Mostra primeira página ao carregar
    if (pager && typeof pager.mostrarPagina === 'function') pager.mostrarPagina(1);

    // Se houver pesquisa que esconde/mostra linhas, escutamos por input no campo `pesquisa` para atualizar paginação
    const inputPesquisa = document.getElementById('pesquisa');
    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', function () {
            // Pequeno timeout para deixar o filtro aplicar antes de recalcular
            setTimeout(() => { if (pager && typeof pager.refresh === 'function') pager.refresh(); }, 50);
        });
    }
});

function excluirUser(id) {
    fetch('../actions/user/delete_users.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'id=' + id
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('pendingSuccessMessage', 'Usuário excluído com sucesso!');
                location.reload();
            } else {
                alert('Erro ao excluir usuário: ' + (data.message || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar a solicitação.');
        });
}

function resetarSenha(id) {
    window.location.href = '../actions/user/reset_password.php?id=' + id;
}

// Função para abrir a segunda modal de reset de senha
function abrirModalSenha(id) {
    // Fecha a primeira modal
    closeModal('resetPass');

    // Define o ID no campo hidden da segunda modal
    document.getElementById('id_usuario_modal').value = id;

    // Limpa os campos de senha
    document.getElementById('nova_senha').value = "";
    document.getElementById('confirmar_senha').value = "";

    // Abre a segunda modal
    document.getElementById('modalResetPass2').style.display = 'flex';
}

// Funções para Modal de Acessórios

function carregarAcessorios(idMaquina) {
    document.getElementById('acessorio_maquina_id').value = idMaquina;
    document.getElementById('acessorio_maquina_nome').innerText = 'Carregando...';

    const tbody = document.querySelector('#table-acessorios tbody');
    tbody.innerHTML = ''; // Limpar tabela

    fetch(`../actions/machines/get_accessories.php?id=${idMaquina}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('acessorio_maquina_nome').innerText = `${data.maquina.denominacao} - ${data.maquina.modelo}`;

                if (data.acessorios.length > 0) {
                    data.acessorios.forEach(acc => {
                        adicionarAcessorio(acc);
                    });
                } else {
                    adicionarAcessorio(); // Adicionar uma linha vazia se não houver registros
                }
            } else {
                alert('Erro ao carregar acessórios: ' + data.message);
                closeModal('modalAcessorios');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao buscar dados.');
        });
}

function adicionarAcessorio(dados = null) {
    const tbody = document.querySelector('#table-acessorios tbody');
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td><input type="text" class="acc-denominacao" placeholder="Ex: Placa 4 castanhas" value="${dados ? dados.denominacao : ''}"></td>
        <td><input type="text" class="acc-aplicacao" placeholder="Ex: Peças irregulares" value="${dados ? dados.aplicacao : ''}"></td>
        <td><input type="text" class="acc-caracteristicas" placeholder="Opcional" value="${dados ? dados.caracteristicas : ''}"></td>
        <td><input type="text" class="acc-ni" placeholder="Opcional" value="${dados ? dados.numero_identificacao : ''}"></td>
        <td class="text-center">
            <button type="button" class="btn-trash2" onclick="removerLinhaAcessorio(this)"><i class="bi bi-trash-fill"></i></button>
        </td>
    `;
    tbody.appendChild(tr);
}

function removerLinhaAcessorio(btn) {
    const row = btn.closest('tr');
    row.remove();
}

function salvarAcessorios() {
    const idMaquina = document.getElementById('acessorio_maquina_id').value;
    const rows = document.querySelectorAll('#table-acessorios tbody tr');
    let listaAcessorios = [];

    rows.forEach(row => {
        const denominacao = row.querySelector('.acc-denominacao').value;
        const aplicacao = row.querySelector('.acc-aplicacao').value;
        const caracteristicas = row.querySelector('.acc-caracteristicas').value;
        const ni = row.querySelector('.acc-ni').value;

        if (denominacao.trim() !== "") {
            listaAcessorios.push({
                denominacao: denominacao,
                aplicacao: aplicacao,
                caracteristicas: caracteristicas,
                ni: ni
            });
        }
    });

    fetch('../actions/machines/save_accessories.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_maquina: idMaquina,
            acessorios: listaAcessorios
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                exibirSucesso('Acessórios salvos com sucesso!');
                closeModal('modalAcessorios');
            } else {
                alert('Erro ao salvar: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar a solicitação.');
        });
}

function openHistory(maquinaNome, maquinaId) {
    document.getElementById('modalHistorico').style.display = 'flex';
    document.getElementById('hist_maquina_nome').innerText = 'Carregando...';

    const tbody = document.querySelector('#tabelaHistorico tbody');
    tbody.innerHTML = '<tr><td colspan="3">Carregando dados...</td></tr>';

    fetch(`../actions/maintenance/get_history.php?id=${maquinaId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('hist_maquina_nome').innerText = `${data.machine.denominacao} - ${data.machine.modelo}`;
                tbody.innerHTML = '';

                if (data.history.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3">Nenhum histórico encontrado para esta máquina.</td></tr>';
                } else {
                    data.history.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td style="text-align: left;">${item.item_verificacao}</td>
                            <td>${item.usuario_nome || 'Sistema/Desconhecido'}</td>
                            <td>${item.data_formatada}</td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            } else {
                tbody.innerHTML = `<tr><td colspan="3" class="text-danger">${data.message}</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            tbody.innerHTML = '<tr><td colspan="3" class="text-danger">Erro ao carregar histórico via rede.</td></tr>';
        });
}


/**
 * Função genérica para aplicar múltiplos filtros (Busca + Status)
 */
function aplicarFiltrosTabela(config) {
    const { tbodyId, selectId, inputId, statusAttr = 'data-status', colIndex = -1 } = config;
    
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const termo = document.getElementById(inputId)?.value.toLowerCase().trim() || '';
    const filtroStatus = document.getElementById(selectId)?.value.toLowerCase().trim() || 'todos';

    const linhas = Array.from(tbody.querySelectorAll('tr')).filter(tr => !tr.querySelector('td[colspan]'));
    let visiveis = 0;

    linhas.forEach(linha => {
        const texto = linha.textContent.toLowerCase();
        let statusLinha = '';

        if (colIndex >= 0) {
            statusLinha = linha.getElementsByTagName('td')[colIndex]?.textContent.toLowerCase().trim() || '';
        } else {
            statusLinha = linha.getAttribute(statusAttr)?.toLowerCase().trim() || '';
        }

        const matchBusca = termo === '' || texto.includes(termo);
        const matchStatus = filtroStatus === 'todos' || statusLinha === filtroStatus || (filtroStatus === 'abertas' && (statusLinha === 'em aberto' || statusLinha === 'aguardando aprovação'));

        if (matchBusca && matchStatus) {
            linha.style.display = '';
            linha.classList.remove('hidden-by-filter');
        } else {
            linha.style.display = 'none';
            linha.classList.add('hidden-by-filter');
        }
    });

    // Dispara evento para paginação
    document.dispatchEvent(new CustomEvent('tabelaFiltrada'));
}

function filtrarOS() {
    // Para a tela de O.S., se o usuário quer carregar do banco por aba, mantemos o trocarAba
    // Mas se for apenas filtro visual de linhas já carregadas:
    aplicarFiltrosTabela({
        tbodyId: 'tabela-os-body',
        selectId: 'select-filtro-os',
        inputId: 'pesquisa-os',
        colIndex: 5 // Coluna Status
    });
}

function filtrarPreventiva() {
    aplicarFiltrosTabela({
        tbodyId: 'tabela-maquinas-body',
        selectId: 'select-filtro-preventiva',
        inputId: 'pesquisa',
        statusAttr: 'data-status'
    });
}

function filtrarMaquinas() {
    aplicarFiltrosTabela({
        tbodyId: 'tabela-usuarios', // ID estranho mas é o que está no HTML
        selectId: 'select-filtro-maquinas',
        inputId: 'pesquisa',
        colIndex: 7 // Coluna Status (se houver)
    });
}

/**
 * Função genérica para pesquisa em tempo real nas tabelas
 */
/**
 * SISTEMA DE PESQUISA UNIFICADO (V2)
 * Filtra qualquer tabela em tempo real e gerencia o estado visual do campo.
 */
function inicializarPesquisaUnificada() {
    const inputsPesquisa = document.querySelectorAll('input[name="search"], #pesquisa, .input-pesquisa');

    inputsPesquisa.forEach(input => {
        const box = input.closest('.page-search-box') || input.closest('.box-pesquisa');
        
        // Função para atualizar o estado do box (mostrar/esconder "X")
        const atualizarEstado = () => {
            if (box) {
                if (input.value.trim() !== "") {
                    box.classList.add('has-content');
                } else {
                    box.classList.remove('has-content');
                }
            }
        };

        // Evento de input para filtragem em tempo real
        input.addEventListener('input', function() {
            atualizarEstado();
            
            // Busca a tabela ativa (geralmente a .tabela-main ou a definida no contexto)
            const termo = this.value.toLowerCase().trim();
            const tabelaBody = document.querySelector('.tabela-main tbody, .checklist-table tbody, .custom-table tbody');
            
            if (tabelaBody) {
                const linhas = Array.from(tabelaBody.querySelectorAll('tr')).filter(tr => !tr.querySelector('td[colspan]'));
                
                linhas.forEach(linha => {
                    const texto = linha.textContent.toLowerCase();
                    if (termo === '' || texto.includes(termo)) {
                        linha.style.display = '';
                        linha.classList.remove('hidden-by-filter');
                    } else {
                        linha.style.display = 'none';
                        linha.classList.add('hidden-by-filter');
                    }
                });

                // Dispara evento para que a paginação se recalcule (se existir)
                document.dispatchEvent(new CustomEvent('tabelaFiltrada'));
            }
        });

        // Inicializa o estado (caso já venha preenchido pelo PHP)
        atualizarEstado();

        // Gerencia o botão de limpar (se existir)
        const clearBtn = box?.querySelector('.page-clear-btn, .btn-clear-search');
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                // Se for um link (<a>), o PHP cuida do reload. 
                // Se for um botão, limpamos via JS.
                if (this.tagName !== 'A') {
                    e.preventDefault();
                    input.value = '';
                    input.dispatchEvent(new Event('input'));
                    input.focus();
                }
            });
        }
    });
}

// Inicializa ao carregar a página
document.addEventListener('DOMContentLoaded', inicializarPesquisaUnificada);

const hoje = new Date();

function openChecklist(nome, id) {
    document.getElementById('nome_maquina_checklist').innerText = nome;
    document.getElementById('id_maquina_checklist').value = id;
    document.getElementById('modalPreventiva').style.display = 'flex';

    // Carregar itens via AJAX
    fetch(`../actions/maintenance/get_checklist.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#tabelaChecklist tbody');
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Nenhum item de checklist cadastrado para esta máquina.</td></tr>';
                return;
            }

            data.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-freq', item.frequencia);
                tr.setAttribute('data-item-id', item.id);
                tr.setAttribute('data-next-date', item.proxima_data_iso); // Adicionando data para cálculo
                // Status da linha
                let status = 'OK';
                // Lógica de status (repetida do PHP/JS)
                // Usar item.proxima_data_iso para comparar

                tr.innerHTML = `
                    <td class="text-center font-weight-bold">${index + 1}</td>
                    <td>${item.item_verificacao}</td>
                    <td class="text-center"><span class="badge-freq badge-${item.frequencia}">${item.frequencia}</span></td>
                    <td class="text-center">${item.ultima_data}</td>
                    <td class="text-center"><span class="highlight-target">${item.proxima_data}</span></td>
                    <td>
                        <div class="btn-check" onclick="toggleCheck(this)"><i class="bi bi-check-lg"></i></div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            processarDestaquesDeData();
        })
        .catch(err => console.error('Erro ao carregar checklist:', err));
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function toggleCheck(el) {
    el.classList.toggle('active');
}

function processarDestaquesDeData() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const seteDias = new Date(hoje);
    seteDias.setDate(hoje.getDate() + 7);

    document.querySelectorAll('#tabelaChecklist tbody tr').forEach(row => {
        // data-next-date deve ser adicionado na criação da linha
        const nextDateIso = row.getAttribute('data-next-date');
        const targetSpan = row.querySelector('.highlight-target');

        if (!nextDateIso) return;

        const dataPrev = new Date(nextDateIso + 'T00:00:00');
        targetSpan.classList.remove('highlight-red', 'highlight-yellow');

        if (dataPrev < hoje) {
            targetSpan.classList.add('highlight-red');
            row.setAttribute('data-status', 'VENCIDOS');
        } else if (dataPrev <= seteDias) {
            targetSpan.classList.add('highlight-yellow');
            row.setAttribute('data-status', 'PROXIMOS');
        } else {
            row.setAttribute('data-status', 'OK');
        }
    });
}

function aplicarFiltrosChecklist() {
    const ciclo = document.getElementById('selectCiclo').value;
    const rows = document.querySelectorAll('#tabelaChecklist tbody tr');

    rows.forEach(row => {
        const rowFreq = row.getAttribute('data-freq');
        // Filtro simplificado apenas por ciclo por enquanto
        if (ciclo === 'TODOS' || rowFreq === ciclo) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function limparFiltros() {
    document.getElementById('selectCiclo').value = 'TODOS';
    document.getElementById('selectStatus').value = 'TODOS';
    aplicarFiltrosChecklist();
}

function filtrarListaPrincipal(status) {
    const rows = document.querySelectorAll('#mainTable tbody tr');
    rows.forEach(row => {
        if (status === 'todos' || row.getAttribute('data-status') === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function finalizarPreventiva() {
    const maquinaId = document.getElementById('id_maquina_checklist').value;
    const obs = document.getElementById('obs_preventiva').value;

    const itensChecked = [];
    document.querySelectorAll('#tabelaChecklist tbody tr').forEach(row => {
        const check = row.querySelector('.btn-check');
        if (check.classList.contains('active')) {
            itensChecked.push(row.getAttribute('data-item-id'));
        }
    });

    if (itensChecked.length === 0) {
        alert('Selecione pelo menos um item verificado.');
        return;
    }

    fetch('../actions/maintenance/save_preventiva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            maquina_id: maquinaId,
            itens: itensChecked,
            observacoes: obs
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('pendingSuccessMessage', 'Manutenção registrada com sucesso!');
                closeModal('modalPreventiva');
                location.reload(); // Recarregar para atualizar status
            } else {
                alert('Erro ao salvar: ' + data.message);
            }
        })
        .catch(err => console.error('Erro:', err));
}

window.onclick = function (event) {
    if (event.target.classList.contains('modal-fundo') && event.target.id !== 'changePassword') {
        closeModal(event.target.id);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sucessoUrl = urlParams.get('sucesso');
    const pendingMsg = sessionStorage.getItem('pendingSuccessMessage');

    if (pendingMsg) {
        exibirSucesso(pendingMsg);
        sessionStorage.removeItem('pendingSuccessMessage');
    } else if (sucessoUrl) {
        exibirSucesso(sucessoUrl);
        // Opcional: remover o parâmetro da URL sem recarregar
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
});

/**
 * Carrega as notificações (Ordens de Serviço Pendentes) via AJAX
 */
async function carregarNotificacoes() {
    const lista = document.getElementById('notificacoes-lista');
    if (!lista) return;

    lista.innerHTML = `
        <div style="text-align: center; padding: 30px; opacity: 0.6;">
            <i class="bi bi-hourglass-split" style="font-size: 2rem;"></i>
            <p style="margin-top: 10px;">Carregando notificações...</p>
        </div>`;

    try {
        // Usamos listar_os.php com a aba 'abertas' que já traz o que precisamos
        // Caminho relativo — funciona independente do diretório raiz
        const basePath = window.location.pathname.substring(0, window.location.pathname.indexOf('/manutencao/') + '/manutencao/'.length);
        const res = await fetch(`${basePath}php/actions/os/listar_os.php?aba=abertas`);
        const data = await res.json();

        if (data.success && data.dados.length > 0) {
            lista.innerHTML = data.dados.map(os => `
                <div class="noti-item" onclick="window.location.href='${basePath}php/views/gerencias_os.php?os_id=${os.id}'" 
                     style="padding: 15px; border-bottom: 1px solid var(--corBordas); cursor: pointer; transition: 0.2s; position: relative;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(252, 35, 35, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="bi bi-exclamation-circle" style="color: var(--corBase); font-size: 1.2rem;"></i>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 700; color: var(--corTxt3); font-size: 0.9rem; margin-bottom: 2px;">Nova O.S. #${os.id}</div>
                            <div style="font-size: 0.8rem; color: var(--corTxt3); opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${os.descricao}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--corBase); font-weight: 600; margin-top: 4px;">
                                <i class="bi bi-clock"></i> ${new Date(os.criado_em).toLocaleString('pt-BR')}
                            </div>
                        </div>
                        <i class="bi bi-chevron-right" style="opacity: 0.3;"></i>
                    </div>
                    <div class="noti-badge" style="position: absolute; top: 15px; right: 15px; width: 8px; height: 8px; border-radius: 50%; background: var(--corBase);"></div>
                </div>
            `).join('');
        } else {
            lista.innerHTML = `
                <div style="text-align: center; padding: 40px; opacity: 0.5;">
                    <i class="bi bi-check2-all" style="font-size: 2.5rem; color: #28a745;"></i>
                    <p style="margin-top: 10px; font-weight: 600;">Tudo em dia!</p>
                    <p style="font-size: 0.85rem;">Você não possui notificações pendentes.</p>
                </div>`;
        }

        // Atualiza o contador no nav se houver
        const dot = document.querySelector('.div-noti');
        if (dot && data.contadores) {
            dot.textContent = data.contadores.abertas || 0;
            dot.style.display = data.contadores.abertas > 0 ? 'flex' : 'none';
        }

    } catch (err) {
        console.error('Erro ao carregar notificações:', err);
        lista.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--corBase);">
                <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                <p style="margin-top: 10px;">Erro ao carregar notificações.</p>
            </div>`;
    }
}
