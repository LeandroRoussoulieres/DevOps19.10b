pipeline {
    agent any
    parameters {
        choice(name: 'ATRASO_PUBLICACAO', choices: ['0', '20', '45'], description: 'Segundos usados para observar o controle de concorrência.')
    }
    options {
        timestamps()
        timeout(time: 12, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds(abortPrevious: true)
    }
    environment {
        APP_NAME = 'portal-resultados-ci'
        DIST_DIR = 'dist'
    }
    stages {
        stage('1. Sincronizar código') {
            steps {
                checkout scm
                sh '''
                    echo "COMMIT COMPLETO=$(git rev-parse HEAD)"
                    echo "COMMIT_CURTO=$(git rev-parse --short HEAD)"
                    echo "ULTIMO COMMIT=$(git log -1 --pretty=format:'%h | %an | %s')"
                    git status --short
                '''
            }
        }
        stage('2. Diagnosticar ambiente') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'find . -maxdepth 2 -type f | sort'
            }
        }
        stage('3. Validar dados') { steps { sh 'npm run validate:data' } }
        stage('4. Executar testes') { steps { sh 'npm test' } }
        stage('5. Sincronizar versões') { steps { sh 'npm run check:version' } }
        stage('6. Gerar publicação') {
            steps {
                sh 'rm -rf "$DIST_DIR"'
                sh 'npm run build'
                sh 'npm run manifest'
            }
        }
        stage('7. Quality Gate') { steps { sh 'npm run gate' } }
        stage('8. Janela de publicação') {
            steps {
                script {
                    int seconds = params.ATRASO_PUBLICACAO.toInteger()
                    echo "Recurso de publicação reservado por ${seconds}s"
                    sleep time: seconds, unit: 'SECONDS'
                }
            }
        }
        stage('9. Arquivar evidências') {
            steps { archiveArtifacts artifacts: 'dist/**', fingerprint: true }
        }
    }
    post {
        success { echo "PUBLICAÇÃO APROVADA ${APP_NAME} #${BUILD_NUMBER}" }
        failure { echo "PUBLICAÇÃO BLOQUEADA consulte o estágio e o Console Output" }
        aborted { echo 'EXECUÇÃO ABORTADA uma revisão mais recente assumiu o processo' }
        always { echo "RESULTADO FINAL: ${currentBuild.currentResult}" }
    }
}