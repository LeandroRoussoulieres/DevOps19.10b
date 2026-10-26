pipeline {
    agent any
    
    parameters {
        choice(
            name: 'DESTINO',
            choices: ['HOMOLOGACAO', 'PRODUCAO'],
            description: 'Ambiente para o qual o lote será preparado.'
        )
    }
    
    options {
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }
    
    environment {
        APP_NAME = 'lote-auxilios-ci'
        AUDIT_FILE = 'dist/auditoria.json'
        RELEASE_FILE = 'dist/lote-liberado.json'
    }
    
    stages {
        stage('1. Sincronizar código') {
            steps {
                checkout scm
                sh '''
                echo "COMMIT=$(git rev-parse HEAD)"
                echo "MENSAGEM=$(git log -1 --pretty=%s)"
                '''
            }
        }
        
        stage('2. Validar lote') {
            steps {
                sh 'npm run validate'
            }
        }
        
        stage('3. Executar testes') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('4. Gerar auditoria') {
            steps {
                sh 'rm -rf dist'
                sh 'npm run audit'
            }
        }
        
        stage('5. Quality Gate financeiro') {
            steps {
                sh 'npm run gate'
            }
        }
        
        stage('6. Revisar evidências') {
            steps {
                sh 'cat "$AUDIT_FILE"'
                sh 'sha256sum data/lote.json "$RELEASE_FILE"'
            }
        }
        
        stage('7. Aprovação para produção') {
            when {
                expression { params.DESTINO == 'PRODUCAO' }
            }
            steps {
                input message: 'Confirma a liberação deste lote para PRODUÇÃO?', ok: 'LIBERAR LOTE'
            }
        }
        
        stage('8. Publicar lote') {
            when {
                expression { params.DESTINO == 'PRODUCAO' }
            }
            steps {
                sh '''
                mkdir -p release
                cp "$RELEASE_FILE" "release/lote-${BUILD_NUMBER}.json"
                cp "$AUDIT_FILE" "release/auditoria-${BUILD_NUMBER}.json"
                ls -lh release
                '''
                archiveArtifacts artifacts: 'release/**', fingerprint: true
            }
        }
        
        stage('9. Arquivar homologação') {
            when {
                expression { params.DESTINO == 'HOMOLOGACAO' }
            }
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
    }
    
    post {
        success {
            echo "PROCESSO APROVADO destino=${params.DESTINO}"
        }
        failure {
            echo 'PROCESSO REPROVADO lote não liberado'
        }
        aborted {
            echo 'PROCESSO CANCELADO nenhuma liberação realizada'
        }
        always {
            echo "RESULTADO FINAL: ${currentBuild.currentResult}"
        }
    }
}
