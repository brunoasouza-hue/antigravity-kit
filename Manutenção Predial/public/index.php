<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Ponto de Entrada / Tela de Login Dinâmica
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';

// Se já estiver logado, redireciona diretamente para a tela inicial Home
if (isset($_SESSION['usuario_id'])) {
    header("Location: " . BASE_URL . "/public/views/home.php");
    exit;
}

$erro = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $auth = new AuthController();
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';
    
    if ($auth->login($email, $senha)) {
        header("Location: " . BASE_URL . "/public/views/home.php");
        exit;
    } else {
        $erro = $_SESSION['auth_error'] ?? 'Erro de login.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SENAI MANUTENÇÃO</title>
    
    <!-- Estilização, BootstrapIcons e Favicon -->
    <link rel="stylesheet" href="./assets/css/style.css">
    <link rel="stylesheet" href="./assets/css/modal.css">
    <link rel="stylesheet" href="./assets/css/login.css">
    <link rel="stylesheet" href="./assets/css/global.css">
    <link rel="stylesheet" href="./assets/css/bootstrap-icons.min.css">
    <link rel="shortcut icon" href="./assets/img/favicon.ico" type="image/x-icon">

    <!-- Biblioteca das Particulas -->
    <script src="./assets/js/particles.min.js"></script>
</head>

<body class="body_login">

    <div class="login-bg">
        <!-- Canvas para efeito de partículas vermelhas de fundo -->
        <div id="particles-js"></div>
        
        <div class="login-box">
            <form class="login-form" action="" method="POST">
                <div class="div-img">
                    <img src="./assets/img/senailogo.png" alt="Logo Senai" id="senai-logo" style="width: 70%;">
                </div>

                <!-- Exibe mensagem de erro caso as credenciais estejam erradas -->
                <?php if (!empty($erro)): ?>
                    <div style="background-color: rgba(252, 35, 35, 0.15); border: 1px solid #fc2323; padding: 12px; border-radius: 10px; margin-bottom: 20px; text-align: center; color: #ca2525; font-size: 14px; font-family: 'TASA Orbiter', sans-serif;">
                        <i class="bi bi-exclamation-triangle-fill" style="margin-right: 5px;"></i> <?php echo htmlspecialchars($erro); ?>
                    </div>
                <?php endif; ?>

                <div class="div-inputs-chefe">
                    <div class="div-input">
                        <i class="bi bi-envelope-fill"></i>
                        <input type="email" id="email" name="email" placeholder="E-mail" class="input" required autocomplete="email">
                    </div>
                    <div class="div-input">
                        <i class="bi bi-shield-fill"></i>
                        <input type="password" id="senha" name="senha" placeholder="Senha" class="input" required autocomplete="current-password">
                        <button type="button" onclick="showPass()" id="btnEyeLogin" class="btnEsp">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                    </div>

                    <div class="div-btn">
                        <button type="submit" class="btn">Entrar <i class="bi bi-box-arrow-in-right"></i></button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Carregando scripts adicionais -->
    <script src="./assets/js/scripts.js" defer></script>
    <script>
        // Função utilitária local para exibir/esconder a senha
        function showPass() {
            var inputSenha = document.getElementById("senha");
            var btnEye = document.getElementById("btnEyeLogin");
            if (inputSenha.type === "password") {
                inputSenha.type = "text";
                btnEye.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
            } else {
                inputSenha.type = "password";
                btnEye.innerHTML = '<i class="bi bi-eye-fill"></i>';
            }
        }

        // Configuração das Partículas Vermelhas do Senai no Fundo
        particlesJS("particles-js", {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#ff2b2b"
                },
                shape: {
                    type: "circle"
                },
                opacity: {
                    value: 0.5
                },
                size: {
                    value: 3,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ff2b2b",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2.5,
                    direction: "none",
                    out_mode: "out"
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    </script>
</body>
</html>
